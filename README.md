# FairPlay Frontend (React + Vite + TypeScript)

.

> 박람회 예약/관리 플랫폼 프론트엔드
> Vite + React + TypeScript 환경, 백엔드(Spring Boot)와 연동

---

## 🗂️ 프로젝트 폴더 구조

````
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   └── main.tsx
├── public/
├── node\_modules/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ...

---

## 새로운 로딩 컴포넌트 사용법

프로젝트에 새로운 로딩 애니메이션이 추가되었습니다. 점프하는 박스와 그림자 효과를 가진 애니메이션입니다.

### 사용법

```tsx
import NewLoader from "../components/NewLoader";

// 로딩 상태일 때
if (loading) {
    return (
        <div className="flex items-center justify-center">
            <NewLoader />
        </div>
    );
}
````

### 특징

- 48x48px 크기의 점프하는 박스 애니메이션
- 그림자 효과와 함께 부드러운 움직임
- 0.5초 주기로 반복되는 애니메이션
- Uiverse.io의 alexruix가 제작한 애니메이션

### 기존 로딩 컴포넌트와의 차이점

- `Spinner.tsx`: 회전하는 점들로 구성된 로딩 애니메이션
- `NewLoader.tsx`: 점프하는 박스와 그림자 효과를 가진 로딩 애니메이션

---

## ⚙️ 개발 환경 준비

### 1. Node.js 18 이상 설치 (최신 권장)

### 2. 패키지 설치

npm install

### 3. 개발 서버 실행

npm run dev

- 기본 포트: [http://localhost:5173](http://localhost:5173)
- API 요청은 자동으로 백엔드(8080) 프록시 (vite.config.ts 참고)

---

## 🌱 .env 환경변수 사용법

- API 엔드포인트, 공개 키 등 필요 시 `.env` 파일 추가 (예시: .env.example 참고)
- 실제 `.env`는 git에 올리지 말고, 각자 복사해서 사용

---

## 🚀 주요 명령어

| 명령어          | 설명                  |
| --------------- | --------------------- |
| npm install     | 의존성 패키지 설치    |
| npm run dev     | 개발 서버 실행        |
| npm run build   | 정적 파일 빌드        |
| npm run preview | 빌드 결과 미리보기    |
| npm run lint    | 코드 스타일/문법 검사 |

---

## 🛠️ 협업/커밋 규칙

- node_modules, dist, .env 등은 git에 올리지 않음 (.gitignore 참고)
- 코드 컨벤션은 prettier, eslint 기준 준수
- 환경변수/민감정보는 .env로만 관리
- 브랜치 전략, 커밋 컨벤션 등은 팀 가이드에 따름

---

## ⚡️ FAQ & 문제해결

- npm install 시 에러
  - Node.js 버전 확인 (18 이상 권장)

- API 요청 불가/오류
  - 백엔드(Spring Boot) 서버가 실행 중인지, 프록시 설정 확인

- 환경변수 적용 안됨
  - .env 파일 위치/내용 및 .env.example 참고

---

> 추가 문의/개선 제안은 팀 노션/디스코드에 남겨주세요!!!!!
