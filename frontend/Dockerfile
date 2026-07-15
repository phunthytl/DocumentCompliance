# Stage 1: Build React/Vite app
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Đọc các biến môi trường nếu được truyền vào lúc build (dùng ARG)
ARG VITE_API_URL
ARG VITE_ONLYOFFICE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ONLYOFFICE_URL=$VITE_ONLYOFFICE_URL

# Build ứng dụng
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy cấu hình nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build từ stage 1 sang thư mục html của nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
