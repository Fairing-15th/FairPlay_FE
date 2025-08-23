import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import sessionAuth from '../../utils/sessionAuth';
import { toast } from 'react-toastify';
import { hasHostPermission, hasBoothManagerPermission, hasAdminPermission } from '../../utils/permissions';
import { setCachedRoleCode } from '../../utils/role';

const KakaoCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const didRequest = useRef(false);

    useEffect(() => {
        const code = new URLSearchParams(location.search).get('code');
        if (!code) {
            toast.error('카카오 로그인에 실패했습니다.');
            navigate('/login');
            return;
        }
        if (didRequest.current) return; // 중복 방지
        didRequest.current = true;

        const handleKakaoLogin = async (code: string) => {
            try {
                console.log('세션 기반 카카오 로그인 시도 - code:', code);
                console.log('User Agent:', navigator.userAgent);
                console.log('Current URL:', window.location.href);
                
                const loginSuccess = await sessionAuth.kakaoLogin(code);
                
                if (loginSuccess) {
                    toast.success('카카오 로그인에 성공했습니다!');
                    
                    // 세션에서 사용자 정보 가져오기
                    const currentUser = sessionAuth.getCurrentUser();
                    if (currentUser) {
                        const userRole = currentUser.roleName;
                        setCachedRoleCode(userRole);
                        
                        console.log('세션 사용자 정보:', currentUser);
                        console.log('사용자 역할:', userRole);
                        
                        // 권한별 리다이렉션 (ADMIN 우선)
                        if (hasAdminPermission(userRole)) {
                            navigate("/admin_dashboard");
                        } else if (hasHostPermission(userRole)) {
                            navigate("/host/dashboard");
                        } else if (hasBoothManagerPermission(userRole)) {
                            navigate("/booth-admin/dashboard");
                        } else {
                            navigate("/");
                        }
                    } else {
                        console.error('세션 사용자 정보를 가져올 수 없음');
                        navigate("/");
                    }
                } else {
                    // 로그인 실패 (에러 메시지는 sessionAuth.kakaoLogin 내부에서 처리됨)
                    navigate('/login');
                }
            } catch (error: any) {
                console.error('카카오 로그인 예상치 못한 에러:', error);
                toast.error('카카오 로그인에 실패했습니다.');
                navigate('/login');
            }
        };
        handleKakaoLogin(code);
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p>카카오 로그인 처리 중...</p>
        </div>
    );
};

export default KakaoCallback;
