import { NavigateFunction } from 'react-router-dom';
import sessionAuth from './sessionAuth';

export const isAuthenticated = (): boolean => {
  return sessionAuth.isLoggedIn();
};

export const requireAuth = (
  navigate: NavigateFunction, 
  feature: string = '기능'
): boolean => {
  if (!isAuthenticated()) {
    alert(`로그인이 필요한 서비스입니다.`);
    navigate('/login');
    return false;
  }
  return true;
};

export const getUserIdFromSession = (): number | null => {
  return sessionAuth.getCurrentUserId();
};

export const getCurrentUserRole = (): string | null => {
  return sessionAuth.getCurrentUserRole();
};

export const getCurrentUserEmail = (): string | null => {
  return sessionAuth.getCurrentUserEmail();
};

export const hasRole = (role: string): boolean => {
  return sessionAuth.hasRole(role);
};

export const hasAnyRole = (roles: string[]): boolean => {
  return sessionAuth.hasAnyRole(roles);
};