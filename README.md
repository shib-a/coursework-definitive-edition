# Tiishka - Custom T-Shirt Design Platform

A full-stack web application for designing and ordering custom t-shirts with AI-powered design generation.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Integration](https://img.shields.io/badge/integration-complete-blue.svg)
![Documentation](https://img.shields.io/badge/docs-comprehensive-green.svg)

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 14+
- PostgreSQL
- npm

### One-Command Startup
```bash
./start.sh
```

This starts both backend (port 8080) and frontend (port 3000) servers.

### Stop Application
```bash
./stop.sh
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** | 🎉 Integration success summary |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Complete setup instructions |
| **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** | Integration architecture details |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Developer quick reference |
| **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** | API endpoints documentation |
| **[frontend/design/README.md](frontend/design/README.md)** | Frontend-specific docs |

## ✨ Features

- 🔐 **Authentication**: JWT-based user authentication
- 👕 **Product Customization**: Select type, color, and size
- 🎨 **AI Design Generation**: Generate designs with AI (authenticated)
- 🛒 **Shopping Cart**: Full cart management with backend sync
- 👤 **User Profile**: View and manage account
- 📱 **Responsive UI**: Modern Material-UI design
- 🔒 **Security**: BCrypt hashing, CORS, role-based access

## 🏗️ Architecture

```
Frontend (React) ←→ REST API ←→ Backend (Spring Boot) ←→ PostgreSQL
     Port 3000              JWT Auth         Port 8080
```

### Technology Stack

**Frontend:**
- React 18
- Material-UI
- Axios
- React Router
- Context API

**Backend:**
- Spring Boot 3
- Spring Security
- JWT
- PostgreSQL
- JPA/Hibernate

## 📁 Project Structure

```
kursach-back/
├── src/main/java/ru/itmo/kursach_back/
│   ├── config/           # Security, CORS configuration
│   ├── controller/       # REST API controllers
│   ├── service/          # Business logic
│   ├── repository/       # Data access layer
│   ├── entity/           # JPA entities
│   └── dto/              # Data transfer objects
├── frontend/design/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── *Context.jsx  # State management
│   ├── package.json
│   └── .env
├── start.sh              # Startup script
├── stop.sh               # Shutdown script
└── [Documentation files]
```

## 🎯 Getting Started

### 1. Clone & Setup
```bash
git clone <repository-url>
cd kursach-back
```

### 2. Configure Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE kursach_db;
CREATE USER kursach_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kursach_db TO kursach_user;
```

### 3. Configure Application
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/kursach_db
spring.datasource.username=kursach_user
spring.datasource.password=your_password
```

### 4. Start Application
```bash
./start.sh
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/actuator/health

## 🧪 Testing

### Manual Testing
1. Register new user at http://localhost:3000/register
2. Login with credentials
3. Browse products in Item section
4. Add items to cart
5. View cart and profile

### API Testing with curl
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","login":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:8080/api/products
```

## 📊 API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/products` - List products

### Protected Endpoints (Requires JWT)
- `GET /api/auth/me` - Get current user
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `POST /api/designs/generate` - Generate AI design
- `GET /api/designs/my` - Get user's designs

See [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) for complete API documentation.

## 🔧 Development

### Backend Development
```bash
./gradlew bootRun              # Start backend
./gradlew build                # Build project
./gradlew test                 # Run tests
```

### Frontend Development
```bash
cd frontend/design
npm install                    # Install dependencies
npm start                      # Start dev server
npm run build                  # Build for production
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use the stop script
./stop.sh
```

### CORS Errors
- Verify backend is running
- Check `CorsConfig.java` includes your frontend URL
- Clear browser cache and reload

### Authentication Issues
- Clear browser localStorage
- Verify token hasn't expired (24h default)
- Check backend logs for errors

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive troubleshooting.

## 📝 Development Workflow

1. **Start Development Environment**
   ```bash
   ./start.sh
   ```

2. **Make Changes**
   - Backend: Hot reload with Spring DevTools
   - Frontend: Automatic reload on save

3. **Test Changes**
   - Manual testing in browser
   - API testing with Postman/curl
   - Check browser console for errors

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

## 🚀 Deployment

### Production Checklist
- [ ] Set production database credentials
- [ ] Change JWT secret key
- [ ] Enable HTTPS
- [ ] Configure production CORS origins
- [ ] Set up reverse proxy (nginx)
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure backup strategy

### Build for Production
```bash
# Backend
./gradlew clean build
java -jar build/libs/kursach-back-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend/design
npm run build
# Serve build folder with web server
```

## 📚 Learning Resources

### For New Developers
1. Start with [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Read [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
3. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
4. Explore the codebase

### Key Concepts
- **JWT Authentication**: Token-based auth flow
- **REST API**: RESTful design principles
- **React Context**: State management pattern
- **Spring Security**: Security configuration
- **CORS**: Cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit pull request

## 📄 License

[Your License Here]

## 👥 Authors

[Your Name/Team]

## 🙏 Acknowledgments

- Spring Boot team for excellent framework
- React team for amazing frontend library
- Material-UI for beautiful components

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review troubleshooting guides
3. Check existing issues
4. Create new issue with details

## 🎉 Status

- ✅ **Backend**: Fully functional with JWT auth
- ✅ **Frontend**: Complete UI with all features
- ✅ **Integration**: Frontend-backend fully connected
- ✅ **Documentation**: Comprehensive guides provided
- ✅ **Scripts**: Automated startup/shutdown
- ⚠️ **Production**: Needs AI and payment integration

## 🔮 Roadmap

### Phase 1 (Current) ✅
- User authentication
- Product browsing
- Cart management
- Basic design system

### Phase 2 (Next)
- Real AI design generation
- Image upload and processing
- Payment integration
- Order processing

### Phase 3 (Future)
- Order history
- Admin dashboard
- Advanced analytics
- Mobile app

---

## 🚀 Ready to Start?

```bash
./start.sh
```

Then visit http://localhost:3000

**Happy Coding! 🎨👕**

