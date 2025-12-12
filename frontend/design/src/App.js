
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Button } from '@mui/material';
import { ShoppingCart as CartIcon, AccountCircle as ProfileIcon, Help as SupportIcon, Login as LoginIcon, Collections as MyContentIcon, Public as GalleryIcon, Dashboard as DashboardIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';

import DesignerPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutPage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyContentPage from './pages/MyContentPage';
import PublicGalleryPage from "./pages/PublicGalleryPage";
import ModeratorDashboard from './pages/ModeratorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { DesignProvider } from './DesignContext';
import {CartContext, CartProvider} from './CartContext';
import { AuthProvider, AuthContext } from './AuthContext';

const Header = () => {
    const { cartItems } = React.useContext(CartContext);
    const { user } = React.useContext(AuthContext);

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Tiishka
                    </Link>
                </Typography>
                <IconButton color="inherit" component={Link} to="/gallery" title="Community Gallery">
                    <GalleryIcon />
                </IconButton>
                <IconButton color="inherit" component={Link} to="/cart">
                    <Badge badgeContent={cartItems.length} color="secondary">
                        <CartIcon />
                    </Badge>
                </IconButton>
                {user && (
                    <IconButton color="inherit" component={Link} to="/my-content" title="My Designs & Images">
                        <MyContentIcon />
                    </IconButton>
                )}
                {user && (user.authority === 'MODERATOR' || user.authority === 'ADMIN') && (
                    <IconButton color="inherit" component={Link} to="/moderator" title="Moderator Dashboard">
                        <DashboardIcon />
                    </IconButton>
                )}
                {user && user.authority === 'ADMIN' && (
                    <IconButton color="inherit" component={Link} to="/admin" title="Admin Dashboard">
                        <AdminIcon />
                    </IconButton>
                )}
                {user ? (
                    <IconButton color="inherit" component={Link} to="/profile">
                        <Avatar>
                            <ProfileIcon />
                        </Avatar>
                    </IconButton>
                ) : (
                    <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                        Login
                    </Button>
                )}
                <IconButton color="inherit" component={Link} to="/support">
                    <SupportIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

const App = () => {
    return (

        <AuthProvider>
            <DesignProvider>
                <CartProvider>
                    <Router>
                        <Box sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <Header />

                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <Routes>
                                    <Route path="/" element={<DesignerPage />} />
                                    <Route path="/gallery" element={<PublicGalleryPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/my-content" element={<MyContentPage />} />
                                    <Route path="/cart" element={<ShoppingCartPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/support" element={<SupportPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/moderator" element={<ModeratorDashboard />} />
                                    <Route path="/admin" element={<AdminDashboard />} />
                                </Routes>
                            </Box>
                        </Box>
                    </Router>
                </CartProvider>
            </DesignProvider>
        </AuthProvider>
    );
};

export default App;