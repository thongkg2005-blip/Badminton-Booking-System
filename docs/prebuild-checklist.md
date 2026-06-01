# Quy trình kiểm tra trước khi build

Tài liệu này dùng để kiểm tra các thay đổi quan trọng trước khi chạy `build`. Mục tiêu là tách riêng kiểm tra database và giao diện, chỉ chạy khi có thay đổi liên quan.

## Thứ tự đề xuất

1. Kiểm tra database trước.
2. Kiểm tra giao diện sau đó.
3. Chỉ khi hai bước trên ổn mới chạy build.

## 1) Kiểm tra database

Chạy khi có thay đổi ở `db/`, schema, DDL, API liên quan dữ liệu, hoặc khi cập nhật logic backend.

```bash
npm run check:db
```

Script này kiểm tra tối thiểu:

- file DDL bắt buộc còn tồn tại
- các bảng chính liên quan đến dụng cụ vẫn có mặt
- các khai báo cơ bản không bị thiếu cấu trúc

## 2) Kiểm tra giao diện

Chạy khi có thay đổi ở `app/`, `components/`, `lib/` hoặc layout/tương tác UI.

```bash
npm run check:ui
```

Script này chạy kiểm tra tĩnh cho giao diện để phát hiện lỗi TypeScript/React/ESLint trước khi build.

## 3) Build sau cùng

Khi hai bước trên đã ổn, mới build toàn bộ dự án:

```bash
npm run build
```

## Khi nào dùng các script này

- Dùng `check:db` khi chỉnh schema, SQL, API dữ liệu.
- Dùng `check:ui` khi chỉnh màn hình, component, logic hiển thị.
- Không gắn tự động vào mỗi lần sửa nhỏ nếu chưa cần, để tránh mất thời gian.

## Tài liệu công cụ cần chuẩn bị

Trước khi bắt đầu backend và database, xem thêm [docs/backend-db-tools.md](docs/backend-db-tools.md) để chuẩn bị Git, Node.js, Java, PostgreSQL và công cụ test API.
