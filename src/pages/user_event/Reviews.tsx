import React, { useState, useEffect } from "react";
import type {
  ReviewForEventResponseDto,
  ReviewWithOwnerDto
} from "../../services/types/reviewType";
import { updateReaction } from "../../services/review";

interface ReviewsProps {
  data: ReviewForEventResponseDto | null;
  currentPage: number;   
  onPageChange: (page: number) => void;
}

// 행사 상세페이지 리뷰 컴포넌트
export const Reviews = ({ data, currentPage, onPageChange }: ReviewsProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reviews, setReviews] = useState<ReviewWithOwnerDto[]>(data?.reviews?.content ?? []);
  const [totalPages, setTotalPages] = useState(1);

  // props로 전달된 리뷰 목록이 변경되면 동기화
  useEffect(() => {
    setReviews(data?.reviews?.content ?? []);
    setTotalPages(data?.reviews?.totalPages ?? 1);
  }, [data?.reviews?.content]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? "text-amber-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  const handleLike = async (reviewId: number) => {
    if (!localStorage.getItem("accessToken")) {
      alert("로그인한 회원만 좋아요 반응을 할 수 있습니다. 로그인해주세요.");
    }

    if(reviews.find(review => review.review.reviewId === reviewId)?.owner) {
      alert("본인이 작성한 관람평은 좋아요할 수 없습니다.");
      return;
    }

    if (!reviews.find(review => review.review.reviewId === reviewId)?.review.visible) {
      alert("비공개된 리뷰에는 좋아요를 할 수 없습니다.");
      return;
    }

    const res = await updateReaction({ reviewId });
    // 서버에서 내려준 최신 카운트로 동기화
    setReviews(prev =>
      prev.map(r =>
        r.review.reviewId === res.reviewId
          ? {
            ...r,
            review: { ...r.review, reactions: res.count },
            liked: !r.liked // 토글해줌
          } : r
  )
);
  };

  const formattedDate = (createdAt: string) => {
    const formatted = createdAt.slice(0, 10).replace(/-/g, ". ");
    return formatted;
  }

  const handleReport = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }

    // 실제로는 API 호출하여 신고 데이터를 서버에 전송
    console.log(`관람평 ID ${selectedReviewId} 신고: ${reportReason}`);

    // 모달 닫기 및 상태 초기화
    setShowReportModal(false);
    setSelectedReviewId(null);
    setReportReason("");

    // 신고 접수 완료 메시지
    alert("신고가 접수되었습니다.");
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReviewId(null);
    setReportReason("");
  };

  // 별점 평균 계산
  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return "0.00";

    const totalRating = reviews.reduce((sum, currentReview) => sum + currentReview.review.star, 0);
    return (totalRating / reviews.length).toFixed(2);
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="w-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-bold text-slate-800">
              관람평
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const rating = parseFloat(averageRating);
                  const fullStars = Math.floor(rating);
                  const hasPartialStar = index === fullStars && rating % 1 > 0;
                  const isFullStar = index < fullStars;
                  const isPartialStar = hasPartialStar;

                  return (
                    <span
                      key={index}
                      className={`text-xl relative ${isFullStar ? "text-amber-400" : "text-gray-300"}`}
                    >
                      ★
                      {isPartialStar && (
                        <span
                          className="absolute top-0 left-0 text-amber-400 overflow-hidden"
                          style={{ width: `${(rating % 1) * 100}%` }}
                        >
                          ★
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="text-xl font-bold text-slate-800">
                {averageRating}
              </span>
              <span className="text-slate-600 text-base">
                ({reviews.length}개의 리뷰)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-6">
        {reviews.map(currentReview => (
          <div
            key={currentReview.review.reviewId}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-base font-semibold text-slate-800">
                    {currentReview.review.nickname}
                  </span>
                  <div className="flex gap-1 mt-1">
                    {renderStars(currentReview.review.star)}
                  </div>
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
                {formattedDate(currentReview.review.createdAt)}
              </span>
            </div>

            <div className="mb-6">
              {!currentReview.review.visible ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-slate-500 font-medium">
                    비공개 처리된 관람평입니다.
                  </p>
                </div>
              ) : (
                <p className="text-base text-slate-700 font-normal leading-relaxed">
                  {currentReview.review.comment}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(currentReview.review.reviewId)}
                  disabled={!currentReview.review.visible}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentReview.review.visible
                      ? currentReview.liked
                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-red-200 hover:text-red-600"
                      : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
                  }`}
                >
                  <span className="text-lg">
                    {currentReview.liked ? "❤️" : "🤍"}
                  </span>
                  <span>좋아요</span>
                  <span className="font-semibold">{currentReview.review.reactions}</span>
                </button>
              </div>
              <button
                onClick={() => handleReport(currentReview.review.reviewId)}
                className="text-sm text-slate-500 font-medium hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                신고
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {page + 1}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* 안내사항 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mt-12 border border-blue-100">
        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">ℹ️</span>
          주요 안내사항
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-slate-700 text-sm leading-relaxed">
              관람평은 실제 공연을 관람한 후 작성해주시기 바랍니다.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-slate-700 text-sm leading-relaxed">
              부적절한 내용이나 광고성 글은 관리자에 의해 삭제될 수 있습니다.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-slate-700 text-sm leading-relaxed">
              타인에게 불쾌감을 주는 표현은 자제해주시기 바랍니다.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-slate-700 text-sm leading-relaxed">
              스포일러가 포함된 내용은 다른 관람객을 위해 주의해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[1001] bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 mx-4">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚨</span>
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-2">
                  신고하기
                </h3>
                <p className="text-slate-600 text-base">
                  신고 사유를 입력해주세요
                </p>
              </div>

              <div className="mb-6">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="신고 사유를 입력해주세요..."
                  className="w-full p-4 border border-slate-300 rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base leading-relaxed transition-all duration-200"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-sm"
                >
                  신고하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 