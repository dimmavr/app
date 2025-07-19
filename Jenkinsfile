pipeline {
    agent any

    stages {
        stage('Build Backend') {
            steps {
                sh 'docker-compose build web'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker-compose build frontend'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'docker-compose run --rm web python manage.py test'
            }
        }

        stage('Up Services') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}
