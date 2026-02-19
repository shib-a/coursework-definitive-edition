import React, { useRef, useEffect, useContext, useCallback, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, Slider, Stack, Divider } from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    RotateRight as RotateIcon,
    Delete as DeleteIcon,
    CenterFocusStrong as CenterIcon,
    Flip as FlipIcon,
} from '@mui/icons-material';
import { fabric } from 'fabric';
import { DesignContext } from '../DesignContext';
import { colorNameToHex } from '../utils/colorUtils';
import getApiImageUrl from '../utils/apiImageUrl';

const Preview = () => {
    const { designState, updateDesignElement, removeDesign } = useContext(DesignContext);
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const baseShirtImage = useRef(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [objectScale, setObjectScale] = useState(50);
    const [objectRotation, setObjectRotation] = useState(0);

    useEffect(() => {
        if (fabricCanvas.current) return;

        const timer = setTimeout(() => {
            if (canvasRef.current && !fabricCanvas.current) {
                fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                    width: 500,
                    height: 500,
                    selection: true,
                });

                fabric.Object.prototype.set({
                    transparentCorners: false,
                    cornerColor: '#1976d2',
                    cornerStrokeColor: '#1976d2',
                    borderColor: '#1976d2',
                    cornerSize: 12,
                    cornerStyle: 'circle',
                    borderScaleFactor: 2,
                    padding: 10,
                });

                fabricCanvas.current.on('selection:created', (e) => {
                    setSelectedObject(e.selected[0]);
                    updateControlsFromObject(e.selected[0]);
                });

                fabricCanvas.current.on('selection:updated', (e) => {
                    setSelectedObject(e.selected[0]);
                    updateControlsFromObject(e.selected[0]);
                });

                fabricCanvas.current.on('selection:cleared', () => {
                    setSelectedObject(null);
                    setObjectScale(50);
                    setObjectRotation(0);
                });

                fabricCanvas.current.on('object:modified', (e) => {
                    updateControlsFromObject(e.target);
                });

                const hexColor = colorNameToHex(designState.color);
                updateShirtColor(hexColor);
                setIsCanvasReady(true);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (fabricCanvas.current) {
                fabricCanvas.current.dispose();
                fabricCanvas.current = null;
                setIsCanvasReady(false);
            }
        };
    }, []);

    const updateControlsFromObject = (obj) => {
        if (obj) {
            const avgScale = ((obj.scaleX + obj.scaleY) / 2) * 100;
            setObjectScale(Math.round(avgScale));
            setObjectRotation(Math.round(obj.angle || 0));
        }
    };

    const updateShirtColor = useCallback((hexColor) => {
        if (!fabricCanvas.current || !isCanvasReady) return;

        const baseShirtSrc = '/white_front_1.png';
        fabric.Image.fromURL(baseShirtSrc, (img) => {
            if (!img || !fabricCanvas.current) return;

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

            if (fabricCanvas.current) {
                fabricCanvas.current.setBackgroundImage(img, () => {
                    fabricCanvas.current?.renderAll();
                });
            }
        }, { crossOrigin: 'anonymous' });
    }, [isCanvasReady]);

    useEffect(() => {
        if (!isCanvasReady) return;
        const hexColor = colorNameToHex(designState.color);
        updateShirtColor(hexColor);
    }, [designState.color, isCanvasReady, updateShirtColor]);

    useEffect(() => {
        if (!isCanvasReady || !fabricCanvas.current) return;

        const canvasObjects = fabricCanvas.current.getObjects();
        const existingDesignIds = canvasObjects.map(obj => obj.designId).filter(Boolean);
        const newDesigns = designState.designs.filter(design => !existingDesignIds.includes(design.id));
        const currentDesignIds = designState.designs.map(d => d.id);
        const objectsToRemove = canvasObjects.filter(obj => obj.designId && !currentDesignIds.includes(obj.designId));

        objectsToRemove.forEach(obj => {
            fabricCanvas.current.remove(obj);
        });

        newDesigns.forEach((design) => {
            const imageUrl = getApiImageUrl(design.src);
            fabric.Image.fromURL(imageUrl, (img) => {
                if (!img || !fabricCanvas.current) return;

                img.designId = design.id;

                img.set({
                    left: design.left || 250,
                    top: design.top || 150,
                    scaleX: design.scaleX || 0.3,
                    scaleY: design.scaleY || 0.3,
                    angle: design.angle || 0,
                    selectable: true,
                    cornerColor: '#1976d2',
                    cornerStrokeColor: '#fff',
                    borderColor: '#1976d2',
                    cornerSize: 14,
                    cornerStyle: 'circle',
                    transparentCorners: false,
                    borderScaleFactor: 2.5,
                    padding: 10,
                });

                img.on('modified', () => {
                    updateDesignElement(design.id, {
                        left: img.left,
                        top: img.top,
                        scaleX: img.scaleX,
                        scaleY: img.scaleY,
                        angle: img.angle,
                    });
                    updateControlsFromObject(img);
                });

                fabricCanvas.current.add(img);
                fabricCanvas.current.setActiveObject(img);
                fabricCanvas.current.renderAll();
            }, { crossOrigin: 'anonymous' });
        });
    }, [designState.designs, isCanvasReady, updateDesignElement]);

    const handleScaleChange = (event, newValue) => {
        setObjectScale(newValue);
        if (selectedObject && fabricCanvas.current) {
            const scale = newValue / 100;
            selectedObject.set({ scaleX: scale, scaleY: scale });
            fabricCanvas.current.renderAll();
            if (selectedObject.designId) {
                updateDesignElement(selectedObject.designId, { scaleX: scale, scaleY: scale });
            }
        }
    };

    const handleRotationChange = (event, newValue) => {
        setObjectRotation(newValue);
        if (selectedObject && fabricCanvas.current) {
            selectedObject.set({ angle: newValue });
            fabricCanvas.current.renderAll();
            if (selectedObject.designId) {
                updateDesignElement(selectedObject.designId, { angle: newValue });
            }
        }
    };

    const handleZoomIn = () => {
        if (selectedObject && fabricCanvas.current) {
            const newScale = Math.min(objectScale + 10, 200);
            handleScaleChange(null, newScale);
        }
    };

    const handleZoomOut = () => {
        if (selectedObject && fabricCanvas.current) {
            const newScale = Math.max(objectScale - 10, 10);
            handleScaleChange(null, newScale);
        }
    };

    const handleRotate = () => {
        if (selectedObject && fabricCanvas.current) {
            const newRotation = (objectRotation + 45) % 360;
            handleRotationChange(null, newRotation);
        }
    };

    const handleFlip = () => {
        if (selectedObject && fabricCanvas.current) {
            selectedObject.set({ flipX: !selectedObject.flipX });
            fabricCanvas.current.renderAll();
        }
    };

    const handleCenter = () => {
        if (selectedObject && fabricCanvas.current) {
            selectedObject.center();
            fabricCanvas.current.renderAll();
            if (selectedObject.designId) {
                updateDesignElement(selectedObject.designId, {
                    left: selectedObject.left,
                    top: selectedObject.top,
                });
            }
        }
    };

    const handleDelete = () => {
        if (selectedObject && fabricCanvas.current) {
            const designId = selectedObject.designId;
            fabricCanvas.current.remove(selectedObject);
            fabricCanvas.current.renderAll();
            setSelectedObject(null);
            if (designId && removeDesign) {
                removeDesign(designId);
            }
        }
    };

    const scale = { S: 0.85, M: 1, L: 1.1, XL: 1.15 }[designState.size] || 1;

    return (
        <Box
            sx={{
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                p: 2,
                overflow: 'auto',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    mb: 2,
                    width: '100%',
                    maxWidth: 520,
                    backgroundColor: selectedObject ? '#fff' : '#f5f5f5',
                    border: selectedObject ? '2px solid #1976d2' : '1px solid #ddd',
                    transition: 'all 0.3s ease',
                }}
            >
                <Typography variant="subtitle2" fontWeight="bold" color={selectedObject ? 'primary' : 'text.secondary'} gutterBottom>
                    {selectedObject ? 'Редактирование дизайна' : 'Нажмите на дизайн для редактирования'}
                </Typography>

                {selectedObject && (
                    <>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Tooltip title="Уменьшить">
                                <IconButton onClick={handleZoomOut} color="primary" size="small">
                                    <ZoomOutIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Увеличить">
                                <IconButton onClick={handleZoomIn} color="primary" size="small">
                                    <ZoomInIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Повернуть">
                                <IconButton onClick={handleRotate} color="primary" size="small">
                                    <RotateIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Отразить">
                                <IconButton onClick={handleFlip} color="primary" size="small">
                                    <FlipIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Центрировать">
                                <IconButton onClick={handleCenter} color="primary" size="small">
                                    <CenterIcon />
                                </IconButton>
                            </Tooltip>
                            <Divider orientation="vertical" flexItem />
                            <Tooltip title="Удалить">
                                <IconButton onClick={handleDelete} color="error" size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        <Box sx={{ px: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Масштаб: {objectScale}%
                            </Typography>
                            <Slider
                                value={objectScale}
                                onChange={handleScaleChange}
                                min={10}
                                max={200}
                                step={5}
                                size="small"
                                sx={{ mb: 1 }}
                            />

                            <Typography variant="caption" color="text.secondary">
                                Поворот: {objectRotation}
                            </Typography>
                            <Slider
                                value={objectRotation}
                                onChange={handleRotationChange}
                                min={0}
                                max={360}
                                step={5}
                                size="small"
                            />
                        </Box>
                    </>
                )}
            </Paper>

            <Paper
                elevation={4}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    transform: `scale(${scale})`,
                    transition: 'transform 0.3s ease',
                    transformOrigin: 'top center',
                }}
            >
                <canvas ref={canvasRef} />
            </Paper>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Размер: {designState.size} | Цвет: {designState.color}
            </Typography>
        </Box>
    );
};

export default Preview;

