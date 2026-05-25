# ==========================================
# BƯỚC 1: Build ứng dụng Angular
# ==========================================
FROM node:20 AS build
WORKDIR /app

# Copy file cấu hình thư viện và cài đặt
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và tiến hành build ra bản Production
COPY . .
RUN npm run build --configuration=production

# ==========================================
# BƯỚC 2: Đưa lên Nginx để chạy Web
# ==========================================
FROM nginx:alpine

# Xóa trang web mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/edulearn/browser /usr/share/nginx/html

# Mở port 80 cho web
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]