
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
    InputLabel,
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [themes, setThemes] = useState([]);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [themeForm, setThemeForm] = useState({ themeName: '', description: '', isActive: true });

    const [models, setModels] = useState([]);
    const [modelDialogOpen, setModelDialogOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelForm, setModelForm] = useState({ modelName: '', apiEndpoint: '', description: '', isActive: true });

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
                default:
                    break;
            }
        } catch (err) {
            console.error('Load data error:', err);
            setError('Failed to load data: ' + err.message);

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
            await adminAPI.blockUser(userId, blocked, blocked ? 'Blocked by admin' : '');
            setSuccess(`User ${blocked ? 'blocked' : 'unblocked'} successfully`);
            loadData();
        } catch (err) {
            setError('Failed to update user: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeUserRole = async (userId, role) => {
        try {
            setLoading(true);
            await adminAPI.changeUserRole(userId, role);
            setSuccess('User role updated successfully');
            loadData();
        } catch (err) {
            setError('Failed to update user role: ' + err.message);
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
            setError('Search failed: ' + err.message);
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
                setSuccess('Theme updated successfully');
            } else {
                await adminAPI.createTheme(themeForm.themeName, themeForm.description, themeForm.isActive);
                setSuccess('Theme created successfully');
            }
            setThemeDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Failed to save theme: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTheme = async (themeId) => {
        if (!window.confirm('Are you sure you want to delete this theme?')) return;
        try {
            setLoading(true);
            await adminAPI.deleteTheme(themeId);
            setSuccess('Theme deleted successfully');
            loadData();
        } catch (err) {
            setError('Failed to delete theme: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTheme = async (themeId) => {
        try {
            setLoading(true);
            await adminAPI.toggleThemeStatus(themeId);
            setSuccess('Theme status toggled');
            loadData();
        } catch (err) {
            setError('Failed to toggle theme: ' + err.message);
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
                setSuccess('Model updated successfully');
            } else {
                await adminAPI.createModel(
                    modelForm.modelName,
                    modelForm.apiEndpoint,
                    modelForm.description,
                    modelForm.isActive
                );
                setSuccess('Model created successfully');
            }
            setModelDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Failed to save model: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModel = async (modelId) => {
        if (!window.confirm('Are you sure you want to delete this model?')) return;
        try {
            setLoading(true);
            await adminAPI.deleteModel(modelId);
            setSuccess('Model deleted successfully');
            loadData();
        } catch (err) {
            setError('Failed to delete model: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleModel = async (modelId) => {
        try {
            setLoading(true);
            await adminAPI.toggleModelStatus(modelId);
            setSuccess('Model status toggled');
            loadData();
        } catch (err) {
            setError('Failed to toggle model: ' + err.message);
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
                    Administrator Dashboard
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
                    <Tab label="Statistics" />
                    <Tab label="Users" />
                    <Tab label="Themes" />
                    <Tab label="AI Models" />
                </Tabs>
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {}
            {activeTab === 0 && !loading && statistics && (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Users
                                </Typography>
                                <Typography variant="h4">{statistics.totalUsers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Orders
                                </Typography>
                                <Typography variant="h4">{statistics.totalOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Designs
                                </Typography>
                                <Typography variant="h4">{statistics.totalDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Revenue
                                </Typography>
                                <Typography variant="h4">${statistics.totalRevenue?.toFixed(2)}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Pending Orders
                                </Typography>
                                <Typography variant="h5">{statistics.pendingOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Processing Orders
                                </Typography>
                                <Typography variant="h5">{statistics.processingOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Completed Orders
                                </Typography>
                                <Typography variant="h5">{statistics.completedOrders}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Open Tickets
                                </Typography>
                                <Typography variant="h5">{statistics.openTickets}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Public Designs
                                </Typography>
                                <Typography variant="h5">{statistics.publicDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Private Designs
                                </Typography>
                                <Typography variant="h5">{statistics.privateDesigns}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {}
            {activeTab === 1 && !loading && (
                <>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Search Users"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                        />
                        <Button variant="contained" onClick={handleSearchUsers}>
                            Search
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Authority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Registered</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(users) && users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell>{user.userId}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>
                                                <FormControl size="small">
                                                    <Select
                                                        value={user.authority}
                                                        onChange={(e) => handleChangeUserRole(user.userId, e.target.value)}
                                                    >
                                                        <MenuItem value="USER">User</MenuItem>
                                                        <MenuItem value="MODERATOR">Moderator</MenuItem>
                                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.blocked ? 'Blocked' : 'Active'}
                                                    color={user.blocked ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(user.registeredDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color={user.blocked ? 'success' : 'error'}
                                                    onClick={() => handleBlockUser(user.userId, !user.blocked)}
                                                >
                                                    {user.blocked ? <UnblockIcon /> : <BlockIcon />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="textSecondary">
                                                No users found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {}
            {activeTab === 2 && !loading && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenThemeDialog()}>
                            Add Theme
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
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
                                                    label={theme.isActive ? 'Active' : 'Inactive'}
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
                                                No themes found. Click "Add Theme" to create one.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {}
            {activeTab === 3 && !loading && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModelDialog()}>
                            Add AI Model
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>API Endpoint</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
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
                                                    label={model.isActive ? 'Active' : 'Inactive'}
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
                                                No AI models found. Click "Add AI Model" to create one.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {}
            <Dialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedTheme ? 'Edit Theme' : 'Add Theme'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Theme Name"
                            value={themeForm.themeName}
                            onChange={(e) => setThemeForm({ ...themeForm, themeName: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
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
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setThemeDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTheme} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={modelDialogOpen} onClose={() => setModelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Model Name"
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
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModelDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveModel} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;

