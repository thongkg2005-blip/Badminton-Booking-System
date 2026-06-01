# Công cụ cần chuẩn bị trước khi làm backend và database

Tài liệu này liệt kê các công cụ tối thiểu nên có trước khi bắt đầu phần backend Java Spring và PostgreSQL.

## Công cụ bắt buộc

### 1) Git

Dùng để quản lý mã nguồn và theo dõi thay đổi.

Kiểm tra:

```bash
git --version
```

### 2) Node.js + npm

Hiện dự án frontend đang dùng Next.js nên vẫn cần Node.js để chạy kiểm tra giao diện và build.

Kiểm tra:

```bash
node --version
npm --version
```

### 3) Java JDK

Cần cho Spring Boot. Nên dùng JDK 21 nếu có thể.

Kiểm tra:

```bash
java --version
```

### 4) PostgreSQL

Đây sẽ là database chính cho backend.

Kiểm tra:

```bash
psql --version
```

## Công cụ nên có

### 1) VS Code hoặc IntelliJ IDEA

- VS Code phù hợp khi làm nhanh frontend và script.
- IntelliJ IDEA phù hợp khi làm Java Spring.

### 2) DBeaver hoặc pgAdmin

Dùng để xem bảng, chạy SQL, kiểm tra dữ liệu PostgreSQL.

### 3) Postman hoặc Insomnia

Dùng để test API backend sau khi viết Spring Boot.

### 4) Maven hoặc Gradle

Dùng để build dự án Spring Boot. Nếu chưa chốt, Maven là lựa chọn dễ bắt đầu.

## Thứ tự chuẩn bị đề xuất

1. Cài Git, Node.js, npm.
2. Cài JDK 21.
3. Cài PostgreSQL và công cụ quản lý DB.
4. Chọn Maven hoặc Gradle cho Spring Boot.
5. Chuẩn bị Postman để test API.

## Script kiểm tra môi trường

Chạy script sau khi muốn rà nhanh các công cụ đã sẵn sàng hay chưa:

```bash
npm run check:env
```

Script này chỉ là kiểm tra hỗ trợ, không thay thế việc cài đặt thực tế.

## Roadmap triển khai

Xem thêm [docs/backend-roadmap.md](docs/backend-roadmap.md) để đi theo thứ tự: schema PostgreSQL, Spring Boot, rồi tích hợp frontend.
