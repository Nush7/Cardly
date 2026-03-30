
// Best practice: Load environment variables at the entry point (e.g., index.ts or server.ts) using dotenv.
// Only import and configure dotenv here if you are running this file directly (for testing/debugging),
// otherwise, assume dotenv is loaded in the main entry point.
if (process.env.NODE_ENV !== 'production' && !process.env.GEMINI_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
}

import { IQuizQuestion } from '../models/quiz.model';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_TOKENS_PER_CHUNK = 6000; // Conservative limit for Gemini Pro
const OVERLAP_SIZE = 300; // Overlap between chunks
const MIN_CHUNK_SIZE = 500; // Minimum meaningful chunk size

interface TextChunk {
    content: string;
    index: number;
    wordCount: number;
}

// Initialize Gemini AI
if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set in environment variables');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Use "gemini-1.5-flash" as a fallback if "gemini-pro" is not available or causes errors
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40
    }
});

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
        throw new Error(`Failed to parse Gemini response: ${msg}`);
    }
};

// Function to generate questions from a single chunk using Gemini SDK
const generateQuestionsFromChunk = async (chunk: TextChunk, questionsPerChunk: number): Promise<IQuizQuestion[]> => {
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return parseGeminiResponse(responseText);
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`Gemini API error for chunk ${chunk.index + 1}: ${msg}`);
    }
};

// Main function to generate questions with chunking using Gemini SDK
export const generateQuestionsWithLLM = async (text: string, numQuestions: number): Promise<IQuizQuestion[]> => {
    // Validation
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('Input text cannot be empty');
    }

    if (numQuestions <= 0) {
        throw new Error('Number of questions must be positive');
    }

    console.log(`Generating ${numQuestions} questions from text of ${text.length} characters`);

    try {
        const chunks = chunkText(text);
        console.log(`Text split into ${chunks.length} chunks`);

        const allQuestions: IQuizQuestion[] = [];

        if (chunks.length === 1) {
            // Single chunk - generate all questions at once
            const questions = await generateQuestionsFromChunk(chunks[0], numQuestions);
            allQuestions.push(...questions);
        } else {
            // Multiple chunks - distribute questions evenly
            const questionsPerChunk = Math.ceil(numQuestions / chunks.length);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const questionsNeeded = Math.min(questionsPerChunk, numQuestions - allQuestions.length);

                if (questionsNeeded <= 0) break;

                console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.wordCount} words)`);

                try {
                    const chunkQuestions = await generateQuestionsFromChunk(chunk, questionsNeeded);
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

        console.log(`Successfully generated ${finalQuestions.length} questions`);

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
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return parseGeminiResponse(responseText);
    } catch (error) {
        const msg = (error instanceof Error && error.message) ? error.message : String(error);
        throw new Error(`Gemini API error: ${msg}`);
    }
};