# Tài liệu Phân tích Nghiệp vụ và Hướng dẫn Sử dụng - Hệ thống Quản lý Tài sản IT

## 1. Giới thiệu Dự án (Project Overview)
Hệ thống Quản lý Tài sản IT là một giải pháp toàn diện giúp tổ chức theo dõi, quản lý và tối ưu hóa việc sử dụng các tài sản phần cứng và phần mềm. Hệ thống cung cấp cái nhìn tổng thể về tài nguyên số của doanh nghiệp, từ thiết bị vật lý như laptop, máy tính để bàn đến các tài sản vô hình như bản quyền phần mềm và sim thẻ.

### Mục tiêu chính:
- Tự động hóa quy trình theo dõi tài sản.
- Quản lý vòng đời tài sản từ lúc mua sắm đến khi thanh lý.
- Tối ưu hóa việc cấp phát thiết bị cho nhân viên và dự án.
- Cảnh báo hạn bảo hành, hạn hết hạn sim và bản quyền phần mềm.

---

## 2. Phân tích Nghiệp vụ (Business Analysis)

### 2.1. Các Phân hệ Chính (Core Modules)
Hệ thống được chia thành các module nghiệp vụ sau:

1.  **Dashboard (Bảng điều khiển)**: Tổng hợp các chỉ số quan trọng (KPIs) như tổng số tài sản, nhân viên, giá trị đơn hàng mua sắm (PO), và các cảnh báo (sim sắp hết hạn).
2.  **Quản lý Tài sản (Asset Management)**: Theo dõi thông tin chi tiết của từng thiết bị, trạng thái (trong kho, đang sử dụng, hỏng), và lịch sử bàn giao.
3.  **Quản lý Sim (Sim Management)**: Quản lý số thuê bao, nhà mạng, gói cước, ngày kích hoạt và ngày hết hạn.
4.  **Quản lý Nhân sự (Employee Management)**: Lưu trữ thông tin nhân viên, phòng ban và các tài sản họ đang nắm giữ.
5.  **Quản lý Dự án (Project Management)**: Quản lý các dự án triển khai (ví dụ: lắp đặt camera), nơi các tài sản và sim được phân bổ theo từng giai đoạn.
6.  **Quản lý Phần mềm (SAM - Software Asset Management)**: Quản lý bản quyền phần mềm (License), số lượng máy cài đặt và thời hạn sử dụng.
7.  **Quản lý Đơn hàng (Purchase Order)**: Theo dõi việc mua sắm tài sản, chi phí và nhà cung cấp.
8.  **Hệ thống (System Settings)**: Quản lý người dùng, phân quyền (RBAC), cấu hình loại thiết bị (Device Types) và sao lưu dữ liệu.

### 2.2. Luồng Nghiệp vụ Chính (Key Workflows)

#### Quy trình Bàn giao Tài sản:
1.  Admin kiểm tra tài sản trong kho (IN_STOCK).
2.  Chọn nhân viên hoặc dự án cần bàn giao.
3.  Cập nhật trạng thái tài sản sang "Đang sử dụng" (IN_USE).
4.  Hệ thống ghi lại lịch sử bàn giao (Asset History).

#### Quy trình Quản lý Dự án (Camera):
1.  Khởi tạo dự án mới với trạng thái "Upcoming".
2.  Gán các thiết bị (Camera, Đầu ghi) và Sim vào dự án.
3.  Chuyển trạng thái dự án theo tiến độ: Preparing -> Installed -> Completed.

### 2.3. Mô hình Dữ liệu (ERD Summary)
-   **Company (Công ty)**: Thực thể gốc, quản lý đa công ty.
-   **Department (Phòng ban)**: Thuộc về Công ty.
-   **Employee (Nhân viên)**: Thuộc về Công ty/Phòng ban.
-   **Asset (Tài sản)**: Gắn liền với Công ty và có thể được cấp cho Nhân viên hoặc Dự án.
-   **Sim (Thẻ Sim)**: Có thể gắn với một Tài sản (ví dụ: sim trong router) hoặc một Dự án.

---

## 3. Hướng dẫn Sử dụng (User Guide)

### 3.1. Đăng nhập và Phân quyền
-   **Admin**: Có toàn quyền quản lý người dùng, thiết lập hệ thống, xóa dữ liệu.
-   **Manager/User**: Có quyền xem, thêm, sửa tài sản và nhân viên tùy theo cấp bậc được phân công.

### 3.2. Quản lý Tài sản (Assets)
1.  Vào menu **Assets**.
2.  **Thêm mới**: Nhập Serial Number, Tag, Loại thiết bị, Ngày mua, Hạn bảo hành.
3.  **Cấp phát**: Chọn nút "Assign" để giao tài sản cho nhân viên.
4.  **Lọc dữ liệu**: Sử dụng thanh tìm kiếm và bộ lọc theo Công ty, Loại thiết bị.

### 3.3. Quản lý Sim
1.  Vào menu **Sims**.
2.  Hệ thống tự động hiển thị cảnh báo đỏ cho các Sim đã hết hạn hoặc sắp hết hạn trong 5 ngày tới tại Dashboard.
3.  Bạn có thể cập nhật thông tin gói cước và ngày gia hạn trực tiếp.

### 3.4. Quản lý Dự án
1.  Vào menu **Projects**.
2.  Sử dụng bảng Kanban hoặc danh sách để theo dõi tiến độ.
3.  Kéo thả hoặc thay đổi trạng thái để cập nhật quy trình triển khai.

### 3.5. Cấu hình Loại thiết bị (Device Types)
-   Tính năng này cho phép bạn định nghĩa các thuộc tính riêng cho từng loại tài sản (Ví dụ: Laptop cần RAM, CPU; nhưng Monitor chỉ cần Kích thước màn hình).
-   Sử dụng **JSON Schema** để thiết lập logic này.

---

## 4. Hướng dẫn Triển khai (Deployment Guide)
*Chi tiết xem tại tài liệu [ubuntu_deployment_guide.md](file:///d:/code/newproject/ubuntu_deployment_guide.md)*

1.  **Backend**: Chạy trên Node.js, sử dụng Prisma để kết nối DB.
2.  **Frontend**: Build bằng Vite/React.
3.  **Docker**: Sử dụng `docker-compose up -d` để triển khai nhanh toàn bộ hệ thống bao gồm MySQL.

---

## 5. Kết luận
Tài liệu này cung cấp cái nhìn tổng quan nhất về hệ thống. Để biết thêm chi tiết về code hoặc lỗi cụ thể, vui lòng tham khảo các tệp nhật ký (logs) hoặc liên hệ đội ngũ kỹ thuật.
