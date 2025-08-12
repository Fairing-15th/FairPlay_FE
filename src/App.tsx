import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import authManager from "./utils/auth";
import tokenValidator from "./utils/tokenValidator";
import { Main } from "./pages/MainPage";
import { MyPageInfo } from "./pages/user_mypage/Info";
import { MyPageAccount } from "./pages/user_mypage/Account";
import { MyPageFavorites } from "./pages/user_mypage/Favorites";
import { Withdrawal } from "./pages/user_mypage/Withdrawal";
import { MyPageMyReview } from "./pages/user_mypage/MyReview";
import Reservation from "./pages/user_mypage/Reservation";
import MyTickets from "./pages/user_mypage/MyTickets";
import ParticipantForm from "./pages/user_mypage/ParticipantForm";
import ParticipantList from "./pages/user_mypage/ParticipantList";
import EventOverview from "./pages/user_event/EventOverview";
import EventDetail from "./pages/user_event/EventDetail";
import { BookingPage } from "./pages/user_event/BookingPage";
import { LoginPage } from "./pages/user_auth/LoginPage";
import { SignUpPage } from "./pages/user_auth/SignUpPage";
import { FindPassword } from "./pages/user_auth/FindPassword";
import { RegisterEvent } from "./pages/RegisterEvent";
import { EventRegistrationIntro } from "./pages/EventRegistrationIntro";
import { HostDashboard } from "./pages/HostDashboard";
import { EditEventInfo } from "./pages/host_event/EditEventInfo";
import TicketManagement from "./pages/host_event/TicketManagement";
import RoundManagement from "./pages/host_event/RoundManagement";
import EventVersionManagement from "./pages/host_event/EventVersionManagement";
import { EventVersionDetail } from "./pages/host_event/EventVersionDetail";
import { EventVersionComparison } from "./pages/host_event/EventVersionComparison";
import { EventStatusBanner } from "./pages/host_event/EventStatusBanner";
import { ReservationList } from "./pages/host_reservation/ReservationList";
import { ReservationStats } from "./pages/host_reservation/ReservationStats";
import { BoothTypeManagement } from "./pages/host_booth/BoothTypeManagement";
import { BoothApplicationList } from "./pages/host_booth/BoothApplicationList";
import { BoothApplicationDetail } from "./pages/host_booth/BoothApplicationDetail";
import { BookingAnalysis } from "./pages/host_analytics/BookingAnalysis";
import { RevenueSummary } from "./pages/host_analytics/RevenueSummary";
import { TimeAnalysis } from "./pages/host_analytics/TimeAnalysis";
import QRScanPage from "./pages/QRScanPage";
import { HostRouteGuard } from "./components/HostRouteGuard";
import { AdminRouteGuard } from "./components/AdminRouteGuard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useScrollToTop } from './hooks/useScrollToTop';
import KakaoCallback from "./pages/user_auth/KakaoCallback";
import ChatFloatingModal from "./components/chat/ChatFloatingModal"; // ← 위치 반드시 확인

