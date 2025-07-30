pipeline {
    agent any
    environment {
        DOCKERHUB_USER = 'songchih'
        DOCKERHUB_PASS = credentials('dockerhub-pass')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build & Dockerize') {
            steps {
                sh '''
                  # 프론트엔드 빌드 (예: Vite)
                  npm install
                  npm run build
                  echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin
                  docker buildx create --use || true
                  docker buildx inspect --bootstrap
                  docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKERHUB_USER/fairplay-frontend:latest --push .
                '''
            }
        }
    }
}
