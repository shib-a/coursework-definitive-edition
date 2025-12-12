import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const LoginPage = () => {
    const [loginField, setLoginField] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!loginField || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(loginField, password);
        setLoading(false);

        if (result.success) {
            navigate('/profile');
        } else {
            setError(result.error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>Login</Typography>
            <TextField
                fullWidth
                label="Login (Email or Username)"
                variant="outlined"
                value={loginField}
                onChange={(e) => setLoginField(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button variant="outlined" fullWidth component={Link} to="/register">
                Don't have an account? Register
            </Button>
        </Box>
    );
};

export default LoginPage;