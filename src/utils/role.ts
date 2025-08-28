import api from "../api/axios";
import sessionAuth from './sessionAuth';

// LocalStorage 키 상수 (하위 호환성을 위해 유지)
const ROLE_CODE_KEY = "roleCode";

// 세션에서 역할 정보 추출 (JWT에서 세션으로 변경)
const getRoleFromSession = (): string | null => {
  try {
    return sessionAuth.getCurrentUserRole();
  } catch (error) {
    console.error('세션에서 역할 추출 실패:', error);
    return null;
  }
};

export const getCachedRoleCode = (): string | null => {
  // 먼저 세션에서 역할 정보 추출 시도
  const roleFromSession = getRoleFromSession();
  if (roleFromSession) {
    // 세션에서 가져온 역할을 캐시에 저장 (하위 호환성)
    setCachedRoleCode(roleFromSession);
    return roleFromSession;
  }
  
  // 세션에서 못 가져오면 localStorage 캐시 확인 (하위 호환성)
  try {
    return localStorage.getItem(ROLE_CODE_KEY);
  } catch {
    return null;
  }
};

export const setCachedRoleCode = (roleCode: string): void => {
  try {
    localStorage.setItem(ROLE_CODE_KEY, roleCode);
  } catch {
    // noop
  }
};

export const clearCachedRoleCode = (): void => {
  try {
    localStorage.removeItem(ROLE_CODE_KEY);
  } catch {
    // noop
  }
};

// 역할 API 호출하여 roleCode를 가져오고 캐싱
export const fetchAndCacheRoleCode = async (): Promise<string | null> => {
  try {
    const res = await api.get("/api/events/user/role");
    const roleCode: string | undefined = res?.data?.roleCode;
    if (roleCode) {
      setCachedRoleCode(roleCode);
      return roleCode;
    }
    return null;
  } catch (error) {
    console.error("역할 정보 조회 실패:", error);
    return null;
  }
};

// 캐시에 있으면 사용, 없으면 API 조회
export const getRoleCode = async (): Promise<string | null> => {
  const cached = getCachedRoleCode();
  if (cached) return cached;
  return await fetchAndCacheRoleCode();
};

export { ROLE_CODE_KEY };
