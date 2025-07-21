# 1. Χρήση Python image
FROM python:3.11-slim

# 2. Δημιουργία directory
WORKDIR /code

# 3. Αντιγραφή αρχείων
COPY . .

# 4. Εγκατάσταση εργαλείων
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# 5. Αντιγραφή .env (θα γίνει μέσω compose)

# 6. Εντολή εκκίνησης
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]