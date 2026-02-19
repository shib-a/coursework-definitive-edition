import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert,
    Divider,
    Chip,
    Tabs,
    Tab,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Paper,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { AuthContext } from '../AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Person as PersonIcon,
    Shield as ShieldIcon,
    ExitToApp as LogoutIcon,
    LocationOn as AddressIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ShoppingBag as OrderIcon,
    Support as TicketIcon,
    Visibility as ViewIcon,
    Message as MessageIcon,
} from '@mui/icons-material';
import { addressesAPI, ordersAPI, ticketsAPI } from '../services/api';

const ProfilePage = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(0);

    const [addresses, setAddresses] = useState([]);
    const [countries, setCountries] = useState([]);

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);

    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
    const [ticketMessages, setTicketMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [countryId, setCountryId] = useState('');
    const [city, setCity] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {

        const tab = searchParams.get('tab');
        if (tab === 'addresses') {
            setActiveTab(1);
        } else if (tab === 'orders') {
            setActiveTab(2);
        } else if (tab === 'tickets') {
            setActiveTab(3);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            loadCountries();
            if (activeTab === 1) {
                loadAddresses();
            } else if (activeTab === 2) {
                loadOrders();
            } else if (activeTab === 3) {
                loadTickets();
            }
        }
    }, [user, activeTab]);

    const loadCountries = async () => {
        try {
            const data = await addressesAPI.getAllCountries();
            setCountries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading countries:', err);
        }
    };

    const loadAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const data = await addressesAPI.getUserAddresses();
            setAddresses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading addresses:', err);
            setError('Failed to load addresses');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await ordersAPI.getMyOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadTickets = async () => {
        setLoadingTickets(true);
        try {
            const data = await ticketsAPI.getMyTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading tickets:', err);
            setError('Failed to load tickets');
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenAddressDialog = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setCountryId(address.countryId || '');
            setCity(address.city || '');
            setStreetAddress(address.streetAddress || '');
            setPostalCode(address.postalCode || '');
            setIsDefault(false); // Cannot set default while editing
        } else {
            setEditingAddress(null);
            setCountryId('');
            setCity('');
            setStreetAddress('');
            setPostalCode('');
            setIsDefault(false);
        }
        setAddressDialogOpen(true);
    };

    const handleCloseAddressDialog = () => {
        setAddressDialogOpen(false);
        setEditingAddress(null);
        setError('');
    };

    const handleSaveAddress = async () => {
        if (!countryId || !city || !streetAddress || !postalCode) {
            setError('Please fill in all required fields');
            return;
        }

        setLoadingAddresses(true);
        setError('');
        try {
            if (editingAddress) {
                await addressesAPI.updateAddress(
                    editingAddress.addressId,
                    countryId,
                    city,
                    streetAddress,
                    postalCode
                );
                setSuccessMessage('Address updated successfully');
            } else {
                await addressesAPI.createAddress(
                    countryId,
                    city,
                    streetAddress,
                    postalCode,
                    isDefault
                );
                setSuccessMessage('Address created successfully');
            }
            handleCloseAddressDialog();
            loadAddresses();
        } catch (err) {
            console.error('Error saving address:', err);
            setError(err.response?.data?.error || 'Failed to save address');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await addressesAPI.setAsDefault(addressId);
            setSuccessMessage('Default address updated');
            loadAddresses();
        } catch (err) {
            console.error('Error setting default:', err);
            setError('Failed to set default address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await addressesAPI.deleteAddress(addressId);
            setSuccessMessage('Address deleted successfully');
            loadAddresses();
        } catch (err) {
            console.error('Error deleting address:', err);
            setError('Failed to delete address');
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOrderDialogOpen(true);
    };

    const handleCloseOrderDialog = () => {
        setOrderDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleViewTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setTicketDialogOpen(true);
        setNewMessage('');

        try {
            const messages = await ticketsAPI.getTicketMessages(ticket.ticketId);
            setTicketMessages(Array.isArray(messages) ? messages : []);
        } catch (err) {
            console.error('Error loading ticket messages:', err);
            setError('Failed to load ticket messages');
        }
    };

    const handleCloseTicketDialog = () => {
        setTicketDialogOpen(false);
        setSelectedTicket(null);
        setTicketMessages([]);
        setNewMessage('');
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            setError('Please enter a message');
            return;
        }

        try {
            await ticketsAPI.addTicketMessage(selectedTicket.ticketId, newMessage);
            setSuccessMessage('Message sent successfully');
            setNewMessage('');

            const messages = await ticketsAPI.getTicketMessages(selectedTicket.ticketId);
            setTicketMessages(Array.isArray(messages) ? messages : []);
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'warning',
            PROCESSING: 'info',
            SHIPPED: 'primary',
            DELIVERED: 'success',
            CANCELLED: 'error',
            OPEN: 'warning',
            IN_PROGRESS: 'info',
            CLOSED: 'success',
        };
        return statusColors[status] || 'default';
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1000, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> My Profile
            </Typography>

            {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            {error && activeTab === 1 && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mt: 3, mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab icon={<PersonIcon />} label="Account Info" />
                    <Tab icon={<AddressIcon />} label="Addresses" />
                    <Tab icon={<OrderIcon />} label="My Orders" />
                    <Tab icon={<TicketIcon />} label="Support Tickets" />
                </Tabs>
            </Paper>

            {}
            {activeTab === 0 && (
                <>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Account Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Username
                                </Typography>
                                <Typography variant="h6">
                                    {user.username}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    User ID
                                </Typography>
                                <Typography variant="body1">
                                    {user.userId}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ShieldIcon fontSize="small" /> Authority Level
                                </Typography>
                                <Chip
                                    label={user.authority || 'USER'}
                                    color={user.authority === 'ADMIN' ? 'error' : 'primary'}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Box>
                </>
            )}

            {}
            {activeTab === 1 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">My Addresses</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenAddressDialog()}
                        >
                            Add Address
                        </Button>
                    </Box>

                    {loadingAddresses ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : addresses.length === 0 ? (
                        <Alert severity="info">
                            No addresses found. Add your first address to make checkout easier!
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {addresses.map((address) => (
                                <Card key={address.addressId} sx={{ position: 'relative' }}>
                                    <CardContent>
                                        {address.isDefault && (
                                            <Chip
                                                icon={<StarIcon />}
                                                label="Default"
                                                color="primary"
                                                size="small"
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            />
                                        )}
                                        <Typography variant="h6" gutterBottom>
                                            {address.city}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {address.streetAddress}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {address.city}, {address.postalCode}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {address.country?.countryName || 'Country'}
                                        </Typography>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            {!address.isDefault && (
                                                <Button
                                                    size="small"
                                                    startIcon={<StarBorderIcon />}
                                                    onClick={() => handleSetDefault(address.addressId)}
                                                >
                                                    Set as Default
                                                </Button>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenAddressDialog(address)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteAddress(address.addressId)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </>
            )}

            {}
            {activeTab === 2 && (
                <>
                    <Typography variant="h6" gutterBottom>My Orders</Typography>

                    {loadingOrders ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : orders.length === 0 ? (
                        <Alert severity="info">
                            No orders found. Start shopping to place your first order!
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {orders.map((order) => (
                                <Card key={order.orderId}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6">
                                                    Order #{order.orderNumber}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                            />
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body1">
                                                    Итого: <strong>{order.totalAmount?.toLocaleString('ru-RU')} ₽</strong>
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {order.orderItems?.length || 0} товар(ов)
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                startIcon={<ViewIcon />}
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                View Details
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </>
            )}

            {}
            {activeTab === 3 && (
                <>
                    <Typography variant="h6" gutterBottom>My Support Tickets</Typography>

                    {loadingTickets ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : tickets.length === 0 ? (
                        <Alert severity="info">
                            No support tickets found. Visit the Support page to create one.
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {tickets.map((ticket) => (
                                <Card key={ticket.ticketId}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6">
                                                    Ticket #{ticket.ticketNumber}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Created on {new Date(ticket.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label={ticket.priority}
                                                    size="small"
                                                    color={ticket.priority === 'URGENT' ? 'error' : ticket.priority === 'HIGH' ? 'warning' : 'default'}
                                                />
                                                <Chip
                                                    label={ticket.status}
                                                    color={getStatusColor(ticket.status)}
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Category: {ticket.category}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {ticket.description.length > 100
                                                ? ticket.description.substring(0, 100) + '...'
                                                : ticket.description}
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {ticket.messages?.length || 0} message(s)
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                startIcon={<MessageIcon />}
                                                onClick={() => handleViewTicket(ticket)}
                                            >
                                                View & Reply
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </>
            )}

            {}
            <Dialog open={addressDialogOpen} onClose={handleCloseAddressDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Country</InputLabel>
                            <Select
                                value={countryId}
                                label="Country"
                                onChange={(e) => setCountryId(e.target.value)}
                            >
                                {countries.map((country) => (
                                    <MenuItem key={country.countryId} value={country.countryId}>
                                        {country.countryName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            required
                            label="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            required
                            label="Street Address"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="123 Main Street"
                        />

                        <TextField
                            fullWidth
                            required
                            label="Postal Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="12345"
                        />

                        {!editingAddress && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isDefault}
                                        onChange={(e) => setIsDefault(e.target.checked)}
                                    />
                                }
                                label="Set as default address"
                            />
                        )}

                        {error && (
                            <Alert severity="error">{error}</Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddressDialog}>Cancel</Button>
                    <Button
                        onClick={handleSaveAddress}
                        variant="contained"
                        disabled={loadingAddresses}
                    >
                        {loadingAddresses ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={orderDialogOpen} onClose={handleCloseOrderDialog} maxWidth="md" fullWidth>
                <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <Box sx={{ pt: 2 }}>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Status:</Typography>
                                    <Chip
                                        label={selectedOrder.status}
                                        color={getStatusColor(selectedOrder.status)}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Order Date:</Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Сумма заказа:</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {selectedOrder.totalAmount?.toLocaleString('ru-RU')} ₽
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2">Доставка:</Typography>
                                    <Typography variant="body2">
                                        {selectedOrder.shippingCost?.toLocaleString('ru-RU')} ₽
                                    </Typography>
                                </Box>
                            </Paper>

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Order Items
                            </Typography>
                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                <Box>
                                    {selectedOrder.orderItems.map((item, index) => (
                                        <Paper key={index} sx={{ p: 2, mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        {item.product?.productName || 'Product'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Size: {item.size} | Color: {item.color}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Quantity: {item.quantity}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="subtitle1">
                                                        {item.subtotal?.toLocaleString('ru-RU')} ₽
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.unitPrice?.toLocaleString('ru-RU')} ₽ за шт.
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            ) : (
                                <Alert severity="info">No items in this order</Alert>
                            )}

                            {selectedOrder.shippingAddress && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Shipping Address
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body2">
                                            {selectedOrder.shippingAddress.streetAddress}
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedOrder.shippingAddress.country?.countryName}
                                        </Typography>
                                    </Paper>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseOrderDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={ticketDialogOpen} onClose={handleCloseTicketDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Ticket #{selectedTicket?.ticketNumber}
                </DialogTitle>
                <DialogContent>
                    {selectedTicket && (
                        <Box sx={{ pt: 2 }}>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Status:</Typography>
                                    <Chip
                                        label={selectedTicket.status}
                                        color={getStatusColor(selectedTicket.status)}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Priority:</Typography>
                                    <Chip
                                        label={selectedTicket.priority}
                                        size="small"
                                        color={selectedTicket.priority === 'URGENT' ? 'error' : selectedTicket.priority === 'HIGH' ? 'warning' : 'default'}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Category:</Typography>
                                    <Typography variant="body2">{selectedTicket.category}</Typography>
                                </Box>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Description:</Typography>
                                <Typography variant="body2">{selectedTicket.description}</Typography>
                            </Paper>

                            <Typography variant="h6" gutterBottom>
                                Messages
                            </Typography>
                            <Paper sx={{ maxHeight: 400, overflow: 'auto', p: 2, mb: 2 }}>
                                {ticketMessages.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        No messages yet
                                    </Typography>
                                ) : (
                                    ticketMessages.map((message) => (
                                        <Box
                                            key={message.messageId}
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                bgcolor: message.isStaffResponse ? 'primary.light' : 'grey.200',
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>{message.senderUsername || 'Unknown'}</strong>
                                                {message.isStaffResponse && ' (Staff)'}
                                                {' • '}
                                                {new Date(message.createdAt).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {message.messageText}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Paper>

                            {selectedTicket.status !== 'CLOSED' && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Add Reply
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        variant="outlined"
                                    />
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTicketDialog}>Close</Button>
                    {selectedTicket?.status !== 'CLOSED' && (
                        <Button
                            onClick={handleSendMessage}
                            variant="contained"
                            disabled={!newMessage.trim()}
                        >
                            Send Message
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;