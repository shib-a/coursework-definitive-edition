import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
    Alert,
    IconButton,
    Grid,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    Block as BlockIcon,
    CheckCircle as UnblockIcon,
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import { adminAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [statistics, setStatistics] = useState(null);

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [themes, setThemes] = useState([]);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [themeForm, setThemeForm] = useState({ themeName: '', description: '', isActive: true });

    const [models, setModels] = useState([]);
    const [modelDialogOpen, setModelDialogOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelForm, setModelForm] = useState({ modelName: '', apiEndpoint: '', description: '', isActive: true });

    // Products state
    const [products, setProducts] = useState([]);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        productName: '',
        basePrice: '',
        size: '',
        color: '',
        material: ''
    });

    useEffect(() => {
        if (!user || user.authority !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case 0: // Statistics
                    const stats = await adminAPI.getStatistics();
                    setStatistics(stats);
                    break;
                case 1: // Users
                    const usersData = await adminAPI.getAllUsers();
                    setUsers(Array.isArray(usersData) ? usersData : []);
                    break;
                case 2: // Themes
                    const themesData = await adminAPI.getAllThemes();
                    setThemes(Array.isArray(themesData) ? themesData : []);
                    break;
                case 3: // Models
                    const modelsData = await adminAPI.getAllModels();
                    setModels(Array.isArray(modelsData) ? modelsData : []);
                    break;
                case 4: // Products
                    const productsData = await adminAPI.getAllProducts();
                    setProducts(Array.isArray(productsData) ? productsData : []);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Load data error:', err);
            setError('Ошибка загрузки данных: ' + err.message);

            switch (activeTab) {
                case 1:
                    setUsers([]);
                    break;
                case 2:
                    setThemes([]);
                    break;
                case 3:
                    setModels([]);
                    break;
                case 4:
                    setProducts([]);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleBlockUser = async (userId, blocked) => {
        try {
            setLoading(true);
            await adminAPI.blockUser(userId, blocked, blocked ? 'Заблокирован администратором' : '');
            setSuccess(`Пользователь ${blocked ? 'заблокирован' : 'разблокирован'}`);
            loadData();
        } catch (err) {
            setError('Ошибка обновления пользователя: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeUserRole = async (userId, role) => {
        try {
            setLoading(true);
            await adminAPI.changeUserRole(userId, role);
            setSuccess('Роль пользователя обновлена');
            loadData();
        } catch (err) {
            setError('Ошибка изменения роли: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchUsers = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }
        try {
            setLoading(true);
            const results = await adminAPI.searchUsers(searchQuery);
            setUsers(results);
        } catch (err) {
            setError('Ошибка поиска: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenThemeDialog = (theme = null) => {
        if (theme) {
            setSelectedTheme(theme);
            setThemeForm({
                themeName: theme.themeName,
                description: theme.themePromptTemplate || '',
                isActive: theme.isActive,
            });
        } else {
            setSelectedTheme(null);
            setThemeForm({ themeName: '', description: '', isActive: true });
        }
        setThemeDialogOpen(true);
    };

    const handleSaveTheme = async () => {
        try {
            setLoading(true);
            if (selectedTheme) {
                await adminAPI.updateTheme(
                    selectedTheme.themeId,
                    themeForm.themeName,
                    themeForm.description,
                    themeForm.isActive
                );
                setSuccess('Тема обновлена');
            } else {
                await adminAPI.createTheme(themeForm.themeName, themeForm.description, themeForm.isActive);
                setSuccess('Тема создана');
            }
            setThemeDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Ошибка сохранения темы: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTheme = async (themeId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту тему?')) return;
        try {
            setLoading(true);
            await adminAPI.deleteTheme(themeId);
            setSuccess('Тема удалена');
            loadData();
        } catch (err) {
            setError('Ошибка удаления темы: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTheme = async (themeId) => {
        try {
            setLoading(true);
            await adminAPI.toggleThemeStatus(themeId);
            setSuccess('Статус темы изменён');
            loadData();
        } catch (err) {
            setError('Ошибка изменения статуса темы: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModelDialog = (model = null) => {
        if (model) {
            setSelectedModel(model);
            setModelForm({
                modelName: model.modelName,
                apiEndpoint: model.apiEndpoint,
                description: '',
                isActive: model.isActive,
            });
        } else {
            setSelectedModel(null);
            setModelForm({ modelName: '', apiEndpoint: '', description: '', isActive: true });
        }
        setModelDialogOpen(true);
    };

    const handleSaveModel = async () => {
        try {
            setLoading(true);
            if (selectedModel) {
                await adminAPI.updateModel(
                    selectedModel.modelId,
                    modelForm.modelName,
                    modelForm.apiEndpoint,
                    modelForm.description,
                    modelForm.isActive
                );
                setSuccess('Модель обновлена');
            } else {
                await adminAPI.createModel(
                    modelForm.modelName,
                    modelForm.apiEndpoint,
                    modelForm.description,
                    modelForm.isActive
                );
                setSuccess('Модель создана');
            }
            setModelDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Ошибка сохранения модели: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModel = async (modelId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту модель?')) return;
        try {
            setLoading(true);
            await adminAPI.deleteModel(modelId);
            setSuccess('Модель удалена');
            loadData();
        } catch (err) {
            setError('Ошибка удаления модели: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleModel = async (modelId) => {
        try {
            setLoading(true);
            await adminAPI.toggleModelStatus(modelId);
            setSuccess('Статус модели изменён');
            loadData();
        } catch (err) {
            setError('Ошибка изменения статуса модели: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Product handlers
    const handleOpenProductDialog = (product = null) => {
        if (product) {
            setSelectedProduct(product);
            setProductForm({
                productName: product.productName,
                basePrice: product.basePrice,
                size: product.size,
                color: product.color,
                material: product.material,
            });
        } else {
            setSelectedProduct(null);
            setProductForm({ productName: '', basePrice: '', size: '', color: '', material: '' });
        }
        setProductDialogOpen(true);
    };

    const handleSaveProduct = async () => {
        try {
            setLoading(true);
            if (selectedProduct) {
                await adminAPI.updateProduct(
                    selectedProduct.productId,
                    productForm.productName,
                    parseFloat(productForm.basePrice),
                    productForm.size,
                    productForm.color,
                    productForm.material
                );
                setSuccess('Продукт обновлён');
            } else {
                await adminAPI.createProduct(
                    productForm.productName,
                    parseFloat(productForm.basePrice),
                    productForm.size,
                    productForm.color,
                    productForm.material
                );
                setSuccess('Продукт создан');
            }
            setProductDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Ошибка сохранения продукта: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) return;
        try {
            setLoading(true);
            await adminAPI.deleteProduct(productId);
            setSuccess('Продукт удалён');
            loadData();
        } catch (err) {
            setError('Ошибка удаления продукта: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.authority !== 'ADMIN') {
        return null;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Панель администратора
                </Typography>
                <IconButton onClick={loadData} color="primary">
                    <RefreshIcon />
                </IconButton>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Статистика" />
                    <Tab label="Пользователи" />
                    <Tab label="Темы" />
                    <Tab label="AI Модели" />
                    <Tab label="Продукты" />
                </Tabs>
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Statistics Tab */}
            {activeTab === 0 && !loading && statistics && (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Всего пользователей
                                </Typography>
                                <Typography variant="h4">{statistics.totalUsers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Всего заказов
                                </Typography>
                                <Typography variant="h4">{statistics.totalOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Всего дизайнов
                                </Typography>
                                <Typography variant="h4">{statistics.totalDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Общая выручка
                                </Typography>
                                <Typography variant="h4">{statistics.totalRevenue?.toLocaleString('ru-RU')} ₽</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Ожидающие заказы
                                </Typography>
                                <Typography variant="h5">{statistics.pendingOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    В обработке
                                </Typography>
                                <Typography variant="h5">{statistics.processingOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Выполненные заказы
                                </Typography>
                                <Typography variant="h5">{statistics.completedOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Открытые тикеты
                                </Typography>
                                <Typography variant="h5">{statistics.openTickets}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Публичные дизайны
                                </Typography>
                                <Typography variant="h5">{statistics.publicDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Приватные дизайны
                                </Typography>
                                <Typography variant="h5">{statistics.privateDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Users Tab */}
            {activeTab === 1 && !loading && (
                <>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Поиск пользователей"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                        />
                        <Button variant="contained" onClick={handleSearchUsers}>
                            Найти
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Имя пользователя</TableCell>
                                    <TableCell>Роль</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Дата регистрации</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(users) && users.length > 0 ? (
                                    users.map((u) => (
                                        <TableRow key={u.userId}>
                                            <TableCell>{u.userId}</TableCell>
                                            <TableCell>{u.username}</TableCell>
                                            <TableCell>
                                                <FormControl size="small">
                                                    <Select
                                                        value={u.authority}
                                                        onChange={(e) => handleChangeUserRole(u.userId, e.target.value)}
                                                    >
                                                        <MenuItem value="USER">Пользователь</MenuItem>
                                                        <MenuItem value="MODERATOR">Модератор</MenuItem>
                                                        <MenuItem value="ADMIN">Администратор</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={u.blocked ? 'Заблокирован' : 'Активен'}
                                                    color={u.blocked ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(u.registeredDate).toLocaleDateString('ru-RU')}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color={u.blocked ? 'success' : 'error'}
                                                    onClick={() => handleBlockUser(u.userId, !u.blocked)}
                                                >
                                                    {u.blocked ? <UnblockIcon /> : <BlockIcon />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="textSecondary">
                                                Пользователи не найдены.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Themes Tab */}
            {activeTab === 2 && !loading && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenThemeDialog()}>
                            Добавить тему
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(themes) && themes.length > 0 ? (
                                    themes.map((theme) => (
                                        <TableRow key={theme.themeId}>
                                            <TableCell>{theme.themeId}</TableCell>
                                            <TableCell>{theme.themeName}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={theme.isActive ? 'Активна' : 'Неактивна'}
                                                    color={theme.isActive ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenThemeDialog(theme)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleTheme(theme.themeId)}
                                                >
                                                    <Switch checked={theme.isActive} size="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteTheme(theme.themeId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body2" color="textSecondary">
                                                Темы не найдены. Нажмите "Добавить тему" для создания.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* AI Models Tab */}
            {activeTab === 3 && !loading && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModelDialog()}>
                            Добавить модель
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>API Endpoint</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(models) && models.length > 0 ? (
                                    models.map((model) => (
                                        <TableRow key={model.modelId}>
                                            <TableCell>{model.modelId}</TableCell>
                                            <TableCell>{model.modelName}</TableCell>
                                            <TableCell>{model.apiEndpoint}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={model.isActive ? 'Активна' : 'Неактивна'}
                                                    color={model.isActive ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenModelDialog(model)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleModel(model.modelId)}
                                                >
                                                    <Switch checked={model.isActive} size="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteModel(model.modelId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="textSecondary">
                                                AI модели не найдены. Нажмите "Добавить модель" для создания.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Products Tab */}
            {activeTab === 4 && !loading && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenProductDialog()}>
                            Добавить продукт
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Цена</TableCell>
                                    <TableCell>Размер</TableCell>
                                    <TableCell>Цвет</TableCell>
                                    <TableCell>Материал</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(products) && products.length > 0 ? (
                                    products.map((product) => (
                                        <TableRow key={product.productId}>
                                            <TableCell>{product.productId}</TableCell>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.basePrice?.toLocaleString('ru-RU')} ₽</TableCell>
                                            <TableCell>{product.size}</TableCell>
                                            <TableCell>{product.color}</TableCell>
                                            <TableCell>{product.material}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenProductDialog(product)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteProduct(product.productId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="textSecondary">
                                                Продукты не найдены. Нажмите "Добавить продукт" для создания.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Theme Dialog */}
            <Dialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedTheme ? 'Редактировать тему' : 'Добавить тему'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Название темы"
                            value={themeForm.themeName}
                            onChange={(e) => setThemeForm({ ...themeForm, themeName: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Описание"
                            multiline
                            rows={3}
                            value={themeForm.description}
                            onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={themeForm.isActive}
                                    onChange={(e) => setThemeForm({ ...themeForm, isActive: e.target.checked })}
                                />
                            }
                            label="Активна"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setThemeDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleSaveTheme} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Model Dialog */}
            <Dialog open={modelDialogOpen} onClose={() => setModelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedModel ? 'Редактировать модель' : 'Добавить модель'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Название модели"
                            value={modelForm.modelName}
                            onChange={(e) => setModelForm({ ...modelForm, modelName: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="API Endpoint"
                            value={modelForm.apiEndpoint}
                            onChange={(e) => setModelForm({ ...modelForm, apiEndpoint: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={modelForm.isActive}
                                    onChange={(e) => setModelForm({ ...modelForm, isActive: e.target.checked })}
                                />
                            }
                            label="Активна"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModelDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleSaveModel} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Product Dialog */}
            <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedProduct ? 'Редактировать продукт' : 'Добавить продукт'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Название продукта"
                            value={productForm.productName}
                            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Цена (₽)"
                            type="number"
                            value={productForm.basePrice}
                            onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Размер"
                            value={productForm.size}
                            onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Цвет"
                            value={productForm.color}
                            onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Материал"
                            value={productForm.material}
                            onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProductDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleSaveProduct} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;

