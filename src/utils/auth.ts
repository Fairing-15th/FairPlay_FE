// auth.ts - 세션 기반 인증 유틸리티 (기존 JWT 대체)
// 이 파일은 하위 호환성을 위해 sessionAuth를 래핑합니다.
import sessionAuth from './sessionAuth';

// 하위 호환성을 위한 래핑 클래스 (기존 AuthManager API 유지)
class AuthManagerCompat {
  private static instance: AuthManagerCompat;
  
  static getInstance(): AuthManagerCompat {
    if (!AuthManagerCompat.instance) {
      AuthManagerCompat.instance = new AuthManagerCompat();
    }
    return AuthManagerCompat.instance;
  }

  // 세션 기반 인증으로 대체
  async refreshTokenIfNeeded(): Promise<boolean> {
    return await sessionAuth.extendSession();
  }

  logout(): void {
    sessionAuth.logout();
  }

  getCurrentUserId(): number | null {
    return sessionAuth.getCurrentUserId();
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return await sessionAuth.authenticatedFetch(url, options);
  }

  // 더 이상 사용되지 않는 JWT 관련 메서드들
  isTokenExpired(): boolean {
    return !sessionAuth.isLoggedIn();
  }

  isTokenValidFormat(): boolean {
    return sessionAuth.isLoggedIn();
  }
}

export default AuthManagerCompat.getInstance();