import { useState } from 'react';
import { Upload, FileText, Wand2, Hash, Calendar, Sparkles, Zap } from 'lucide-react';
// import { generateQuiz } from '../api/quiz';
import { QuizGenerationSuccess } from './QuizGenerationSuccess';
import { generateQuiz } from '../api/quiz';

export const StudyBuilder = () => {
  const [content, setContent] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [validityDays, setValidityDays] = useState(30);
  const [dragActive, setDragActive] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log('Files dropped:', files);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('rawText', content);
      formData.append('numQuestions', questionCount.toString());
      const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
      formData.append('validUntil', validUntil);
      const quiz = await generateQuiz(formData);
      // Use the response directly from backend
      setGeneratedQuiz({
        id: quiz.id,
        title: quiz.title || content.substring(0, 40) || 'Untitled Quiz',
        questions: quiz.questions || [],
        createdAt: quiz.createdAt || new Date().toISOString(),
      });
    } catch (err) {
      console.error('Quiz generation error:', err);
      alert('Failed to generate quiz. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateAnother = () => {
    setGeneratedQuiz(null);
    setContent('');
    setQuestionCount(10);
    setValidityDays(30);
  };

  const handleGoToLibrary = () => {
    // This would be handled by the parent component to switch views
    console.log('Navigate to library');
  };

  // Show success screen after generation
  if (generatedQuiz) {
    return (
      <div className="p-8">
        <QuizGenerationSuccess
          quizData={generatedQuiz}
          onCreateAnother={handleCreateAnother}
          onGoToLibrary={handleGoToLibrary}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Study Builder</h1>
        </div>
        <p className="text-gray-400 text-lg">Transform your study material into interactive quiz cards with AI</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-8">
        {/* Content Input */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-400" />
            Study Material
          </h2>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 w-fit mx-auto mb-6">
              <Upload className="h-12 w-12 text-blue-400 mx-auto" />
            </div>
            <p className="text-xl font-semibold text-white mb-2">
              Drop your document here or click to browse
            </p>
            <p className="text-gray-400 mb-6">
              Supports PDF, DOC, DOCX, TXT files up to 10MB
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25">
              Choose File
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-400 font-medium">or paste your content</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study material here..."
              className="w-full h-48 p-6 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-white placeholder-gray-400 text-lg"
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-3">
              <Hash className="h-5 w-5 text-purple-400" />
              Quiz Configuration
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Number of Questions
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                min="5"
                max="50"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-400" />
              Validity Period
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Valid for (days)
              </label>
              <select
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleGenerate}
            disabled={!content.trim() || generating}
            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${!content.trim() || generating
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105'
              }`}
          >
            <Wand2 className={`h-6 w-6 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating Quiz Cards...' : 'Generate Quiz Cards'}
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Generation Status */}
      {generating && (
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-700 border-t-blue-500"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Creating Your Quiz Cards</h3>
              <p className="text-gray-400">AI is analyzing your content and generating personalized questions...</p>
            </div>
          </div>

          <div className="mt-6 bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>Processing...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};