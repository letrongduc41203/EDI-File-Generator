#  EDI File Generator

## Giới thiệu
Dự án nhỏ mô phỏng cách **tạo file EDI (XML/EDIFACT)** từ dữ liệu **Order** và lưu log vào hệ thống.  
Phù hợp để minh họa quy trình **EDI trong doanh nghiệp / hải quan / logistics** ở mức cơ bản.

Công nghệ sử dụng:
- **HTML + TailwindCSS**
- **Node.js + Express**
- **SQL Server (SSMS)**

## Tính năng
- Tạo **Order**
- Nhấn nút **"Xuất EDI"** → sinh file XML/EDIFACT vào thư mục `wwwroot/edi/sent/`
- Lưu log vào bảng `EdiTransactions`
- Xem danh sách **Orders** và trạng thái gửi.  

## Screenshots

![UI](/Img/localhost_3000_orders.html.png)
![UI](/Img/Screenshot%202025-09-08%20025745.png)
![UI](/Img/Screenshot%202025-09-08%20025724.png)
