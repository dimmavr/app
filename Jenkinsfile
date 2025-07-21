pipeline {
    agent any

    stages {

        stage('Cleanup') {
            steps {
                sh 'docker-compose down -v --remove-orphans || true'
                sh 'docker network prune -f || true'
            }
        }

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
                sh '''
                    docker-compose up -d db
                    docker-compose run --rm web sh -c "python manage.py migrate && python manage.py test"
                '''
            }
        }

        stage('Up Services') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}
