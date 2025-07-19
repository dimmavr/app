pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Install Docker CLI') {
            steps {
                sh '''
                    apt-get update
                    apt-get install -y docker.io docker-compose
                '''
            }
        }

        stage('Checkout Code') {
            steps {
                echo 'Code is fetched automatically from GitHub.'
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh 'docker ps'
                sh 'docker-compose down -v'
                sh 'docker-compose up --build -d'
            }
        }
    }
}
