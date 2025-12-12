
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
    CardActions,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assignment as AssignIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import { moderatorAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [newOrderStatus, setNewOrderStatus] = useState('');
    const [orderNote, setOrderNote] = useState('');

    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
    const [newTicketStatus, setNewTicketStatus] = useState('');
    const [ticketResponse, setTicketResponse] = useState('');
    const [ticketMessages, setTicketMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [designs, setDesigns] = useState([]);
    const [designDialogOpen, setDesignDialogOpen] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);

    useEffect(() => {
        if (!user || (user.authority !== 'MODERATOR' && user.authority !== 'ADMIN')) {
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
                case 0: // Orders
                    const ordersData = await moderatorAPI.getAllOrders();
                    setOrders(Array.isArray(ordersData) ? ordersData : []);
                    break;
                case 1: // Tickets
                    const ticketsData = await moderatorAPI.getAllTickets();
                    setTickets(Array.isArray(ticketsData) ? ticketsData : []);
                    break;
                case 2: // Designs
                    const designsData = await moderatorAPI.getAllDesigns();
                    setDesigns(Array.isArray(designsData) ? designsData : []);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Load data error:', err);
            setError('Failed to load data: ' + err.message);

            switch (activeTab) {
                case 0:
                    setOrders([]);
                    break;
                case 1:
                    setTickets([]);
                    break;
                case 2:
                    setDesigns([]);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setNewOrderStatus(order.status);
        setOrderNote('');
        setOrderDialogOpen(true);
    };

    const handleUpdateOrderStatus = async () => {
        try {
            setLoading(true);
            await moderatorAPI.updateOrderStatus(selectedOrder.orderId, newOrderStatus, orderNote);
            setSuccess('Order status updated successfully');
            setOrderDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Failed to update order: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = async (ticket) => {
        setSelectedTicket(ticket);
        setNewTicketStatus(ticket.status);
        setTicketResponse('');
        setTicketDialogOpen(true);

        setLoadingMessages(true);
        try {
            const messages = await moderatorAPI.getTicketMessages(ticket.ticketId);
            setTicketMessages(Array.isArray(messages) ? messages : []);
        } catch (err) {
            console.error('Error loading messages:', err);
            setTicketMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleUpdateTicketStatus = async () => {
        try {
            setLoading(true);

            if (newTicketStatus !== selectedTicket.status) {
                await moderatorAPI.updateTicketStatus(
                    selectedTicket.ticketId,
                    newTicketStatus,
                    user.userId,
                    null
                );
            }

            if (ticketResponse.trim()) {
                await moderatorAPI.addTicketMessage(
                    selectedTicket.ticketId,
                    ticketResponse
                );
            }

            setSuccess('Ticket updated successfully');
            setTicketDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Failed to update ticket: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            setLoading(true);
            await moderatorAPI.assignTicket(ticketId, user.userId);
            setSuccess('Ticket assigned to you');
            loadData();
        } catch (err) {
            setError('Failed to assign ticket: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDesignClick = (design) => {
        setSelectedDesign(design);
        setDesignDialogOpen(true);
    };

    const handleToggleDesignVisibility = async (designId, currentVisibility) => {
        try {
            setLoading(true);
            await moderatorAPI.updateDesignVisibility(designId, !currentVisibility);
            setSuccess('Design visibility updated');
            loadData();
        } catch (err) {
            setError('Failed to update design visibility: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDesign = async (designId) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return;
        try {
            setLoading(true);
            await moderatorAPI.deleteDesign(designId);
            setSuccess('Design deleted successfully');
            setDesignDialogOpen(false);
            loadData();
        } catch (err) {
            setError('Failed to delete design: ' + err.message);
        } finally {
            setLoading(false);
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

    if (!user || (user.authority !== 'MODERATOR' && user.authority !== 'ADMIN')) {
        return null;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Moderator Dashboard
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
                    <Tab label="Orders" />
                    <Tab label="Support Tickets" />
                    <Tab label="Designs" />
                </Tabs>
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {}
            {activeTab === 0 && !loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(orders) && orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell>{order.orderNumber}</TableCell>
                                        <TableCell>{order.user?.username || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                                        </TableCell>
                                        <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOrderClick(order)}
                                            >
                                                Update
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                            No orders found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {}
            {activeTab === 1 && !loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ticket #</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(tickets) && tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.ticketId}>
                                        <TableCell>{ticket.ticketNumber}</TableCell>
                                        <TableCell>{ticket.user?.username || 'N/A'}</TableCell>
                                        <TableCell>{ticket.category}</TableCell>
                                        <TableCell>
                                            <Chip label={ticket.priority} color={getStatusColor(ticket.priority)} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={ticket.status} color={getStatusColor(ticket.status)} size="small" />
                                        </TableCell>
                                        <TableCell>{ticket.assignedModerator?.username || 'Unassigned'}</TableCell>
                                        <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {!ticket.assignedModeratorId && (
                                                <Button
                                                    size="small"
                                                    startIcon={<AssignIcon />}
                                                    onClick={() => handleAssignTicket(ticket.ticketId)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleTicketClick(ticket)}
                                            >
                                                Update
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                            No tickets found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {}
            {activeTab === 2 && !loading && (
                <Grid container spacing={2}>
                    {Array.isArray(designs) && designs.length > 0 ? (
                        designs.map((design) => (
                            <Grid item xs={12} sm={6} md={4} key={design.designId}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Design #{design.designId}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Owner: {design.owner?.username || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Prompt: {design.originalPrompt}
                                        </Typography>
                                        <Chip
                                            label={design.isPublic ? 'Public' : 'Private'}
                                            color={design.isPublic ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => handleToggleDesignVisibility(design.designId, design.isPublic)}
                                        >
                                            {design.isPublic ? 'Make Private' : 'Make Public'}
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteDesign(design.designId)}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    No designs found.
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {}
            <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={newOrderStatus}
                                label="Status"
                                onChange={(e) => setNewOrderStatus(e.target.value)}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="PROCESSING">Processing</MenuItem>
                                <MenuItem value="SHIPPED">Shipped</MenuItem>
                                <MenuItem value="DELIVERED">Delivered</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Note"
                            multiline
                            rows={3}
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateOrderStatus} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedTicket && `Ticket #${selectedTicket.ticketNumber}`}
                </DialogTitle>
                <DialogContent>
                    {selectedTicket && (
                        <Box sx={{ pt: 2 }}>
                            {}
                            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    <strong>User:</strong> {selectedTicket.user?.username || 'N/A'}
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>
                                    <strong>Category:</strong> {selectedTicket.category}
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>
                                    <strong>Priority:</strong> {selectedTicket.priority}
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>
                                    <strong>Description:</strong>
                                </Typography>
                                <Typography variant="body2">
                                    {selectedTicket.description}
                                </Typography>
                            </Paper>

                            {}
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Messages
                            </Typography>
                            <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2, mb: 2 }}>
                                {loadingMessages ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : ticketMessages.length === 0 ? (
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

                            {}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={newTicketStatus}
                                    label="Status"
                                    onChange={(e) => setNewTicketStatus(e.target.value)}
                                >
                                    <MenuItem value="OPEN">Open</MenuItem>
                                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                    <MenuItem value="CLOSED">Closed</MenuItem>
                                </Select>
                            </FormControl>

                            {}
                            <TextField
                                fullWidth
                                label="Add Response"
                                multiline
                                rows={4}
                                value={ticketResponse}
                                onChange={(e) => setTicketResponse(e.target.value)}
                                placeholder="Type your response here..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdateTicketStatus}
                        variant="contained"
                        disabled={loading || (!ticketResponse.trim() && newTicketStatus === selectedTicket?.status)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update & Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ModeratorDashboard;

