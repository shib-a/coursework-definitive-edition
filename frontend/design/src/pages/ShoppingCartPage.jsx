import React, { useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, IconButton, Stack, CircularProgress, Alert, Divider } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, ShoppingCart as EmptyCartIcon } from '@mui/icons-material';
import { CartContext } from '../CartContext';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const ShoppingCartPage = () => {
    const { cartItems, updateQuantity, removeItem, clearCart, loading } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleUpdateQuantity = async (cartItemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;

        await updateQuantity(cartItemId, newQuantity);
    };

    const handleRemoveItem = async (cartItemId) => {
        if (window.confirm('Remove this item from cart?')) {
            await removeItem(cartItemId);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear all items from cart?')) {
            await clearCart();
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    if (!user) {
        return (
            <Box sx={{ p: 4, maxWidth: 800, margin: 'auto', textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Please login to view your shopping cart
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Box sx={{ p: 4, maxWidth: 800, margin: 'auto', textAlign: 'center' }}>
                <EmptyCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Start Shopping
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: 900, margin: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Shopping Cart</Typography>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearCart}
                    size="small"
                >
                    Clear Cart
                </Button>
            </Box>

            <List>
                {cartItems.map((item) => (
                    <React.Fragment key={item.cartItemId}>
                        <ListItem
                            sx={{
                                py: 2,
                                display: 'flex',
                                alignItems: 'flex-start'
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="h6">
                                            {item.product?.productName || 'Custom Product'}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Size: {item.size} | Color: {item.color}
                                            </Typography>
                                            {item.product && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Material: {item.product.material}
                                                </Typography>
                                            )}
                                            {item.design && (
                                                <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                                                    With custom design
                                                </Typography>
                                            )}
                                            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                ${(item.price || 0).toFixed(2)} × {item.quantity} = ${((item.price || 0) * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                                <IconButton
                                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, -1)}
                                    disabled={item.quantity <= 1}
                                    size="small"
                                >
                                    <RemoveIcon />
                                </IconButton>
                                <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                                    {item.quantity}
                                </Typography>
                                <IconButton
                                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, 1)}
                                    size="small"
                                >
                                    <AddIcon />
                                </IconButton>
                            </Stack>

                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemoveItem(item.cartItemId)}
                                sx={{ ml: 2 }}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Subtotal:</Typography>
                    <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="body1">Items:</Typography>
                    <Typography variant="body1">{cartItems.length}</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/checkout')}
                >
                    Proceed to Checkout
                </Button>
            </Box>
        </Box>
    );
};

export default ShoppingCartPage;