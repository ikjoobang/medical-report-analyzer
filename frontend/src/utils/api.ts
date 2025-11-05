import axios from 'axios';
import type { AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://courteous-passion-production.up.railway.app';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  withCredentials: true,
});

export const analyzeReport = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    console.log('API 요청 시작:', API_BASE_URL);
    const response = await api.post<AnalysisResult>('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.error || '분석 중 오류가 발생했습니다.');
    }
    console.error('알 수 없는 에러:', error);
    throw error;
  }
};
