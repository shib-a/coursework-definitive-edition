# Tiishka Frontend - React Application

This is the frontend application for the Tiishka custom t-shirt design platform.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend/design
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The application uses environment variables for configuration. The `.env` file contains:

- `REACT_APP_API_BASE_URL`: Backend API URL (default: http://localhost:8080/api)
- `PORT`: Development server port (default: 3000)

## Running the Application

### Development Mode
```bash
npm start
```

The application will start on http://localhost:3000

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Features

### Authentication
- User registration with username, login, and password
- User login with JWT token-based authentication
- Protected routes requiring authentication
- Automatic token validation and refresh

### Product Design
- Browse available products
- Select product type, color, and size
- Generate AI-powered designs (requires authentication)
- Upload custom images
- Preview designs on products

### Shopping Cart
- Add products to cart (requires authentication)
- Update quantities
- Remove items
- View cart total
- Proceed to checkout

### User Profile
- View user information
- Display authority level
- Logout functionality

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── DesignOptions.jsx
│   ├── GenerationSection.jsx
│   ├── ImageSection.jsx
│   ├── ItemSection.jsx
│   └── Preview.jsx
├── pages/              # Page components
│   ├── LoginPage.jsx
│   ├── MainPage.jsx
│   ├── ProfilePage.jsx
│   ├── RegisterPage.jsx
│   ├── ShoppingCartPage.jsx
│   └── SupportPage.jsx
├── services/           # API service layer
│   └── api.js         # Axios client and API functions
├── App.js             # Main application component
├── AuthContext.jsx    # Authentication context
├── CartContext.jsx    # Shopping cart context
├── DesignContext.jsx  # Design state context
└── index.js           # Application entry point
```

## API Integration

The frontend communicates with the backend REST API using Axios. All API calls are centralized in `src/services/api.js`.

### API Endpoints Used

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/validate` - Validate JWT token

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search` - Search products

#### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove cart item
- `DELETE /api/cart` - Clear cart

#### Designs
- `POST /api/designs/generate` - Generate AI design
- `GET /api/designs/my` - Get user's designs
- `GET /api/designs/{id}` - Get design by ID
- `DELETE /api/designs/{id}` - Delete design

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. Axios interceptor adds token to all requests
5. Token is validated on protected routes
6. Token is removed on logout or 401 errors

## State Management

The application uses React Context API for state management:

- **AuthContext**: User authentication state and functions
- **CartContext**: Shopping cart state and functions
- **DesignContext**: Design customization state

## Styling

The application uses Material-UI (MUI) for components and styling.

## Development Notes

- All API calls include error handling
- Loading states are displayed during API calls
- User feedback is provided via alerts and messages
- Protected routes redirect to login if not authenticated
- Cart syncs with backend when user logs in

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend is configured to allow requests from `http://localhost:3000`.

### API Connection
If the frontend can't connect to the backend:
1. Verify the backend is running on port 8080
2. Check the `REACT_APP_API_BASE_URL` in `.env`
3. Look for network errors in browser console

### Authentication Issues
If authentication fails:
1. Clear localStorage
2. Check JWT token expiration
3. Verify credentials are correct
4. Check backend logs for errors

## Future Enhancements

- Order history
- Payment integration
- Design history with filtering
- Social authentication
- Profile editing
- Favorites/wishlist
- Design sharing

