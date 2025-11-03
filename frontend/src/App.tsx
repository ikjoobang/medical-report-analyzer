import React, { useState } from 'react';
import { FileHeart, Loader2, ArrowLeft, Activity } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeReport } from './utils/api';
import { AnalysisResult, HistoryItem } from './types';

type ViewType = 'home' | 'analyzing' | 'results';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [view, setView] = useState<ViewType>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('analysis-history', []);

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsLoading(true);
    setView('analyzing');
    setCurrentFileName(file.name);

    try {
      console.log('Uploading file:', file.name);
      const response = await analyzeReport(file);
      console.log('Analysis complete:', response);

      if (response.success && response.data) {
        setCurrentResult(response.data);
        
        // Save to history
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          fileName: file.name,
          analyzedAt: new Date().toISOString(),
          result: response.data,
        };
        
        setHistory([historyItem, ...history.slice(0, 9)]); // Keep last 10
        
        setView('results');
      } else {
        throw new Error('분석 결과를 받지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      
      let errorMessage = '분석 중 오류가 발생했습니다.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          errorMessage += ': ' + err.response.data.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setView('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('home');
    setCurrentResult(null);
    setCurrentFileName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark theme-transition">
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileHeart className="text-primary dark:text-primary-dark" size={32} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Studiojuai-의료 영상 판독
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  OpenAI Vision으로 빠르고 정확한 분석
                </p>
              </div>
            </div>
            {view === 'results' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                         hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline">새로운 분석</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {view === 'home' && (
          <div className="space-y-12 fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-title-mobile md:text-title font-bold text-gray-800 dark:text-gray-100 mb-4">
                의료 검사 결과를 쉽게 이해하세요
              </h2>
              <p className="text-subtitle-mobile md:text-subtitle text-gray-600 dark:text-gray-300 leading-relaxed">
                AI가 의료 영상 판독 결과를 분석하여 이해하기 쉽게 설명해드립니다
              </p>
            </div>

            {/* Upload Section */}
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
              <div className="max-w-4xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">오류가 발생했습니다</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                  계속 문제가 발생하면 백엔드 서버가 실행 중인지 확인해주세요.
                </p>
              </div>
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  AI 자동 판독
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  OpenAI Vision으로 의료 결과지를 자동으로 분석하고 주요 소견을 추출합니다
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  다중 포맷 출력
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  분석 결과를 텍스트, Excel, PDF 형식으로 다운로드하여 보관하세요
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  개인정보 보호
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  업로드된 파일은 서버에 저장되지 않으며 분석 후 즉시 삭제됩니다
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  모바일 최적화
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  스마트폰으로 결과지를 촬영하여 바로 분석할 수 있습니다
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  쉬운 용어 설명
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  어려운 의학 용어를 일반인이 이해할 수 있도록 쉽게 설명합니다
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md card-hover theme-transition">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  빠른 분석
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  최신 AI 기술로 몇 초 만에 정확한 분석 결과를 제공합니다
                </p>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  최근 분석 기록
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentResult(item.result);
                        setCurrentFileName(item.fileName);
                        setView('results');
                      }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg 
                               transition-all text-left card-hover theme-transition"
                    >
                      <div className="flex items-start gap-3">
                        <Activity className="text-primary dark:text-primary-dark flex-shrink-0" size={20} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate mb-1">
                            {item.fileName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(item.analyzedAt).toLocaleDateString('ko-KR')}
                          </p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getSeverityColor(item.result.impression.overallSeverity)}`}>
                            {item.result.impression.overallSeverity}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[500px] fade-in">
            <Loader2 className="animate-spin text-primary dark:text-primary-dark mb-6" size={64} />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              분석 중입니다...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              AI가 의료 결과지를 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
            <div className="mt-8 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>✓ 이미지 업로드 완료</p>
              <p className="animate-pulse">⏳ OpenAI Vision 분석 중...</p>
              <p className="text-gray-400 dark:text-gray-500">⏹ 결과 생성 대기 중</p>
            </div>
          </div>
        )}

        {view === 'results' && currentResult && (
          <ResultsDisplay result={currentResult} fileName={currentFileName} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20 theme-transition">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm space-y-2">
            <p>
              <strong>⚠️ 의료 면책 조항:</strong> 이 서비스는 의료 정보 참고용으로만 제공되며, 
              전문 의료인의 진단, 치료 또는 의학적 조언을 대체하지 않습니다.
            </p>
            <p>
              정확한 진단과 치료를 위해서는 반드시 의료 전문가와 상담하시기 바랍니다.
            </p>
            <p className="pt-4 text-xs text-gray-500 dark:text-gray-500">
              @STUDIO_JU_AIㅣ© 2025. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getSeverityColor(severity: string) {
  const colors = {
    '정상': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    '경증': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    '중등도': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    '중증': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-700';
}

export default App;


