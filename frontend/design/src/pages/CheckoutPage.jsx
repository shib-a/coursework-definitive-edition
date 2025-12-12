import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, cartAPI, addressesAPI } from '../services/api';
import { AuthContext } from '../AuthContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [shippingCost] = useState(5.99); // Fixed shipping cost for now
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadCart();
        loadAddresses();
    }, [user, navigate]);

    const loadCart = async () => {
        try {
            const items = await cartAPI.getCartItems();
            setCartItems(items);
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to load cart items');
        }
    };

    const loadAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const data = await addressesAPI.getUserAddresses();
            setAddresses(Array.isArray(data) ? data : []);

            const defaultAddr = data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setAddressId(defaultAddr.addressId);
            } else if (data.length > 0) {
                setAddressId(data[0].addressId);
            }
        } catch (err) {
            console.error('Error loading addresses:', err);
            setError('Failed to load addresses');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + shippingCost;
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        if (!addressId) {
            setError('Please select a shipping address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const order = await ordersAPI.createOrder(addressId, shippingCost);
            setSuccess(`Order placed successfully! Order number: ${order.orderNumber}`);

            setCartItems([]);

            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.response?.data?.error || 'Failed to create order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Checkout
            </Typography>

            <Grid container spacing={3}>
                {}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>

                        {cartItems.length === 0 ? (
                            <Alert severity="info">Your cart is empty</Alert>
                        ) : (
                            cartItems.map((item) => (
                                <Box key={item.cartItemId} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={8}>
                                            <Typography variant="subtitle1">
                                                {item.product?.productName || 'Product'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Size: {item.size} | Color: {item.color}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Quantity: {item.quantity}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle1">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))
                        )}
                    </Paper>

                    {}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Shipping Address
                        </Typography>

                        {loadingAddresses ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : addresses.length === 0 ? (
                            <Box>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    No addresses found. Please add an address first.
                                </Alert>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => navigate('/profile?tab=addresses')}
                                >
                                    Add Address
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select Address</InputLabel>
                                    <Select
                                        value={addressId}
                                        label="Select Address"
                                        onChange={(e) => setAddressId(e.target.value)}
                                    >
                                        {addresses.map((addr) => (
                                            <MenuItem key={addr.addressId} value={addr.addressId}>
                                                {addr.streetAddress}, {addr.city}, {addr.postalCode}
                                                {addr.isDefault && ' (Default)'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {addressId && addresses.find(a => a.addressId === addressId) && (
                                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                                        <Typography variant="body2">
                                            {addresses.find(a => a.addressId === addressId).streetAddress}<br />
                                            {addresses.find(a => a.addressId === addressId).city}, {addresses.find(a => a.addressId === addressId).postalCode}<br />
                                            {addresses.find(a => a.addressId === addressId).country?.countryName || 'Country'}
                                        </Typography>
                                    </Paper>
                                )}

                                <Button
                                    variant="text"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => navigate('/profile?tab=addresses')}
                                >
                                    Manage Addresses
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>

                {}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>${calculateSubtotal().toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Shipping:</Typography>
                                <Typography>${shippingCost.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6" color="primary">
                                    ${calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0 || !addressId}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Place Order'}
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/cart')}
                            disabled={loading}
                        >
                            Back to Cart
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CheckoutPage;

