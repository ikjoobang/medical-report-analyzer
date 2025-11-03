import axios from 'axios';
import { AnalysisResponse } from '../types';

// Railway backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://medical-report-analyzer-production.up.railway.app' 
    : 'http://localhost:3001'
  );

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 180 seconds (3 minutes)
  withCredentials: true, // CORS credentials 추가
});

export const analyzeReport = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AnalysisResponse>('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const testConnection = async () => {
  const response = await api.get('/api/test');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
