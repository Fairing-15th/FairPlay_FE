// src/api/sessionAxios.ts - 세션 기반 axios 구성
import axios from "axios";
import { toast } from "react-toastify";
import sessionAuth from "../utils/sessionAuth";

const sessionApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://fair-play.ink'),
  withCredentials: true, // 쿠키 자동 포함
});

// 응답 인터셉터 - 에러 처리 및 인증 확인
sessionApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    let msg = "알 수 없는 오류가 발생했습니다.";
    let showToast = true;
    let performLogout = false;
    
    // 네트워크 오류 (서버 연결 실패)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      msg = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      console.warn('백엔드 서버가 실행되지 않았거나 네트워크 오류가 발생했습니다.');
      showToast = false; // 네트워크 오류는 토스트를 표시하지 않음
    }
    // 인증 오류 처리
    else if (error.response?.status === 401) {
      msg = "로그인이 필요합니다.";
      performLogout = true; // 로그아웃 처리
    }
    // 권한 오류
    else if (error.response?.status === 403) {
      msg = "권한이 없습니다.";
    }
    // 서버 커스텀 메시지 처리
    else if (error.response?.data?.message) {
      msg = error.response.data.message;
    }
    else if (error.response?.data?.error) {
      msg = error.response.data.error;
    }
    else if (error.message) {
      msg = error.message;
    }
    
    // 로그아웃 처리
    if (performLogout && sessionAuth.isLoggedIn()) {
      sessionAuth.logout();
      msg = "세션이 만료되어 로그아웃되었습니다.";
    }
    
    // 토스트 메시지 표시
    if (showToast) {
      toast.error(msg);
    }
    
    return Promise.reject(error);
  }
);

// 요청 인터셉터 - 세션 확인 및 연장
sessionApi.interceptors.request.use(
  async (config) => {
    // 인증이 필요한 요청인지 확인 (로그인/회원가입 제외)
    const publicEndpoints = [
      '/api/auth/session/login',
      '/api/auth/session/logout', 
      '/api/auth/session/kakao',
      '/api/users/signup',
      '/api/events',
      '/api/events/hot-picks'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // 인증이 필요한 요청이고 사용자가 로그인되어 있으면 세션 연장 시도
    if (!isPublicEndpoint && sessionAuth.isLoggedIn()) {
      try {
        await sessionAuth.extendSession();
      } catch (error) {
        console.log('세션 연장 실패, 요청 계속 진행:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default sessionApi;