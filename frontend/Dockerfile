# 1. Χρήση node για build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Σερβίρισμα με nginx
FROM nginx:alpine

# Αντιγραφή build στο nginx
COPY --from=build /app/build /usr/share/nginx/html

# Προαιρετικά custom config (αργότερα)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]