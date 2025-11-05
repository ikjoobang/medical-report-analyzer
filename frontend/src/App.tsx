import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Sun, Moon } from 'lucide-react';
import { analyzeReport } from './utils/api';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { AnalysisResult } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('분석 시작...', selectedFile.name);
      const response = await analyzeReport(selectedFile);
      console.log('분석 완료:', response);
      
      if (!response || typeof response !== 'object') {
        throw new Error('잘못된 응답 형식입니다.');
      }

      setResult(response);
    } catch (err) {
      console.error('분석 에러:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <button 
        onClick={toggleDarkMode}
        className="theme-toggle-btn"
        aria-label="테마 전환"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Studiojuai - 의료 영상 판독
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI 기반 의료 판독 보고서 분석 시스템
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ 본 서비스는 개인 연구 목적으로만 사용됩니다
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {!result ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-lg text-gray-700 font-medium">
                      판독지를 업로드하세요
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <p className="mt-4 text-sm text-blue-600 font-medium">
                      선택된 파일: {selectedFile.name}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">오류가 발생했습니다</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || isAnalyzing}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                    !selectedFile || isAnalyzing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      분석 중입니다...
                    </span>
                  ) : (
                    '분석 시작'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedFile(null);
                  setError(null);
                }}
                className="mb-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 새 분석하기
              </button>
              <ResultsDisplay results={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
