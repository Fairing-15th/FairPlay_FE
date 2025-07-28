# 1. Node.js 공식 이미지로 빌드
FROM node:20 AS build

WORKDIR /app

# 2. package.json, package-lock.json만 먼저 복사 → 의존성 설치(캐시 최적화)
COPY package*.json ./
RUN npm install

# 3. 소스 전체 복사 → 빌드
COPY . .
RUN npm run build

# 4. Nginx 이미지로 서빙
FROM nginx:alpine

# 5. 빌드 산출물(dist)만 Nginx 루트로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
