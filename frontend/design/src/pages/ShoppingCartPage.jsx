import React, { useContext, useState } from 'react';
import {
    Box, Typography, List, Button, IconButton,
    Stack, CircularProgress, Alert, Card, CardMedia, Modal,
    Paper, Chip
} from '@mui/material';
import {
    Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon,
    ShoppingCart as EmptyCartIcon, Visibility as ViewIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { CartContext } from '../CartContext';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import getApiImageUrl from '../utils/apiImageUrl';

const ShoppingCartPage = () => {
    const { cartItems, updateQuantity, removeItem, clearCart, loading } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);

    const handleUpdateQuantity = async (cartItemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;
        await updateQuantity(cartItemId, newQuantity);
    };

    const handleRemoveItem = async (cartItemId) => {
        if (window.confirm('Удалить товар из корзины?')) {
            await removeItem(cartItemId);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Очистить корзину?')) {
            await clearCart();
        }
    };

    const handleOpenPreview = (item) => {
        setPreviewItem(item);
        setPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewItem(null);
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const getDesignImageUrl = (item) => {
        if (item.design) {
            if (item.design.imageData?.imgdId) {
                return getApiImageUrl(`/api/images/${item.design.imageData.imgdId}/file`);
            }
            if (item.design.imageId) {
                return getApiImageUrl(`/api/images/${item.design.imageId}/file`);
            }
            if (item.design.designId) {
                return getApiImageUrl(`/api/designs/${item.design.designId}/image`);
            }
            if (item.design.imageUrl) {
                return getApiImageUrl(item.design.imageUrl);
            }
        }

        if (item.designId) {
            return getApiImageUrl(`/api/designs/${item.designId}/image`);
        }

        if (item.designPreviewUrl) {
            return getApiImageUrl(item.designPreviewUrl);
        }

        if (item.product?.imageUrl) {
            return getApiImageUrl(item.product.imageUrl);
        }

        return null;
    };

    const formatPrice = (price) => {
        return `${(price || 0).toLocaleString('ru-RU')} ₽`;
    };

    if (!user) {
        return (
            <Box sx={{ p: 4, maxWidth: 800, margin: 'auto', textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Войдите в аккаунт, чтобы просмотреть корзину
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Войти
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
                <Typography variant="h5" gutterBottom>Ваша корзина пуста</Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Начать покупки
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1100, margin: 'auto', overflowY: 'auto', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Корзина</Typography>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearCart}
                    size="small"
                >
                    Очистить корзину
                </Button>
            </Box>

            <List>
                {cartItems.map((item) => {
                    const designImageUrl = getDesignImageUrl(item);

                    return (
                        <React.Fragment key={item.cartItemId}>
                            <Card
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    boxShadow: 2,
                                    '&:hover': { boxShadow: 4 }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 120,
                                        minHeight: 120,
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: designImageUrl ? 'pointer' : 'default',
                                    }}
                                    onClick={() => designImageUrl && handleOpenPreview(item)}
                                >
                                    {designImageUrl ? (
                                        <>
                                            <CardMedia
                                                component="img"
                                                image={designImageUrl}
                                                alt="Превью дизайна"
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    borderRadius: '50%',
                                                    p: 0.5,
                                                }}
                                            >
                                                <ViewIcon sx={{ color: 'white', fontSize: 16 }} />
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>
                                            Нет дизайна
                                        </Typography>
                                    )}
                                </Box>

                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" gutterBottom>
                                        {item.product?.productName || 'Товар'}
                                    </Typography>

                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                        <Chip label={`Размер: ${item.size}`} size="small" variant="outlined" />
                                        <Chip label={`Цвет: ${item.color}`} size="small" variant="outlined" />
                                    </Stack>

                                    {item.product && (
                                        <Typography variant="body2" color="text.secondary">
                                            Материал: {item.product.material}
                                        </Typography>
                                    )}

                                    {(item.design || item.designId) && (
                                        <Chip
                                            label="С кастомным дизайном"
                                            color="primary"
                                            size="small"
                                            sx={{ mt: 1, width: 'fit-content' }}
                                        />
                                    )}

                                    <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
                                        {formatPrice(item.price)} × {item.quantity} = {formatPrice((item.price || 0) * item.quantity)}
                                    </Typography>
                                </Box>

                                <Stack direction="column" spacing={1} alignItems="center" justifyContent="center" sx={{ ml: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <IconButton
                                            onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, -1)}
                                            disabled={item.quantity <= 1}
                                            size="small"
                                            sx={{ border: '1px solid #ddd' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                                            {item.quantity}
                                        </Typography>
                                        <IconButton
                                            onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, 1)}
                                            size="small"
                                            sx={{ border: '1px solid #ddd' }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Stack>

                                    <IconButton
                                        onClick={() => handleRemoveItem(item.cartItemId)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            </Card>
                        </React.Fragment>
                    );
                })}
            </List>

            {/* Summary */}
            <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Итого:</Typography>
                    <Typography variant="h6" color="primary">{formatPrice(calculateTotal())}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="body1">Товаров:</Typography>
                    <Typography variant="body1">{cartItems.length}</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/checkout')}
                >
                    Оформить заказ
                </Button>
            </Paper>

            {/* Preview Modal */}
            <Modal
                open={previewOpen}
                onClose={handleClosePreview}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paper
                    sx={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        p: 2,
                        borderRadius: 2,
                        outline: 'none',
                    }}
                >
                    <IconButton
                        onClick={handleClosePreview}
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {previewItem && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                {previewItem.product?.productName || 'Товар'}
                            </Typography>
                            <Box
                                sx={{
                                    maxWidth: 500,
                                    maxHeight: 500,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 1,
                                }}
                            >
                                <img
                                    src={getDesignImageUrl(previewItem)}
                                    alt="Превью дизайна"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: 500,
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                                <Chip label={`Размер: ${previewItem.size}`} />
                                <Chip label={`Цвет: ${previewItem.color}`} />
                                <Chip label={`Кол-во: ${previewItem.quantity}`} color="primary" />
                            </Stack>
                        </Box>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
};

export default ShoppingCartPage;
