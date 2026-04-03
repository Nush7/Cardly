
// Best practice: Load environment variables at the entry point (e.g., index.ts or server.ts) using dotenv.
// Only import and configure dotenv here if you are running this file directly (for testing/debugging),
// otherwise, assume dotenv is loaded in the main entry point.
if (process.env.NODE_ENV !== 'production' && !process.env.LLM_PROVIDER) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
}

import { IQuizQuestion } from '../models/quiz.model';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Cerebras from '@cerebras/cerebras_cloud_sdk';


// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
const MAX_TOKENS_PER_CHUNK = 6000; // Conservative limit for Gemini Pro
const OVERLAP_SIZE = 300; // Overlap between chunks
const MIN_CHUNK_SIZE = 500; // Minimum meaningful chunk size

interface TextChunk {
    content: string;
    index: number;
    wordCount: number;
}

interface CerebrasCompletion {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;
let cerebrasClient: Cerebras | null = null;

if (LLM_PROVIDER === 'gemini') {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    geminiModel = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40
        }
    });
} else if (LLM_PROVIDER === 'cerebras') {
    if (!CEREBRAS_API_KEY) {
        throw new Error('CEREBRAS_API_KEY not set in environment variables');
    }
    cerebrasClient = new Cerebras({
        apiKey: CEREBRAS_API_KEY
    });
} else {
    throw new Error(`Invalid LLM_PROVIDER: ${LLM_PROVIDER}. Must be 'gemini' or 'cerebras'`);
}

// Function to estimate token count (rough approximation)
const estimateTokens = (text: string): number => {
    return Math.ceil(text.split(/\s+/).length * 1.33);
};

// Function to split text into manageable chunks
const chunkText = (text: string): TextChunk[] => {
    const words = text.split(/\s+/);
    const chunks: TextChunk[] = [];

    // If text is small enough, return as single chunk
    if (estimateTokens(text) <= MAX_TOKENS_PER_CHUNK) {
        return [{
            content: text,
            index: 0,
            wordCount: words.length
        }];
    }

    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < words.length) {
        const maxWordsInChunk = Math.floor(MAX_TOKENS_PER_CHUNK / 1.33);
        const endIndex = Math.min(currentIndex + maxWordsInChunk, words.length);

        // Find a good breaking point (end of sentence)
        let breakPoint = endIndex;
        if (endIndex < words.length) {
            for (let i = endIndex - 1; i >= currentIndex + MIN_CHUNK_SIZE / 4; i--) {
                if (words[i].endsWith('.') || words[i].endsWith('!') || words[i].endsWith('?')) {
                    breakPoint = i + 1;
                    break;
                }
            }
        }

        const chunkContent = words.slice(currentIndex, breakPoint).join(' ');

        if (chunkContent.length >= MIN_CHUNK_SIZE) {
            chunks.push({
                content: chunkContent,
                index: chunkIndex,
                wordCount: breakPoint - currentIndex
            });
            chunkIndex++;
        }

        // Move to next chunk with overlap
        currentIndex = breakPoint - Math.floor(OVERLAP_SIZE / 4);
        if (currentIndex >= breakPoint) currentIndex = breakPoint;
    }

    return chunks;
};

// Function to clean and parse JSON response
const parseGeminiResponse = (responseText: string): IQuizQuestion[] => {
    try {
        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = responseText.trim();

        // Remove markdown code blocks
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Find JSON array in the response
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        const questions = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!Array.isArray(questions)) {
            throw new Error('Response is not an array');
        }

        questions.forEach((q, index) => {
            if (!q.questionText || !Array.isArray(q.options) ||
                typeof q.correctIndex !== 'number' || !q.explanation) {
                throw new Error(`Invalid question structure at index ${index}`);
            }

            if (q.options.length !== 4) {
                throw new Error(`Question at index ${index} must have exactly 4 options`);
            }

            if (q.correctIndex < 0 || q.correctIndex >= 4) {
                throw new Error(`Invalid correctIndex at question ${index}`);
            }
        });

        return questions;
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`Failed to parse response: ${msg}`);
    }
};

// Function to generate questions from a single chunk using Gemini SDK
const generateQuestionsFromChunkGemini = async (chunk: TextChunk, questionsPerChunk: number): Promise<IQuizQuestion[]> => {
    const prompt = `
You are an expert educator and assessment designer. 

Generate EXACTLY ${questionsPerChunk} high-quality, clear, and unambiguous multiple-choice questions based on the following text chunk.

REQUIREMENTS:
- Each question must test important concepts or facts from the text
- Questions should be original and not copied verbatim from the text
- Each question must have exactly 4 plausible options (A, B, C, D)
- Only one option should be correct
- Include a detailed explanation for the correct answer
- Tag each question with difficulty: "low", "medium", or "hard"

RESPONSE FORMAT:
Return ONLY a valid JSON array with no additional text or formatting. Each object must have this exact structure:
{
  "questionText": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "string",
  "difficulty": "low"
}

TEXT CHUNK ${chunk.index + 1}:
${chunk.content}
`;

    try {
        if (!geminiModel) {
            throw new Error('Gemini model not initialized');
        }
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return parseGeminiResponse(responseText);
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`Gemini API error for chunk ${chunk.index + 1}: ${msg}`);
    }
};

