import React, { useContext, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ShoppingBag as ItemIcon,
    Image as ImagesIcon,
    Refresh as ResetIcon,
    ExpandMore as ExpandMoreIcon,
    ShoppingCart as CartIcon,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import GenerationSection from '../components/GenerationSection';
import ItemSection from '../components/ItemSection';
import ImagesSection from '../components/ImageSection';
import Preview from '../components/Preview';
import {DesignContext} from "../DesignContext";
import { CartContext } from '../CartContext';
import { AuthContext } from '../AuthContext';

const MainPage = () => {
    const [expandedPanel, setExpandedPanel] = useState('product-generation');
    const { updateDesign } = useContext(DesignContext);
    const { designState } = useContext(DesignContext);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedPanel(isExpanded ? panel : false);
    };

    const resetDesign = () => {
        updateDesign({
            color: 'Белый',
            size: 'M',
            designs: [],
            productId: null,
            productName: null,
            productPrice: 0,
        });
    };

    const handleAddToCart = async () => {
        if (!user) {
            if (window.confirm('Для добавления в корзину необходимо войти в систему. Перейти на страницу входа?')) {
                navigate('/login');
            }
            return;
        }

        if (!designState.productId) {
            alert('Пожалуйста, сначала выберите продукт в разделе Item');
            return;
        }

        const result = await addToCart(
            designState.productId,
            1,
            designState.size || 'M',
            designState.color || 'Белый',
            designState.productPrice || 0,
            null
        );

        if (result.success) {
            alert(`Товар добавлен в корзину!\n${designState.productName || 'Продукт'} (${designState.size}, ${designState.color})`);
        } else {
            alert(result.error || 'Не удалось добавить товар в корзину');
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #ddd',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    <Accordion
                        expanded={expandedPanel === 'product-generation'}
                        onChange={handleAccordionChange('product-generation')}
                        sx={{
                            mb: 1,
                            '&:before': { display: 'none' },
                            boxShadow: expandedPanel === 'product-generation' ? 3 : 1,
                            border: expandedPanel === 'product-generation' ? '2px solid #1976d2' : '1px solid #ddd',
                            borderRadius: '8px !important',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                backgroundColor: expandedPanel === 'product-generation' ? '#e3f2fd' : '#f5f5f5',
                                borderRadius: expandedPanel === 'product-generation' ? '6px 6px 0 0' : '8px',
                                '&:hover': { backgroundColor: '#e3f2fd' },
                            }}
                        >
                            <ItemIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography fontWeight="bold">Продукт и генерация</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, backgroundColor: '#fafafa' }}>
                            <Box sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                    Выбор продукта
                                </Typography>
                                <ItemSection />
                            </Box>
                            <Box sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                    AI Генерация
                                </Typography>
                                <GenerationSection />
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion
                        expanded={expandedPanel === 'images'}
                        onChange={handleAccordionChange('images')}
                        sx={{
                            '&:before': { display: 'none' },
                            boxShadow: expandedPanel === 'images' ? 3 : 1,
                            border: expandedPanel === 'images' ? '2px solid #1976d2' : '1px solid #ddd',
                            borderRadius: '8px !important',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                backgroundColor: expandedPanel === 'images' ? '#e3f2fd' : '#f5f5f5',
                                borderRadius: expandedPanel === 'images' ? '6px 6px 0 0' : '8px',
                                '&:hover': { backgroundColor: '#e3f2fd' },
                            }}
                        >
                            <ImagesIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography fontWeight="bold">Изображения</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, backgroundColor: '#fafafa' }}>
                            <ImagesSection />
                        </AccordionDetails>
                    </Accordion>
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ResetIcon />}
                            onClick={resetDesign}
                            fullWidth
                        >
                            Сбросить
                        </Button>
                        <Button
                            variant="contained"
                            color={user ? "primary" : "secondary"}
                            startIcon={user ? <CartIcon /> : <LoginIcon />}
                            onClick={handleAddToCart}
                            fullWidth
                        >
                            {user ? 'В корзину' : 'Войти'}
                        </Button>
                    </Stack>
                </Box>
            </Box>

            <Preview />
        </Box>
    );
};

export default MainPage;