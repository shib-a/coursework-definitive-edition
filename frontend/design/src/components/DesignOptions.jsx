import React, {useState} from 'react';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    TextField,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Grid,
    IconButton,
} from '@mui/material';

const DesignOptions = () => {
    return (
        <Box
            sx={{
                maxWidth: 400,
                margin: 'auto',
                padding: 2,
                overflowY: 'auto',
                maxHeight: '80vh',
                border: '1px solid #ddd',
                borderRadius: 2,
                backgroundColor: '#fff',
            }}
        >
            <Typography variant="h6" gutterBottom>
                Дизайн
            </Typography>
            <TextField fullWidth label="Промпт для футболки" variant="outlined" sx={{ mb: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
                Текст на дизайне
            </Typography>
            <TextField fullWidth label="Слова или фраза (опционально)" variant="outlined" sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Кот" onDelete={() => {}} color="primary" variant="outlined" />
                <Chip label="Праздник" onDelete={() => {}} color="primary" variant="outlined" />
                <Chip label="Хэллоуин" onDelete={() => {}} color="primary" variant="outlined" />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Модель</InputLabel>
                        <Select value="Premium" label="Модель">
                            <MenuItem value="Premium">Premium</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>GPT-40</InputLabel>
                        <Select value="2" label="GPT-40">
                            <MenuItem value="2">2</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Качество</InputLabel>
                        <Select value="AR" label="Качество">
                            <MenuItem value="AR">AR</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Вариации</InputLabel>
                        <Select value="Draft" label="Вариации">
                            <MenuItem value="Draft">Черновик -15с</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Premium</InputLabel>
                        <Select value="Premium" label="Premium">
                            <MenuItem value="Premium">Premium -10с</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Ultra</InputLabel>
                        <Select value="Ultra" label="Ultra">
                            <MenuItem value="Ultra">Ultra -10с</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button variant="contained" color="warning" fullWidth sx={{ mb: 1 }}>
                Отправить (2 кредита)
            </Button>

            <Alert severity="error" sx={{ mb: 2 }}>
                Сервис временно недоступен в вашем регионе.
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
                СТИЛИ
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography>Создать свой стиль</Typography>
                <Button variant="contained" color="primary">
                    ДОБАВИТЬ
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Смешной</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Трендовый</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Инклюзивность</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Минимализм</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Мир</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
                ФОРМЫ
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography>Создать свою форму</Typography>
                <Button variant="contained" color="primary">
                    ДОБАВИТЬ
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Сердце</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Кот</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Нота</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Собака</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Якорь</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
                ПАТТЕРНЫ
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Бесконечный космос</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Туманность</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Астероиды</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Галактика</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Звездное небо</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default DesignOptions;