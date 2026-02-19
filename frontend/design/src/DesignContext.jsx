import React, { createContext, useState, useCallback, useMemo } from 'react';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
    const [designState, setDesignState] = useState({
        color: 'Белый',
        size: 'M',
        designs: [],
        productId: null,
        productName: 'Футболка базовая',
        productPrice: 1500,
    });

    const updateDesign = useCallback((updates) => {
        setDesignState((prev) => {
            const newState = { ...prev, ...updates };
            return newState;
        });
    }, []);

    const addDesign = useCallback((newDesign) => {
        setDesignState((prev) => {
            const designToAdd = { id: Date.now(), ...newDesign };
            const newState = {
                ...prev,
                designs: [...prev.designs, designToAdd],
            };
            return newState;
        });
    }, []);

    const updateDesignElement = useCallback((id, props) => {
        setDesignState((prev) => ({
            ...prev,
            designs: prev.designs.map((design) =>
                design.id === id ? { ...design, ...props } : design
            ),
        }));
    }, []);

    const removeDesign = useCallback((id) => {
        setDesignState((prev) => ({
            ...prev,
            designs: prev.designs.filter((design) => design.id !== id),
        }));
    }, []);

    const contextValue = useMemo(() => ({
        designState,
        updateDesign,
        addDesign,
        updateDesignElement,
        removeDesign
    }), [designState, updateDesign, addDesign, updateDesignElement, removeDesign]);

    return (
        <DesignContext.Provider value={contextValue}>
            {children}
        </DesignContext.Provider>
    );
};