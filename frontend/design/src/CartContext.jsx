import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartAPI } from './services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchCartItems = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const items = await cartAPI.getCartItems();
            setCartItems(items);
        } catch (error) {
            console.error('Error fetching cart items:', error);
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
            alert('Please login to add items to cart');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const newItem = await cartAPI.addToCart(productId, quantity, size, color, price, designId);
            setCartItems((prev) => [...prev, newItem]);
            return { success: true, item: newItem };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.response?.data || 'Failed to add to cart' };
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
            console.error('Error updating cart item:', error);
            return { success: false, error: error.response?.data || 'Failed to update cart' };
        }
    };

    const removeItem = async (cartItemId) => {
        if (!user) return;

        try {
            await cartAPI.removeFromCart(cartItemId);
            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.response?.data || 'Failed to remove from cart' };
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            await cartAPI.clearCart();
            setCartItems([]);
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.response?.data || 'Failed to clear cart' };
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