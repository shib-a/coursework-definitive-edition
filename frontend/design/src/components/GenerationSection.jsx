import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Alert, CircularProgress } from '@mui/material';
import { Collections as MyContentIcon } from '@mui/icons-material';
import { DesignContext } from '../DesignContext';
import { AuthContext } from '../AuthContext';
import { designsAPI, imagesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GenerationSection = () => {
    const { addDesign } = useContext(DesignContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [text, setText] = useState('');
    const [aiAgent, setAiAgent] = useState(1);
    const [variations, setVariations] = useState(2);
    const [theme, setTheme] = useState('CASUAL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async () => {
        if (!user) {
            setError('Войдите для генерации дизайнов');
            return;
        }

        if (!prompt) {
            setError('Введите промпт для дизайна');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await designsAPI.generateDesign(
                prompt,
                text || null,
                aiAgent,
                theme,
                variations
            );

            if (response.status === 'PROCESSING') {
                setSuccess('Генерация дизайна начата! Проверьте "Мой контент" для просмотра.');
            } else if (response.status === 'COMPLETED' && response.imageUrl) {
                setSuccess('Дизайн сгенерирован! Добавлен в превью.');

                addDesign({
                    src: response.imageUrl,
                    designId: response.designId
                });
            } else {
                setSuccess('Запрос на дизайн отправлен! Он появится в "Мой контент" когда будет готов.');
            }

            setPrompt('');
            setText('');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data || err.message || 'Ошибка генерации. Попробуйте снова.';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    const handleRandomDesign = async () => {
        setLoading(true);
        setError('');
        try {
            const [designs, images] = await Promise.all([
                designsAPI.getPublicDesigns(),
                imagesAPI.getPublicImages()
            ]);

            const allContent = [
                ...designs.map(d => ({
                    type: 'design',
                    id: d.designId,
                    url: d.imageUrl,
                    data: d
                })),
                ...images.map(i => ({
                    type: 'image',
                    id: i.imageId,
                    url: i.imageUrl,
                    data: i
                }))
            ];

            if (allContent.length === 0) {
                setError('Публичные дизайны пока недоступны. Загляните позже!');
                return;
            }

            const randomItem = allContent[Math.floor(Math.random() * allContent.length)];

            if (randomItem.type === 'design') {
                addDesign({
                    src: randomItem.url,
                    designId: randomItem.id
                });
                setSuccess(`Добавлен случайный дизайн от ${randomItem.data.ownerUsername || 'Аноним'}!`);
            } else {
                addDesign({
                    src: randomItem.url,
                    imageId: randomItem.id
                });
                setSuccess(`Добавлено случайное изображение от ${randomItem.data.uploaderUsername || 'Аноним'}!`);
            }
        } catch (err) {
            setError('Ошибка загрузки из галереи. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Генерация</Typography>

            <TextField
                fullWidth
                label="Промпт для дизайна"
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                placeholder="Например: Милый кот играет с клубком"
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Текст для изображения (опционально)"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
                placeholder="Например: Мяу"
                sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>AI Модель</InputLabel>
                <Select value={aiAgent} onChange={(e) => setAiAgent(e.target.value)} disabled={loading}>
                    <MenuItem value={1}>OpenAI DALL-E 3</MenuItem>
                    <MenuItem value={2}>OpenAI DALL-E 2</MenuItem>
                    <MenuItem value={3}>Stability AI - SDXL</MenuItem>
                    <MenuItem value={4}>Stability AI - SD v1.6</MenuItem>
                    <MenuItem value={999}>Тестовая модель</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Тема</InputLabel>
                <Select value={theme} onChange={(e) => setTheme(e.target.value)} disabled={loading}>
                    <MenuItem value="CASUAL">Повседневный</MenuItem>
                    <MenuItem value="FORMAL">Формальный</MenuItem>
                    <MenuItem value="SPORT">Спортивный</MenuItem>
                    <MenuItem value="ARTISTIC">Художественный</MenuItem>
                    <MenuItem value="MINIMALIST">Минималистичный</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Количество вариаций</InputLabel>
                <Select value={variations} onChange={(e) => setVariations(e.target.value)} disabled={loading}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                </Select>
            </FormControl>

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={loading || !user}
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Сгенерировать'}
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleRandomDesign}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                Добавить случайный из галереи
            </Button>

            {user && (
                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<MyContentIcon />}
                    onClick={() => navigate('/my-content')}
                    sx={{ mb: 2 }}
                >
                    Мои дизайны и изображения
                </Button>
            )}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            {!user && <Alert severity="warning" sx={{ mt: 2 }}>Войдите для генерации дизайнов</Alert>}
            <Alert severity="info" sx={{ mt: 2 }}>
                Генерация может занять время в зависимости от модели.
            </Alert>
        </Box>
    );
};

export default GenerationSection;