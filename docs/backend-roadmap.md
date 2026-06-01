# Kế hoạch triển khai backend + database theo CDM

Tài liệu này dùng làm roadmap triển khai phần backend Java Spring Boot và PostgreSQL dựa trên CDM hiện tại của dự án.

## 1) Mục tiêu

- Chuyển CDM sang schema PostgreSQL rõ ràng, dễ mở rộng.
- Dùng Spring Boot để xử lý nghiệp vụ đặt sân, tính giá, hóa đơn và quản lý dụng cụ.
- Tách lớp backend theo chuẩn: entity, repository, service, controller, DTO, validation.

## 2) Phạm vi theo CDM

### Nhóm tài khoản và phân quyền

- `tai_khoan`
- `vai_tro`

### Nhóm quản lý chi nhánh và sân

- `chi_nhanh`
- `cua_hang`
- `san`
- `khung_gio`
- `loai_ngay`
- `gia`

### Nhóm đặt sân và thanh toán

- `phieu_dat_cho`
- `ngay_den_san`
- `hoa_don`

### Nhóm dụng cụ và nhập hàng

- `dung_cu`
- `loai_dung_cu`
- `nha_san_xuat`
- `gia_dung_cu`
- `phieu_mua_hang`
- `phieu_nhap`
- `chi_tiet_phieu_nhap`

## 3) Thứ tự triển khai đề xuất

### Phase 1: Chốt schema PostgreSQL

Việc đầu tiên là chuyển CDM sang DDL PostgreSQL.

Mục tiêu của phase này:

- xác định khóa chính, khóa ngoại
- xác định kiểu dữ liệu chuẩn cho từng cột
- thống nhất naming convention
- thêm ràng buộc unique, not null, default phù hợp

### Phase 2: Dựng backend Spring Boot nền tảng

Khởi tạo project Spring Boot với các module:

- Spring Web
- Spring Data JPA
- Validation
- Spring Security nếu có đăng nhập phân quyền
- PostgreSQL Driver
- Flyway hoặc Liquibase để quản lý migration

### Phase 3: Triển khai các nghiệp vụ cốt lõi

Ưu tiên theo đúng luồng nghiệp vụ chính:

1. Tài khoản và vai trò
2. Quản lý sân và khung giờ
3. Bảng giá theo loại ngày và khung giờ
4. Đặt sân
5. Hóa đơn và trạng thái thanh toán
6. Dụng cụ, nhập hàng, phiếu nhập

### Phase 4: Tích hợp frontend

- kết nối trang đặt sân với API backend
- kết nối shop/cart/checkout với dữ liệu thật
- thay mock data bằng API thật từng phần

### Phase 5: Kiểm thử và tối ưu

- test service và repository
- test API bằng Postman/Insomnia
- kiểm tra transaction và chống đặt trùng
- tối ưu truy vấn và index

## 4) Thiết kế schema PostgreSQL gợi ý

### Bắt buộc có migration

Nên dùng Flyway để quản lý schema theo version.

Gợi ý cấu trúc:

- `V1__init.sql`: bảng nền tảng
- `V2__booking.sql`: đặt sân
- `V3__pricing.sql`: giá và loại ngày
- `V4__inventory.sql`: dụng cụ và nhập hàng

### Quy tắc chung

- Dùng `varchar` cho mã định danh nghiệp vụ.
- Dùng `bigserial` hoặc `uuid` cho khóa kỹ thuật nếu cần.
- Tất cả quan hệ nhiều-nhiều nên tách bảng trung gian rõ ràng.
- Các cột ngày/giờ nên dùng `date`, `time`, `timestamp` đúng mục đích.

## 5) Các module backend nên có

### 5.1 Auth & account

- đăng nhập
- đăng ký
- phân quyền theo vai trò
- hồ sơ người dùng

### 5.2 Court booking

- danh sách sân
- lịch trống theo ngày/khung giờ
- đặt sân
- hủy đặt sân
- kiểm tra không trùng lịch
- rule đặt trước tối thiểu 1 giờ khi cùng ngày

### 5.3 Pricing

- giá theo khung giờ
- giá theo loại ngày
- tính tổng tiền đặt sân

### 5.4 Invoicing

- tạo hóa đơn
- trạng thái thanh toán
- lịch sử giao dịch

### 5.5 Inventory / shop

- danh mục dụng cụ
- nhà sản xuất
- giá dụng cụ
- đơn nhập hàng
- chi tiết phiếu nhập

## 6) API đề xuất

### Booking API

- `GET /api/courts`
- `GET /api/bookings/availability?date=YYYY-MM-DD`
- `POST /api/bookings`
- `GET /api/bookings/{id}`
- `DELETE /api/bookings/{id}`

### Pricing API

- `GET /api/pricing?date=YYYY-MM-DD&slot=...`

### Product / shop API

- `GET /api/products`
- `GET /api/product-categories`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Inventory API

- `GET /api/imports`
- `POST /api/imports`
- `GET /api/suppliers`

## 7) Kiểm soát nghiệp vụ quan trọng

### Quy tắc đặt sân

- Không cho đặt sân ở quá khứ.
- Nếu đặt trong ngày hiện tại, phải còn ít nhất 1 giờ trước thời điểm khung giờ bắt đầu.
- Không cho đặt trùng sân trong cùng khung giờ.
- Nên kiểm tra bằng transaction ở database và service.

### Quy tắc giá

- Giá phụ thuộc khung giờ và loại ngày.
- Logic tính giá nên đặt tại service, không đặt ở controller.

### Quy tắc dữ liệu dụng cụ

- Mỗi dụng cụ phải thuộc một loại.
- Mỗi nhà sản xuất phải có mã riêng.
- Phiếu nhập cần chi tiết số lượng, đơn giá, ngày mua.

## 8) Cấu trúc source code Spring Boot gợi ý

```text
src/main/java/.../
  config/
  controller/
  dto/
  entity/
  mapper/
  repository/
  service/
  service/impl/
  exception/
  security/
```

## 9) Lộ trình thực hiện thực tế

### Bước 1

Chốt DDL PostgreSQL từ CDM.

### Bước 2

Khởi tạo Spring Boot project và kết nối PostgreSQL.

### Bước 3

Triển khai tài khoản, vai trò, sân, khung giờ, loại ngày, giá.

### Bước 4

Triển khai đặt sân và rule chống trùng lịch.

### Bước 5

Triển khai hóa đơn và trạng thái thanh toán.

### Bước 6

Triển khai dụng cụ, nhà sản xuất, phiếu nhập, nhập hàng.

### Bước 7

Kết nối lại frontend với API thật.

## 10) Việc nên làm trước khi code backend

1. Xác nhận danh sách bảng final từ CDM.
2. Xác nhận khóa chính và khóa ngoại cho từng bảng.
3. Chọn Flyway hoặc Liquibase.
4. Chọn Maven hoặc Gradle.
5. Chốt format mã hóa dữ liệu ngày giờ và tiền tệ.

## 11) Kết luận

Nếu đi theo roadmap này, phần backend và database sẽ đi đúng thứ tự: schema trước, nghiệp vụ sau, rồi mới nối frontend. Cách làm này giúp hạn chế sửa đi sửa lại khi dự án đã lớn.
