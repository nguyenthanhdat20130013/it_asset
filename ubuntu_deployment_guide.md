# Hướng dẫn Triển khai (Deployment) trên Ubuntu Server với Docker

Tài liệu này hướng dẫn bạn từng bước từ cài đặt môi trường đến khi ứng dụng chạy thực tế trên server Ubuntu.

## 1. Chuẩn bị Server Ubuntu
Truy cập vào server qua SSH:
```bash
ssh username@your_server_ip
```
Cập nhật hệ thống:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Cài đặt Docker và Docker Compose
Chạy lệnh sau để cài đặt Docker:
```bash
# Cài đặt các gói cần thiết
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Thêm GPG key của Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Cài đặt Docker Compose (phiên bản mới nhất)
sudo apt install docker-compose-plugin -y
```

Kiểm tra cài đặt:
```bash
docker --version
docker compose version
```

## 3. Đưa Code lên Server
Bạn có thể dùng Git (khuyên dùng) hoặc SCP:

**Dùng Git:**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

## 4. Cấu hình Biến môi trường
Tạo file `.env` cho Server (nếu chưa có trong source code):

```bash
cd server
nano .env
```
Nội dung mẫu:
```env
DATABASE_URL="mysql://root:your_password@db:3306/it_asset_management"
JWT_SECRET="your_secret_key_here"
PORT=3000
```

## 5. Triển khai với Docker Compose

### Cách A: Nếu dùng MySQL riêng trong Docker (Khuyên dùng)

Cập nhật file `docker-compose.yml` tại thư mục gốc để thêm service `db`:

```yaml
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: your_strong_password
      MYSQL_DATABASE: it_asset_management
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  server:
    build: ./server
    restart: always
    environment:
      DATABASE_URL: mysql://root:your_strong_password@db:3306/it_asset_management
      JWT_SECRET: your_very_strong_secret
      PORT: 3000
    depends_on:
      - db
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app
      - /app/node_modules

  client:
    build: ./client
    restart: always
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mysql_data:
```

### Cách B: Nếu dùng MySQL cài trực tiếp trên Ubuntu
Cấu hình `DATABASE_URL` trong `docker-compose.yml` trỏ về IP của host hoặc `host.docker.internal`.

---

Tại thư mục gốc của dự án, chạy lệnh:

```bash
# Build và chạy ngầm (detach)
sudo docker compose up --build -d
```

## 6. Khởi tạo Database (Prisma)

Sau khi các container đã khởi động, bạn cần chạy lệnh sau để đồng bộ cấu trúc database:

```bash
sudo docker compose exec server npx prisma db push
```

## 7. Lưu ý quan trọng cho Production

### Kết nối Database (MySQL)
1. **Nếu dùng service `db` trong Docker**: `DATABASE_URL` phải dùng host là `db` (tên service). Ví dụ: `mysql://root:password@db:3306/db_name`.
2. **Nếu chạy MySQL trên host Ubuntu**: Dùng IP của server hoặc `host.docker.internal`.

### Cấu hình Firewall (UFW)
Mở các port cần thiết:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (Client)
sudo ufw allow 3000  # API Server (nếu cần truy cập trực tiếp)
sudo ufw enable
```

## 8. Kiểm tra trạng thái và Log
```bash
# Xem các container đang chạy
sudo docker compose ps

# Xem log nếu có lỗi
sudo docker compose logs -f
```

## 9. Chi tiết cài đặt MySQL bằng Docker

Nếu bạn muốn cài đặt MySQL một cách tách biệt hoặc hiểu rõ hơn về quy trình:

### Bước 1: Tạo thư mục lưu trữ
Để dữ liệu không bị mất khi xóa container, chúng ta cần dùng volume. Trong `docker-compose.yml` ở trên, tôi đã dùng volume named `mysql_data`.

### Bước 2: Cấu hình biến môi trường
Mọi cấu hình quan trọng của MySQL đều nằm trong phần `environment`:
- `MYSQL_ROOT_PASSWORD`: Mật khẩu cao nhất của database. **Bắt buộc phải có**.
- `MYSQL_DATABASE`: Tên cơ sở dữ liệu sẽ được tự động tạo khi khởi chạy lần đầu.

### Bước 3: Kiểm tra MySQL đã chạy chưa
```bash
sudo docker compose logs -f db
```
Nếu thấy dòng: `port: 3306  MySQL Community Server - GPL`, nghĩa là MySQL đã sẵn sàng.

### Bước 4: Truy cập vào bên trong MySQL
```bash
sudo docker compose exec db mysql -u root -p
```
(Nhập mật khẩu bạn đã đặt ở Bước 2).

### Bước 5: Cập nhật Code mới
Khi bạn có thay đổi code và push lên Github, trên server hãy chạy:
```bash
git pull
sudo docker compose up --build -d
```