function AppContent() {
  useScrollToTop();
  const [isTokenValidated, setIsTokenValidated] = useState(false);

  // 앱 시작 시 토큰 유효성 검증
  useEffect(() => {
    const validateTokens = async () => {
      await tokenValidator.validateTokensOnStartup();
      setIsTokenValidated(true);
    };

    validateTokens();

    // 주기적 토큰 검증 시작
    tokenValidator.startPeriodicValidation();
  }, []);

  // 사용자 접속 상태 관리
  useEffect(() => {
    if (!isTokenValidated) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // 페이지 로드 시 사용자 온라인 상태로 설정
    const setUserOnline = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('🚫 토큰이 없어서 온라인 상태 설정 건너뜀');
          return;
        }

        console.log('🟢 사용자 온라인 상태 설정 시도 시작');
        const response = await authManager.authenticatedFetch('/api/chat/presence/connect', {
          method: 'POST',
        });

        if (response.ok) {
          console.log('✅ 사용자 온라인 상태로 설정 성공');
        } else {
          const errorText = await response.text();
          console.error('❌ 온라인 상태 설정 실패:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('❌ 온라인 상태 설정 오류:', error);
      }
    };

    // 페이지를 벗어날 때 사용자 오프라인 상태로 설정
    const setUserOffline = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('🚫 토큰이 없어서 오프라인 상태 설정 건너뜀');
          return;
        }

        console.log('🔴 사용자 오프라인 상태 설정 시도 시작');
        const response = await authManager.authenticatedFetch('/api/chat/presence/disconnect', {
          method: 'POST',
        });

        if (response.ok) {
          console.log('✅ 사용자 오프라인 상태로 설정 성공');
        } else {
          const errorText = await response.text();
          console.error('❌ 오프라인 상태 설정 실패:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('❌ 오프라인 상태 설정 오류:', error);
      }
    };

    // 온라인 상태로 설정
    setUserOnline();

    // 페이지 언로드 시 오프라인 상태로 설정
    const handleBeforeUnload = () => {
      // sendBeacon은 헤더를 직접 설정할 수 없으므로, 간단한 방법으로 처리
      setUserOffline().catch(console.error);
    };

    // 페이지 가시성 변경 시 온라인/오프라인 상태 관리
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserOffline();
      } else {
        setUserOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 정리
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setUserOffline();
    };
  }, [isTokenValidated]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/eventoverview" element={<EventOverview />} />
        <Route path="/eventdetail/:eventId" element={<EventDetail />} />
        <Route path="/booking/:eventId" element={<BookingPage />} />
        <Route path="/mypage/info" element={<MyPageInfo />} />
        <Route path="/mypage/account" element={<MyPageAccount />} />
        <Route path="/mypage/favorites" element={<MyPageFavorites />} />
        <Route path="/mypage/reservation" element={<Reservation />} />
        <Route path="/mypage/tickets" element={<MyTickets />} />
        <Route path="/mypage/participant-form" element={<ParticipantForm />} />
        <Route path="/mypage/participant-list" element={<ParticipantList />} />
        <Route path="/mypage/write-review" element={<MyPageMyReview />} />
        <Route path="/mypage/my-review" element={<MyPageMyReview />} />
        <Route path="/mypage/withdrawal" element={<Withdrawal />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/event-registration-intro" element={<EventRegistrationIntro />} />
        <Route path="/register" element={<RegisterEvent />} />
        <Route path="/host/dashboard" element={<HostRouteGuard><HostDashboard /></HostRouteGuard>} />
        <Route path="/host/edit-event-info" element={<HostRouteGuard><EditEventInfo /></HostRouteGuard>} />
        <Route path="/host/ticket-management" element={<HostRouteGuard><TicketManagement /></HostRouteGuard>} />
        <Route path="/host/round-management" element={<HostRouteGuard><RoundManagement /></HostRouteGuard>} />
        <Route path="/host/status-management" element={<HostRouteGuard><EventStatusBanner /></HostRouteGuard>} />
        <Route path="/host/event-version" element={<HostRouteGuard><EventVersionManagement /></HostRouteGuard>} />
        <Route path="/host/event-version/:versionId" element={<HostRouteGuard><EventVersionDetail /></HostRouteGuard>} />
        <Route path="/host/event-version/comparison" element={<HostRouteGuard><EventVersionComparison /></HostRouteGuard>} />
        <Route path="/host/reservation-list" element={<HostRouteGuard><ReservationList /></HostRouteGuard>} />
        <Route path="/host/reservation-stats" element={<HostRouteGuard><ReservationStats /></HostRouteGuard>} />
        <Route path="/host/booth-type" element={<HostRouteGuard><BoothTypeManagement /></HostRouteGuard>} />
        <Route path="/host/booth-applications" element={<HostRouteGuard><BoothApplicationList /></HostRouteGuard>} />
        <Route path="/host/booth-applications/:id" element={<HostRouteGuard><BoothApplicationDetail /></HostRouteGuard>} />
        <Route path="/host/booking-analysis" element={<HostRouteGuard><BookingAnalysis /></HostRouteGuard>} />
        <Route path="/host/revenue-summary" element={<HostRouteGuard><RevenueSummary /></HostRouteGuard>} />
        <Route path="/host/time-analysis" element={<HostRouteGuard><TimeAnalysis /></HostRouteGuard>} />
        <Route path="/host/qr-scan" element={<HostRouteGuard><QRScanPage /></HostRouteGuard>} />
        <Route path="/admin/dashboard" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {/* 채팅 플로팅 버튼은 항상 표시하되, 클릭 시 인증 확인 */}
      <ChatFloatingModal />
    </BrowserRouter>
  );
}

export default App;
