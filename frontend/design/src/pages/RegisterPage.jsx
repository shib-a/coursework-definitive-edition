import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async () => {

        if (!username || !login || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(username, login, password);
        setLoading(false);

        if (result.success) {
            navigate('/profile');
        } else {
            setError(result.error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>Register</Typography>
            <TextField
                fullWidth
                label="Username (Display Name)"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
                helperText="This will be your display name"
            />
            <TextField
                fullWidth
                label="Login (Email or Username)"
                variant="outlined"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
                helperText="This will be used to login"
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
                helperText="Minimum 6 characters"
            />
            <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegister}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button variant="outlined" fullWidth component={Link} to="/login">
                Already have an account? Login
            </Button>
        </Box>
    );
};

export default RegisterPage;