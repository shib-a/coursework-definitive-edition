import React, { useRef, useEffect, useContext, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { fabric } from 'fabric';
import { DesignContext } from '../DesignContext';
import { colorNameToHex } from '../utils/colorUtils';
import getApiImageUrl from '../utils/apiImageUrl';

const Preview = () => {
    const { designState, updateDesignElement } = useContext(DesignContext);
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const baseShirtImage = useRef(null);
    const [isCanvasReady, setIsCanvasReady] = React.useState(false);

    useEffect(() => {
        console.log('Preview: Component mounted, fabricCanvas exists:', !!fabricCanvas.current);

        if (fabricCanvas.current) {
            console.log('Preview: Canvas already initialized, skipping');
            return;
        }

        console.log('Preview: Creating new canvas...');

        const timer = setTimeout(() => {
            if (canvasRef.current && !fabricCanvas.current) {
                console.log('Preview: Initializing Fabric.js canvas');
                fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                    width: 800,
                    height: 800,
                });

                console.log('Preview: Canvas created, loading initial shirt color:', designState.color);

                const hexColor = colorNameToHex(designState.color);
                updateShirtColor(hexColor);

                setIsCanvasReady(true);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (fabricCanvas.current) {
                console.log('Preview: Component unmounting, disposing canvas');
                fabricCanvas.current.dispose();
                fabricCanvas.current = null;
                setIsCanvasReady(false);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updateShirtColor = useCallback((hexColor) => {
        if (!fabricCanvas.current || !isCanvasReady) return;

        const baseShirtSrc = '/white_front_1.png';
        fabric.Image.fromURL(baseShirtSrc, (img) => {
            if (!img) {
                console.error('Failed to load image from:', baseShirtSrc);
                return;
            }

            if (!fabricCanvas.current || !fabricCanvas.current.getContext) {
                console.error('Canvas not available');
                return;
            }

            const colorFilter = new fabric.Image.filters.BlendColor({
                color: hexColor,
                mode: 'multiply',
                alpha: 1,
            });
            img.filters = [colorFilter];
            img.applyFilters();

            const canvasWidth = fabricCanvas.current.width;
            const canvasHeight = fabricCanvas.current.height;
            const scale = canvasHeight / img.height;
            const scaledWidth = img.width * scale;

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'left',
                originY: 'top',
                left: (canvasWidth - scaledWidth) / 2,
                top: 0,
                selectable: false,
            });

            baseShirtImage.current = img;

            if (fabricCanvas.current && fabricCanvas.current.getContext) {
                fabricCanvas.current.setBackgroundImage(img, () => {
                    if (fabricCanvas.current) {
                        fabricCanvas.current.renderAll();
                    }
                });
            }
        }, { crossOrigin: 'anonymous' });
    }, [isCanvasReady]);

    useEffect(() => {
        if (!isCanvasReady) {
            console.log('Preview: Canvas not ready yet for color change:', designState.color);
            return;
        }

        console.log('Preview: Updating shirt color:', designState.color);
        const hexColor = colorNameToHex(designState.color);
        console.log('Preview: Hex color:', hexColor);
        updateShirtColor(hexColor);
    }, [designState.color, isCanvasReady, updateShirtColor]);

    useEffect(() => {
        if (!isCanvasReady || !fabricCanvas.current) {
            console.log('Preview: Canvas not ready for designs (isCanvasReady:', isCanvasReady, ', canvas exists:', !!fabricCanvas.current, ')');
            return;
        }

        console.log('Preview: Design state changed, current designs:', designState.designs.length, 'designs');

        const canvasObjects = fabricCanvas.current.getObjects();
        console.log('Preview: Current objects on canvas:', canvasObjects.length);

        const existingDesignIds = canvasObjects.map(obj => obj.designId).filter(Boolean);
        const newDesigns = designState.designs.filter(design => !existingDesignIds.includes(design.id));

        const currentDesignIds = designState.designs.map(d => d.id);
        const objectsToRemove = canvasObjects.filter(obj => obj.designId && !currentDesignIds.includes(obj.designId));

        console.log('Preview: New designs to add:', newDesigns.length);
        console.log('Preview: Objects to remove:', objectsToRemove.length);

        objectsToRemove.forEach(obj => {
            console.log('Preview: Removing object with designId:', obj.designId);
            fabricCanvas.current.remove(obj);
        });

        newDesigns.forEach((design) => {
            const imageUrl = getApiImageUrl(design.src);
            console.log('Preview: Loading new design image:', design.src, '-> Full URL:', imageUrl);
            fabric.Image.fromURL(imageUrl, (img) => {
                if (!img) {
                    console.error('Preview: Failed to load design image:', design.src, 'Full URL:', imageUrl);
                    return;
                }

                if (!fabricCanvas.current) {
                    console.error('Preview: Canvas no longer available');
                    return;
                }

                console.log('Preview: Successfully loaded design image:', imageUrl);

                img.designId = design.id;

                img.set({
                    left: design.left || 100,
                    top: design.top || 100,
                    scaleX: design.scaleX || 0.5,
                    scaleY: design.scaleY || 0.5,
                    angle: design.angle || 0,
                    selectable: true,
                });

                img.on('modified', () => {
                    updateDesignElement(design.id, {
                        left: img.left,
                        top: img.top,
                        scaleX: img.scaleX,
                        scaleY: img.scaleY,
                        angle: img.angle,
                    });
                });

                if (fabricCanvas.current) {
                    fabricCanvas.current.add(img);
                    fabricCanvas.current.renderAll();
                    console.log('Preview: Design added to canvas, total objects:', fabricCanvas.current.getObjects().length);
                }
            }, { crossOrigin: 'anonymous' });
        });
    }, [designState.designs, isCanvasReady, updateDesignElement]);

    const scale = { S: 0.9, M: 1, L: 1.1, XL: 1.2 }[designState.size] || 1;

    return (
        <Box
            sx={{
                width: '50%',
                borderRight: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: '#f9f9f9',
                p: 2,
                overflowY: 'auto',
            }}
        >
            <div style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease', transformOrigin: 'top center' }}>
                <canvas ref={canvasRef}/>
            </div>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Size: {designState.size}
            </Typography>
        </Box>
    );
};

export default Preview;