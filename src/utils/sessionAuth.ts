// sessionAuth.ts - 세션 기반 인증 유틸리티
import { toast } from "react-toastify";

interface SessionUser {
  userId: number;
  email: string;
  name: string;
  roleName: string;
  roleId: number;
  phone: string;
  createdAt: string;
  lastAccessedAt: string;
}

class SessionAuthManager {
  private static instance: SessionAuthManager;
  private currentUser: SessionUser | null = null;
  private extendPromise: Promise<boolean> | null = null;

  private constructor() {
    // 페이지 로드 시 세션 정보 확인
    this.checkSession();
    
    // 10분마다 세션 연장 시도
    setInterval(() => {
      this.extendSession();
    }, 10 * 60 * 1000); // 10분
  }

  static getInstance(): SessionAuthManager {
    if (!SessionAuthManager.instance) {
      SessionAuthManager.instance = new SessionAuthManager();
    }
    return SessionAuthManager.instance;
  }

  /**
   * 로그인 (세션 생성)
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        await this.checkSession(); // 세션 정보 업데이트
        return true;
      } else {
        const errorText = await response.text();
        toast.error(errorText || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
      return false;
    }
  }

  /**
   * 카카오 로그인
   */
  async kakaoLogin(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        await this.checkSession();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(errorText || '카카오 로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('카카오 로그인 중 오류 발생:', error);
      toast.error('카카오 로그인 중 오류가 발생했습니다.');
      return false;
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/session/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      this.currentUser = null;
      this.showLogoutMessage();
      
      // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  /**
   * 세션 정보 확인 및 업데이트
   */
  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session/info', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        this.currentUser = await response.json();
        return true;
      } else {
        this.currentUser = null;
        return false;
      }
    } catch (error) {
      console.error('세션 확인 중 오류 발생:', error);
      this.currentUser = null;
      return false;
    }
  }

  /**
   * 세션 연장
   */
  async extendSession(): Promise<boolean> {
    // 이미 연장 중이면 기다림
    if (this.extendPromise) {
      return await this.extendPromise;
    }

    // 현재 사용자가 없으면 연장하지 않음
    if (!this.currentUser) {
      return false;
    }

    this.extendPromise = this.performSessionExtend();
    const success = await this.extendPromise;
    this.extendPromise = null;

    return success;
  }

  private async performSessionExtend(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session/extend', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('세션이 연장되었습니다.');
        return true;
      } else {
        console.log('세션 연장 실패 - 로그아웃 처리');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('세션 연장 중 오류:', error);
      this.logout();
      return false;
    }
  }

  /**
   * 인증된 API 요청을 위한 헬퍼 함수
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // 항상 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 401 오류 시 로그아웃 처리
    if (response.status === 401) {
      console.log('인증 실패 - 로그아웃 처리');
      this.logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    return response;
  }

  /**
   * 로그아웃 알림 메시지 표시
   */
  private showLogoutMessage(): void {
    try {
      toast.warn('로그아웃 되었습니다. 다시 로그인해 주세요.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (error) {
      // toast 실패 시 기본 alert
      alert('로그아웃 되었습니다. 다시 로그인해 주세요.');
    }
  }

  // Getter 메서드들
  getCurrentUser(): SessionUser | null {
    return this.currentUser;
  }

  getCurrentUserId(): number | null {
    return this.currentUser?.userId || null;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  getCurrentUserRole(): string | null {
    return this.currentUser?.roleName || null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roleName === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.roleName || '');
  }
}

export default SessionAuthManager.getInstance();