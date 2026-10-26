pipeline {
    agent any

    environment {
        CI = 'true'
        DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dayflow_ci?schema=public'
        NEXTAUTH_URL = 'http://localhost:3000'
        NEXTAUTH_SECRET = 'ci-only-secret-for-build'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'node --version && npm --version'
                sh 'npm ci'
            }
        }

        stage('Generate Prisma client') {
            steps {
                sh 'npm exec -- prisma generate'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --runInBand'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}