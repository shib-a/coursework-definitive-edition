import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartAPI } from './services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchCartItems = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            const items = await cartAPI.getCartItems();
            setCartItems(Array.isArray(items) ? items : []);
        } catch (error) {
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCartItems();
        } else {
            setCartItems([]);
        }
    }, [user, fetchCartItems]);

    const addToCart = async (productId, quantity = 1, size, color, price, designId = null) => {
        if (!user) {
            alert('Войдите для добавления товаров в корзину');
            return { success: false, error: 'Не авторизован' };
        }

        try {
            const newItem = await cartAPI.addToCart(productId, quantity, size, color, price, designId);
            setCartItems((prev) => [...prev, newItem]);
            return { success: true, item: newItem };
        } catch (error) {
            return { success: false, error: error.response?.data || 'Ошибка добавления в корзину' };
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) return;

        try {
            const updatedItem = await cartAPI.updateCartItem(cartItemId, newQuantity);
            setCartItems((prev) =>
                prev.map((item) =>
                    item.cartItemId === cartItemId ? updatedItem : item
                )
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data || 'Ошибка обновления корзины' };
        }
    };

    const removeItem = async (cartItemId) => {
        if (!user) return;

        try {
            await cartAPI.removeFromCart(cartItemId);
            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data || 'Ошибка удаления из корзины' };
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            await cartAPI.clearCart();
            setCartItems([]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data || 'Ошибка очистки корзины' };
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            refreshCart: fetchCartItems
        }}>
            {children}
        </CartContext.Provider>
    );
};