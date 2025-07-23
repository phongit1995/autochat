# AutoChat Go Server

Ứng dụng AutoChat được viết lại bằng Go sử dụng Gin framework, tương tự như phiên bản Node.js gốc.

## Tính năng

- **Authentication**: Login/logout với session management
- **Browser Automation**: Sử dụng Rod (tương tự Puppeteer) để login tự động
- **Database**: MongoDB với Mongoose-like API
- **Session Management**: Cookie-based sessions với Gin
- **JWT**: Token-based authentication
- **Templates**: HTML templates với Gin

## Cài đặt

1. **Cài đặt dependencies:**
```bash
go mod tidy
```

2. **Cấu hình environment:**
Tạo file `.env` hoặc export các biến môi trường:
```bash
export PORT=8080
export MONGO_DB=mongodb://localhost:27017/autochat
export JWT_SECRET=your-secret-key
```

3. **Khởi động MongoDB:**
```bash
mongod --dbpath ./data/db
```

4. **Build và chạy:**
```bash
go build -o autochat ./cmd/api
./autochat
```

Hoặc chạy trực tiếp:
```bash
go run ./cmd/api/main.go
```

## Cấu trúc dự án

```
go-server/
├── cmd/api/main.go              # Entry point
├── config/config.go             # Configuration
├── internal/
│   ├── handlers/auth.go         # Authentication handlers
│   ├── middleware/auth.go       # Authentication middleware
│   ├── models/user.go          # User model và database
│   └── services/
│       ├── auth.go             # Auth service với JWT
│       ├── browser_auth.go     # Browser automation
│       └── session.go          # Session management
├── templates/                  # HTML templates
│   ├── login.html
│   └── index.html
└── go.mod                      # Go modules
```

## API Endpoints

### Public Routes
- `GET /login` - Trang đăng nhập
- `POST /login` - Xử lý đăng nhập

### Protected Routes
- `GET /` - Dashboard (yêu cầu đăng nhập)
- `GET /logout` - Đăng xuất
- `GET /api/user` - Lấy thông tin user hiện tại

## So sánh với phiên bản Node.js

| Tính năng | Node.js | Go |
|-----------|---------|-----|
| Framework | Express | Gin |
| Database | Mongoose | MongoDB Driver |
| Sessions | express-session | gin-contrib/sessions |
| Browser Automation | Puppeteer | Rod |
| Templates | EJS | Go HTML Templates |
| Authentication | Custom | JWT + Sessions |

## Login Flow

1. **GET /login**: 
   - Sử dụng Rod để lấy cookie ban đầu từ gaubong.us
   - Lưu cookie và CSRF token vào session
   - Render trang login

2. **POST /login**:
   - Nhận username/password từ form
   - Sử dụng cookie ban đầu để POST đến /login
   - Nếu thành công, tạo JWT token với thông tin user
   - Lưu user vào session và redirect về dashboard

3. **Protected Routes**:
   - Middleware kiểm tra session
   - Nếu chưa login, redirect về /login
   - Nếu đã login, thêm user info vào context

## Environment Variables

- `PORT`: Port server (default: 8080)
- `MONGO_DB`: MongoDB connection string
- `JWT_SECRET`: Secret key cho JWT tokens

## Development

### Run in development mode:
```bash
go run ./cmd/api/main.go
```

### Build for production:
```bash
go build -ldflags="-s -w" -o autochat ./cmd/api
```

### Docker:
```bash
docker build -t autochat-go .
docker run -p 8080:8080 autochat-go
```

## Todo

- [ ] Implement HTML parsing cho GetUserInfo
- [ ] Add message sending functionality
- [ ] Add user management features
- [ ] Add WebSocket support
- [ ] Add logging và monitoring
- [ ] Add tests
- [ ] Add Docker support
- [ ] Add CI/CD pipeline 