## Setup

1.Cài đặt MongoDb, Redis, Elasticsearch

2.Config lại các file trong folder config cho phù hợp 

3.Config lại file .env
  Bạn cần bắt buộc
    -Chọn NODE_ENV bạn muốn
    -Thêm BASE_URL là địa chỉ backend của bạn
    -Thêm VERIFY_SUCCESS_URL là địa chỉ frontend xác thực tài khoản thành công
    -Thêm EMAIL_FROM_ADDRESS,EMAIL_USERNAME là google mail của bạn
    -Thêm GOOGLE_MAILER_CLIENT_ID,GOOGLE_MAILER_CLIENT_SECRET,GOOGLE_MAILER_REFRESH_TOKEN (Xem
    hướng dẫn để lấy các giá trị cần thiết)

## Tính toán
max_requests_per_second = (pool_size * 1000) / average_query_time_in_ms

## Package Commands

| Lệnh                  | Mô tả        |
| --------------        | ------------|
| `npm install`         | Cài đặt các package      |
| `npm monstache`       | Khởi động monstache đồng bộ mongodb và elasticsearch |
| `npm dev:server`      | Khởi động ứng dụng trong môi trường development |
| `npm pro:server`      | Khởi động ứng dụng trong môi trường production |
| `npm dev`             | Khởi động monstache và ứng dụng trong môi trường development |
| `npm product`         | Khởi động monstache và ứng dụng trong môi trường production |
| `npm lint`            | Kiểm tra lỗi cú pháp và chính tả của các tệp TypeScript |
| `npm lint:fix`        | Kiểm tra lỗi cú pháp và chính tả của các tệp TypeScript và tự động sửa chữa các lỗi đơn giản |
| `npm build`           | Biên dịch các tệp TypeScript thành các tệp JavaScript trong thư mục `build` |

## Tasks

TODO Database
- [x] Implement database

TODO Redis
- [x] Implement RedisClient

TODO Denpency Injector
- [x] Create TYPES of DI
- [x] Create container of DI

TODO Route
- [x] Implement authRoute
- [ ] Implement userRoute
- [ ] Implement rawConfessionRoute
- [ ] Implement confessionRoute

TODO Controller
- [x] Implement authController
- [ ] Implement userController
- [ ] Implement confessionController

TODO Service
- [x] Implement auth service
- [ ] Implement user service
- [ ] Implement confession service

TODO Model
- [x] Create user model
- [x] Create refreshToken model
- [ ] Create rawConfession model
- [ ] Create confession model

TODO Middleware
- [x] Creare checkJwt middleware
- [x] Creare checkRole middleware

TODO Unit Test
  - [ ] Write tests for authentication




