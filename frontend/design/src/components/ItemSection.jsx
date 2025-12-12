import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, ToggleButton, ToggleButtonGroup, CircularProgress, Alert } from '@mui/material';
import { DesignContext } from '../DesignContext';
import { productsAPI } from '../services/api';

const ItemSection = () => {
    const { updateDesign, designState } = useContext(DesignContext);
    const [productGroups, setProductGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedProductGroup, setSelectedProductGroup] = useState(null);
    const [selectedSize, setSelectedSize] = useState(designState.size || 'M');
    const [selectedColor, setSelectedColor] = useState(designState.color || 'Белый');
    const hasLoadedProducts = useRef(false);

    useEffect(() => {
        if (hasLoadedProducts.current) {
            console.log('ItemSection: Products already loaded, skipping');
            return;
        }
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await productsAPI.getGroupedProducts();
                console.log('ItemSection: Loaded product groups:', data);
                setProductGroups(data);

                if (data.length > 0) {

                    if (designState.productId && designState.productName) {
                        console.log('ItemSection: Product already selected:', designState.productName);

                        const existingGroup = data.find(p => p.productName === designState.productName);
                        if (existingGroup) {
                            setSelectedProductGroup(existingGroup);
                            setSelectedSize(designState.size);
                            setSelectedColor(designState.color);
                            console.log('ItemSection: Restored previous selection');
                            return; // Don't override existing selection
                        }
                    }

                    console.log('ItemSection: No product selected, choosing default');
                    const tshirtGroup = data.find(p => p.productName === 'Футболка базовая') || data[0];
                    console.log('ItemSection: Selected default product group:', tshirtGroup);
                    setSelectedProductGroup(tshirtGroup);

                    const defaultSize = tshirtGroup.availableSizes.includes('M') ? 'M' : tshirtGroup.availableSizes[0];
                    const defaultColor = tshirtGroup.availableColors.includes('Белый') ? 'Белый' : tshirtGroup.availableColors[0];
                    console.log('ItemSection: Default size and color:', defaultSize, defaultColor);
                    setSelectedSize(defaultSize);
                    setSelectedColor(defaultColor);

                    const variant = tshirtGroup.variants.find(
                        v => v.size === defaultSize && v.color === defaultColor
                    );
                    console.log('ItemSection: Found variant:', variant);

                    if (variant) {
                        const designUpdate = {
                            productId: variant.productId,
                            productPrice: variant.basePrice,
                            size: defaultSize,
                            color: defaultColor,
                            productName: tshirtGroup.productName
                        };
                        console.log('ItemSection: Updating design with:', designUpdate);
                        updateDesign(designUpdate);
                    }
                }
            } catch (err) {
                console.error('ItemSection: Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
                hasLoadedProducts.current = true;
            }
        };

        fetchProducts();

    }, []); // Empty dependency array - fetch only once on mount

    useEffect(() => {
        if (productGroups.length > 0 && designState.productName && selectedProductGroup?.productName !== designState.productName) {
            console.log('ItemSection: Syncing with global state:', designState);
            const group = productGroups.find(p => p.productName === designState.productName);
            if (group) {
                setSelectedProductGroup(group);
                setSelectedSize(designState.size);
                setSelectedColor(designState.color);
            }
        }
    }, [designState.productName, designState.size, designState.color, productGroups, selectedProductGroup]);

    const updateSelectedVariant = useCallback((productGroup, size, color) => {
        if (!productGroup) return;

        const variant = productGroup.variants.find(
            v => v.size === size && v.color === color
        );

        if (variant) {
            updateDesign({
                productId: variant.productId,
                productPrice: variant.basePrice,
                size: size,
                color: color,
                productName: productGroup.productName
            });
        } else {

            console.warn(`Variant not available: ${productGroup.productName} - ${size} - ${color}`);
        }
    }, [updateDesign]);

    const handleProductChange = (event) => {
        const productName = event.target.value;
        const productGroup = productGroups.find(p => p.productName === productName);
        setSelectedProductGroup(productGroup);

        if (productGroup) {

            const defaultSize = productGroup.availableSizes[0] || 'M';
            const defaultColor = productGroup.availableColors[0] || 'Белый';
            setSelectedSize(defaultSize);
            setSelectedColor(defaultColor);
            updateSelectedVariant(productGroup, defaultSize, defaultColor);
        }
    };

    const handleSizeChange = (event) => {
        const newSize = event.target.value;
        setSelectedSize(newSize);
        updateSelectedVariant(selectedProductGroup, newSize, selectedColor);
    };

    const handleColorChange = (event, newColor) => {
        if (newColor) {
            setSelectedColor(newColor);
            updateSelectedVariant(selectedProductGroup, selectedSize, newColor);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    const getCurrentVariant = () => {
        if (!selectedProductGroup) return null;
        return selectedProductGroup.variants.find(
            v => v.size === selectedSize && v.color === selectedColor
        );
    };

    const currentVariant = getCurrentVariant();

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Выбор продукта</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {}
            {productGroups.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Тип продукта</InputLabel>
                    <Select
                        value={selectedProductGroup?.productName || ''}
                        onChange={handleProductChange}
                    >
                        {productGroups.map((group) => (
                            <MenuItem key={group.productName} value={group.productName}>
                                {group.productName} - от {group.basePrice?.toFixed(2)} ₽
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {selectedProductGroup && (
                <>
                    {}
                    <Typography variant="h6" gutterBottom>Цвет</Typography>
                    <ToggleButtonGroup
                        value={selectedColor}
                        exclusive
                        onChange={handleColorChange}
                        aria-label="product color"
                        sx={{ mb: 3, flexWrap: 'wrap' }}
                    >
                        {selectedProductGroup.availableColors.map((color) => (
                            <ToggleButton
                                key={color}
                                value={color}
                                aria-label={color}
                                sx={{ minWidth: 100 }}
                            >
                                {color}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Размер</InputLabel>
                        <Select value={selectedSize} onChange={handleSizeChange}>
                            {selectedProductGroup.availableSizes.map((size) => (
                                <MenuItem key={size} value={size}>{size}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {}
                    {currentVariant ? (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                            <Typography variant="body2">
                                <strong>Выбрано:</strong> {selectedProductGroup.productName}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Размер:</strong> {selectedSize} | <strong>Цвет:</strong> {selectedColor}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Материал:</strong> {selectedProductGroup.material}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
                                Цена: {currentVariant.basePrice?.toFixed(2)} ₽
                            </Typography>
                        </Box>
                    ) : (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Комбинация размера "{selectedSize}" и цвета "{selectedColor}" недоступна
                        </Alert>
                    )}

                    {}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Доступно вариантов: {selectedProductGroup.variants.length}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ItemSection;