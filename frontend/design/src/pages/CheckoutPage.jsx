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
import { ordersAPI, addressesAPI } from '../services/api';
import { AuthContext } from '../AuthContext';
import { CartContext } from '../CartContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cartItems, refreshCart } = useContext(CartContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [shippingCost] = useState(299);
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadAddresses();
    }, [user, navigate]);

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
            console.error('Ошибка загрузки адресов:', err);
            setError('Ошибка загрузки адресов');
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
            setError('Ваша корзина пуста');
            return;
        }

        if (!addressId) {
            setError('Пожалуйста, выберите адрес доставки');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const order = await ordersAPI.createOrder(addressId, shippingCost);
            setSuccess(`Заказ успешно оформлен! Номер заказа: ${order.orderNumber}`);

            await refreshCart();

            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error('Ошибка создания заказа:', err);
            setError(err.response?.data?.error || 'Ошибка оформления заказа. Пожалуйста, попробуйте снова.');
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
                Оформление заказа
            </Typography>

            <Grid container spacing={3}>
                {/* Order Items */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Товары в заказе
                        </Typography>

                        {cartItems.length === 0 ? (
                            <Alert severity="info">Ваша корзина пуста</Alert>
                        ) : (
                            cartItems.map((item) => (
                                <Box key={item.cartItemId} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={8}>
                                            <Typography variant="subtitle1">
                                                {item.product?.productName || 'Товар'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Размер: {item.size} | Цвет: {item.color}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Количество: {item.quantity}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle1">
                                                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))
                        )}
                    </Paper>

                    {/* Shipping Address */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Адрес доставки
                        </Typography>

                        {loadingAddresses ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : addresses.length === 0 ? (
                            <Box>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    Адреса не найдены. Пожалуйста, добавьте адрес.
                                </Alert>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => navigate('/profile?tab=addresses')}
                                >
                                    Добавить адрес
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Выберите адрес</InputLabel>
                                    <Select
                                        value={addressId}
                                        label="Выберите адрес"
                                        onChange={(e) => setAddressId(e.target.value)}
                                    >
                                        {addresses.map((addr) => (
                                            <MenuItem key={addr.addressId} value={addr.addressId}>
                                                {addr.streetAddress}, {addr.city}, {addr.postalCode}
                                                {addr.isDefault && ' (По умолчанию)'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {addressId && addresses.find(a => a.addressId === addressId) && (
                                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                                        <Typography variant="body2">
                                            {addresses.find(a => a.addressId === addressId).streetAddress}<br />
                                            {addresses.find(a => a.addressId === addressId).city}, {addresses.find(a => a.addressId === addressId).postalCode}<br />
                                            {addresses.find(a => a.addressId === addressId).country?.countryName || 'Страна'}
                                        </Typography>
                                    </Paper>
                                )}

                                <Button
                                    variant="text"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => navigate('/profile?tab=addresses')}
                                >
                                    Управление адресами
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom>
                            Итого заказа
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Подытог:</Typography>
                                <Typography>{calculateSubtotal().toLocaleString('ru-RU')} ₽</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Доставка:</Typography>
                                <Typography>{shippingCost.toLocaleString('ru-RU')} ₽</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Итого:</Typography>
                                <Typography variant="h6" color="primary">
                                    {calculateTotal().toLocaleString('ru-RU')} ₽
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
                            {loading ? <CircularProgress size={24} /> : 'Оформить заказ'}
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/cart')}
                            disabled={loading}
                        >
                            Вернуться в корзину
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CheckoutPage;

