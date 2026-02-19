import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Alert, CircularProgress, Stack,
    Card, CardMedia, CardActions, Grid, Tabs, Tab, IconButton,
    Tooltip
} from '@mui/material';
import {
    Upload as UploadIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { DesignContext } from '../DesignContext';
import { AuthContext } from '../AuthContext';
import { imagesAPI, designsAPI } from '../services/api';
import getApiImageUrl from '../utils/apiImageUrl';

const ImagesSection = () => {
    const { addDesign } = useContext(DesignContext);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [myContent, setMyContent] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    const loadMyContent = useCallback(async () => {
        if (!user) return;

        setContentLoading(true);
        try {
            const [designsData, imagesData] = await Promise.all([
                designsAPI.getMyDesigns().catch(() => []),
                imagesAPI.getMyImages().catch(() => [])
            ]);

            const combined = [
                ...designsData.map(d => ({
                    ...d,
                    type: 'design',
                    id: d.designId,
                    imageUrl: d.imageUrl || `/api/designs/${d.designId}/image`,
                    title: d.prompt?.substring(0, 30) || 'Design',
                    date: d.createdAt
                })),
                ...imagesData.map(i => ({
                    ...i,
                    type: 'image',
                    id: i.imageId,
                    imageUrl: i.imageUrl || `/api/images/${i.imageId}/file`,
                    title: i.title || 'Image',
                    date: i.uploadedDate
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setMyContent(combined);
        } catch (err) {
            console.error('Error loading content:', err);
        } finally {
            setContentLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && currentTab === 1) {
            loadMyContent();
        }
    }, [user, currentTab, loadMyContent]);

    const handleQuickUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            addDesign({ src: e.target.result });
            setSuccess('Изображение добавлено!');
            setLoading(false);
            setTimeout(() => setSuccess(''), 2000);
        };
        reader.onerror = () => {
            setError('Ошибка чтения файла');
            setLoading(false);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleUploadToAccount = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!user) {
            setError('Войдите для сохранения изображений');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await imagesAPI.uploadImage(file, file.name, '');
            setSuccess('Изображение сохранено в библиотеку!');

            if (response.imageUrl) {
                addDesign({
                    src: response.imageUrl,
                    imageId: response.imageId
                });
            }

            if (currentTab === 1) {
                loadMyContent();
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(err.response?.data?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    const handleUseItem = (item) => {
        addDesign({
            src: item.imageUrl,
            ...(item.type === 'design' ? { designId: item.id } : { imageId: item.id })
        });
        setSuccess('Добавлено в дизайн!');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleDeleteItem = async (item) => {
        if (!window.confirm('Удалить этот элемент?')) return;

        try {
            if (item.type === 'design') {
                await designsAPI.deleteDesign(item.id);
            } else {
                await imagesAPI.deleteImage(item.id);
            }
            setMyContent(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
            setSuccess('Удалено');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Ошибка удаления');
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Tabs
                value={currentTab}
                onChange={(e, v) => setCurrentTab(v)}
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Загрузка" />
                {user && <Tab label="Моя библиотека" />}
            </Tabs>

            {currentTab === 0 && (
                <Stack spacing={2}>
                    <Box sx={{ p: 2, border: '2px dashed #1976d2', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Быстрая загрузка
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Добавить изображение в дизайн
                        </Typography>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            Выбрать и добавить
                            <input type="file" hidden accept="image/*" onChange={handleQuickUpload} />
                        </Button>
                    </Box>

                    {user ? (
                        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Загрузить и сохранить
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Сохранить в библиотеку
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                                disabled={loading}
                                sx={{ mt: 1 }}
                            >
                                Загрузить в библиотеку
                                <input type="file" hidden accept="image/*" onChange={handleUploadToAccount} />
                            </Button>
                        </Box>
                    ) : (
                        <Alert severity="info">
                            Войдите для сохранения изображений в библиотеку!
                        </Alert>
                    )}
                </Stack>
            )}

            {currentTab === 1 && user && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {myContent.length} элементов
                        </Typography>
                        <Tooltip title="Обновить">
                            <IconButton size="small" onClick={loadMyContent} disabled={contentLoading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {contentLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : myContent.length === 0 ? (
                        <Alert severity="info">
                            Пока пусто. Загрузите изображения или создайте дизайны!
                        </Alert>
                    ) : (
                        <Grid container spacing={1}>
                            {myContent.map((item) => (
                                <Grid item xs={6} key={`${item.type}-${item.id}`}>
                                    <Card sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="80"
                                            image={getApiImageUrl(item.imageUrl)}
                                            alt={item.title}
                                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => handleUseItem(item)}
                                        />
                                        <CardActions sx={{ p: 0.5, justifyContent: 'space-between' }}>
                                            <Button
                                                size="small"
                                                onClick={() => handleUseItem(item)}
                                                sx={{ fontSize: '0.7rem', minWidth: 'auto' }}
                                            >
                                                Использовать
                                            </Button>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteItem(item)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ImagesSection;