// Function to generate questions from a single chunk using Cerebras SDK
const generateQuestionsFromChunkCerebras = async (chunk: TextChunk, questionsPerChunk: number): Promise<IQuizQuestion[]> => {
    const prompt = `
You are an expert educator and assessment designer. 

Generate EXACTLY ${questionsPerChunk} high-quality, clear, and unambiguous multiple-choice questions based on the following text chunk.

REQUIREMENTS:
- Each question must test important concepts or facts from the text
- Questions should be original and not copied verbatim from the text
- Each question must have exactly 4 plausible options (A, B, C, D)
- Only one option should be correct
- Include a detailed explanation for the correct answer
- Tag each question with difficulty: "low", "medium", or "hard"

RESPONSE FORMAT:
Return ONLY a valid JSON array with no additional text or formatting. Each object must have this exact structure:
{
  "questionText": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "string",
  "difficulty": "low"
}

TEXT CHUNK ${chunk.index + 1}:
${chunk.content}
`;

    try {
        if (!cerebrasClient) {
            throw new Error('Cerebras client not initialized');
        }
        
        const completion = (await cerebrasClient.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: 'llama3.1-8b',
            max_completion_tokens: 2048,
            temperature: 0.7,
            top_p: 0.8,
            stream: false
        })) as CerebrasCompletion;

        const responseText = completion.choices[0]?.message?.content || '';
        if (!responseText) {
            throw new Error('Empty response from Cerebras API');
        }

        return parseGeminiResponse(responseText);
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`Cerebras API error for chunk ${chunk.index + 1}: ${msg}`);
    }
};

// Main function to generate questions with chunking using Gemini SDK
export const generateQuestionsWithLLM = async (text: string, numQuestions: number): Promise<IQuizQuestion[]> => {
    // Validation
    if (LLM_PROVIDER === 'gemini' && !GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
    }
    
    if (LLM_PROVIDER === 'cerebras' && !CEREBRAS_API_KEY) {
        throw new Error('CEREBRAS_API_KEY not set in environment variables');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('Input text cannot be empty');
    }

    if (numQuestions <= 0) {
        throw new Error('Number of questions must be positive');
    }

    try {
        const chunks = chunkText(text);

        const allQuestions: IQuizQuestion[] = [];

        if (chunks.length === 1) {
            // Single chunk - generate all questions at once
            const questions = LLM_PROVIDER === 'gemini'
                ? await generateQuestionsFromChunkGemini(chunks[0], numQuestions)
                : await generateQuestionsFromChunkCerebras(chunks[0], numQuestions);
            allQuestions.push(...questions);
        } else {
            // Multiple chunks - distribute questions evenly
            const questionsPerChunk = Math.ceil(numQuestions / chunks.length);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const questionsNeeded = Math.min(questionsPerChunk, numQuestions - allQuestions.length);

                if (questionsNeeded <= 0) {
                    break;
                }

                try {
                    const chunkQuestions = LLM_PROVIDER === 'gemini'
                        ? await generateQuestionsFromChunkGemini(chunk, questionsNeeded)
                        : await generateQuestionsFromChunkCerebras(chunk, questionsNeeded);
                    allQuestions.push(...chunkQuestions);

                    // Add delay between API calls to avoid rate limiting
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    const msg = (error instanceof Error && error.message) ? error.message : String(error);
                    console.warn(`Failed to generate questions for chunk ${i + 1}:`, msg);
                    // Continue with other chunks instead of failing completely
                    continue;
                }
            }
        }

        // Trim to exact number requested and shuffle
        const finalQuestions = allQuestions
            .slice(0, numQuestions)
            .sort(() => Math.random() - 0.5); // Shuffle questions

        if (finalQuestions.length === 0) {
            throw new Error('No questions were generated successfully');
        }

        return finalQuestions;

    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        console.error('Error in generateQuestionsWithLLM:', msg);
        throw new Error(`Failed to generate questions: ${msg}`);
    }
};

// Alternative simpler function for smaller texts (no chunking)
export const generateQuestionsSimple = async (text: string, numQuestions: number): Promise<IQuizQuestion[]> => {
    if (LLM_PROVIDER === 'gemini' && !GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
    }
    
    if (LLM_PROVIDER === 'cerebras' && !CEREBRAS_API_KEY) {
        throw new Error('CEREBRAS_API_KEY not set in environment variables');
    }

    const prompt = `
You are an expert educator and assessment designer.

Generate ${numQuestions} high-quality, clear, and unambiguous multiple-choice questions based on the following text. 
Each question must:
- Test important concepts or facts from the text.
- Be original and not copied verbatim from the text.
- Have 4 plausible options (A, B, C, D), with only one correct answer.
- Include a detailed explanation for the correct answer.
- Be tagged with a "difficulty" field: "low", "medium", or "hard".

Return ONLY a JSON array of objects, each with this structure:
{
  "questionText": string,
  "options": string[4],
  "correctIndex": number,
  "explanation": string,
  "difficulty": "low" | "medium" | "hard"
}

Text:
${text}
`;

    try {
        if (LLM_PROVIDER === 'gemini') {
            if (!geminiModel) {
                throw new Error('Gemini model not initialized');
            }
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            return parseGeminiResponse(responseText);
        } else if (LLM_PROVIDER === 'cerebras') {
            if (!cerebrasClient) {
                throw new Error('Cerebras client not initialized');
            }
            const completion = (await cerebrasClient.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: 'llama3.1-8b',
                max_completion_tokens: 2048,
                temperature: 0.7,
                top_p: 0.8,
                stream: false
            })) as CerebrasCompletion;

            const responseText = completion.choices[0]?.message?.content || '';
            if (!responseText) {
                throw new Error('Empty response from Cerebras API');
            }

            return parseGeminiResponse(responseText);
        }

        throw new Error(`Invalid LLM provider: ${LLM_PROVIDER}`);
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`${LLM_PROVIDER} API error: ${msg}`);
    }
};