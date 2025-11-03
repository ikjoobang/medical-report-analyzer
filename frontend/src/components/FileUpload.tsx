import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('지원하지 않는 파일 형식입니다. JPG, PNG, PDF만 업로드 가능합니다.');
      return false;
    }

    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('파일 크기가 10MB를 초과합니다.');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Upload Area - Desktop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          hidden md:flex flex-col items-center justify-center
          min-h-[300px] p-8 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-200 theme-transition
          ${isDragging 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Upload size={64} className={`mb-4 ${isDragging ? 'text-primary animate-pulse' : 'text-gray-400 dark:text-gray-500'}`} />
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
          파일을 여기에 드래그하거나 클릭하세요
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          JPG, PNG, PDF 형식 지원 (최대 10MB)
        </p>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Preview" className="max-h-40 rounded-lg shadow-md" />
          </div>
        )}
      </div>

      {/* Mobile Upload Options */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {/* Camera Upload */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-primary-dark 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 theme-transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={48} className="mb-3 text-primary dark:text-primary-dark" />
          <h3 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">
            📷 카메라로 촬영
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            결과지를 직접 촬영하세요
          </p>
        </button>

        {/* Gallery Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-primary-dark 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 theme-transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={48} className="mb-3 text-primary dark:text-primary-dark" />
          <h3 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">
            📁 파일 선택
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            갤러리에서 사진을 선택하세요
          </p>
        </button>

        {preview && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <img src={preview} alt="Preview" className="w-full rounded-lg" />
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 업로드 가이드</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• 의료 검사 결과지를 명확하게 촬영해주세요</li>
          <li>• 글자가 흐리지 않고 선명해야 정확한 분석이 가능합니다</li>
          <li>• 개인정보는 서버에 저장되지 않으며 분석 후 즉시 삭제됩니다</li>
        </ul>
      </div>
    </div>
  );
};
