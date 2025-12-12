import React, { createContext, useState, useCallback, useMemo } from 'react';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
    const [designState, setDesignState] = useState({
        color: 'Белый', // Shirt color (Russian name, will be converted to hex for rendering)
        size: 'M', // Shirt size
        designs: [], // Array of design objects: { id, src, left, top, scaleX, scaleY, angle, etc. }
        productId: null, // Selected product variant ID (will be set by ItemSection on first load)
        productName: 'Футболка базовая', // Default to basic t-shirt
        productPrice: 1500, // Default price for basic t-shirt
    });

    const updateDesign = useCallback((updates) => {
        console.log('DesignContext: updating design with:', updates);
        setDesignState((prev) => {
            const newState = { ...prev, ...updates };
            console.log('DesignContext: new state:', newState);
            return newState;
        });
    }, []);

    const addDesign = useCallback((newDesign) => {
        console.log('DesignContext: adding new design:', newDesign);
        setDesignState((prev) => {
            const designToAdd = { id: Date.now(), ...newDesign };
            const newState = {
                ...prev,
                designs: [...prev.designs, designToAdd],
            };
            console.log('DesignContext: designs after add:', newState.designs);
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

    const contextValue = useMemo(() => ({
        designState,
        updateDesign,
        addDesign,
        updateDesignElement
    }), [designState, updateDesign, addDesign, updateDesignElement]);

    return (
        <DesignContext.Provider value={contextValue}>
            {children}
        </DesignContext.Provider>
    );
};