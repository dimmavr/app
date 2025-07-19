pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Code is fetched automatically from GitHub.'
            }
        }

        stage('Build and Run Containers') {
            steps {
                script {
                    sh 'docker ps'
                    sh 'docker-compose down -v'
                    sh 'docker-compose up --build -d'
                }
            }
        }
    }
}