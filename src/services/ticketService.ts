import authManager from '../utils/auth';

// 티켓 상태 enum
export type TicketStatus = 'BEFORE_SALE' | 'SELLING' | 'SOLD_OUT' | 'CLOSED';

// 티켓 타입 enum
export type TicketType = 'ADULT' | 'TEEN' | 'CHILD';

// 좌석 등급 enum
export type SeatGrade = 'VIP' | 'R' | 'S' | 'A' | 'B' | 'FREE';

// 티켓 타입 정의
export interface Ticket {
  id?: number;
  name: string;
  seatGrade: SeatGrade;
  ticketType: TicketType;
  price: number;
  status: TicketStatus;
  maxPurchase: number;
  eventId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// API 요청/응답 타입
export interface TicketCreateRequest {
  name: string;
  seatGrade: SeatGrade;
  ticketType: TicketType;
  price: number;
  status: TicketStatus;
  maxPurchase: number;
}

export interface TicketUpdateRequest extends TicketCreateRequest {
  id: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
}

// 티켓 API 서비스 클래스
export class TicketService {
  private baseUrl = '/api/events';

  // 티켓 목록 조회
  async getTickets(eventId?: number, ticketType?: string, search?: string): Promise<Ticket[]> {
    try {
      console.log('티켓 목록 조회 API 호출:', { eventId, ticketType, search });
      console.log(eventId, ticketType, search);
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId.toString());
      if (ticketType && ticketType !== '전체') params.append('ticketType', ticketType);
      if (search) params.append('search', search);

      const url = `${this.baseUrl}/${eventId}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await authManager.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('티켓 목록 조회 실패:', response.status, response.statusText);
        throw new Error(`티켓 목록 조회 실패: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('티켓 목록 조회 성공:', data);
      return data.tickets || data;
    } catch (error) {
      console.error('티켓 목록 조회 중 오류:', error);
      throw error;
    }
  }

  // 티켓 생성
  async createTicket(eventId: number, ticketData: TicketCreateRequest): Promise<Ticket> {
    try {
      console.log('티켓 생성 API 호출:', { eventId, ticketData });
      console.log(eventId, ticketData);
      const response = await authManager.authenticatedFetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('티켓 생성 실패:', response.status, response.statusText, errorData);
        throw new Error(`티켓 생성 실패: ${response.statusText}`);
      }

      const createdTicket = await response.json();
      console.log('티켓 생성 성공:', createdTicket);
      return createdTicket;
    } catch (error) {
      console.error('티켓 생성 중 오류:', error);
      throw error;
    }
  }

  // 티켓 수정
  async updateTicket(ticketId: number, ticketData: TicketCreateRequest): Promise<Ticket> {
    try {
      console.log('티켓 수정 API 호출:', { ticketId, ticketData });

      const response = await authManager.authenticatedFetch(`${this.baseUrl}/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('티켓 수정 실패:', response.status, response.statusText, errorData);
        throw new Error(`티켓 수정 실패: ${response.statusText}`);
      }

      const updatedTicket = await response.json();
      console.log('티켓 수정 성공:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error('티켓 수정 중 오류:', error);
      throw error;
    }
  }

  // 티켓 삭제
  async deleteTicket(ticketId: number): Promise<boolean> {
    try {
      console.log('티켓 삭제 API 호출:', { ticketId });

      const response = await authManager.authenticatedFetch(`${this.baseUrl}/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('티켓 삭제 실패:', response.status, response.statusText, errorData);
        throw new Error(`티켓 삭제 실패: ${response.statusText}`);
      }

      console.log('티켓 삭제 성공');
      return true;
    } catch (error) {
      console.error('티켓 삭제 중 오류:', error);
      throw error;
    }
  }

  // 상태 변환 유틸리티
  getStatusDisplay(status: TicketStatus): { text: string; color: string; textColor: string } {
    switch (status) {
      case 'BEFORE_SALE':
        return { text: '판매전', color: 'bg-gray-100', textColor: 'text-gray-800' };
      case 'SELLING':
        return { text: '판매중', color: 'bg-green-100', textColor: 'text-green-800' };
      case 'SOLD_OUT':
        return { text: '품절', color: 'bg-red-100', textColor: 'text-red-800' };
      case 'CLOSED':
        return { text: '판매 종료', color: 'bg-orange-100', textColor: 'text-orange-800' };
      default:
        return { text: '알 수 없음', color: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  }

  // 티켓 유형별 색상
  getTypeColor(type: TicketType): string {
    switch (type) {
      case "ADULT":
        return "bg-red-100 text-red-800";
      case "TEEN":
        return "bg-blue-100 text-blue-800";
      case "CHILD":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // 티켓 유형 한글 변환
  getTypeDisplayName(type: TicketType): string {
    switch (type) {
      case 'ADULT':
        return '성인';
      case 'TEEN':
        return '청소년';
      case 'CHILD':
        return '어린이';
      default:
        return type;
    }
  }

  // 좌석 등급 한글 변환
  getSeatGradeDisplayName(seatGrade: SeatGrade): string {
    switch (seatGrade) {
      case 'VIP':
        return 'VIP석';
      case 'R':
        return 'R석';
      case 'S':
        return 'S석';
      case 'A':
        return 'A석';
      case 'B':
        return 'B석';
      case 'FREE':
        return '자유석';
      default:
        return seatGrade;
    }
  }

  // 상수 정의
  static readonly TICKET_TYPES = [
    { value: 'ADULT', label: '성인' },
    { value: 'TEEN', label: '청소년' },
    { value: 'CHILD', label: '어린이' },
  ];

  static readonly SEAT_GRADES = [
    { value: 'VIP', label: 'VIP석' },
    { value: 'R', label: 'R석' },
    { value: 'S', label: 'S석' },
    { value: 'A', label: 'A석' },
    { value: 'B', label: 'B석' },
    { value: 'FREE', label: '자유석' },
  ];

  static readonly TICKET_STATUSES = [
    { value: 'BEFORE_SALE', label: '판매전' },
    { value: 'SELLING', label: '판매중' },
    { value: 'SOLD_OUT', label: '품절' },
    { value: 'CLOSED', label: '판매 종료' },
  ];
}

// 싱글톤 인스턴스 export
export const ticketService = new TicketService();