import React, { useState, useContext } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Button,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Paper,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { ticketsAPI } from '../services/api';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please login to submit a support ticket');
            return;
        }

        if (!category || !description) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const ticket = await ticketsAPI.createTicket(category, description, priority);
            setSuccess(`Ticket created successfully! Ticket number: ${ticket.ticketNumber}`);

            setCategory('');
            setDescription('');
            setPriority('MEDIUM');
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>Support Center</Typography>

            {}
            <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Frequently Asked Questions</Typography>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>How do I design a T-shirt?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Use the designer tool on the main page to add AI-generated designs, upload images,
                        add text, and customize your T-shirt. You can preview your design before adding it to cart.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>What payment methods are accepted?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>We accept credit cards, debit cards, PayPal, and other major payment methods.</Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>How long does shipping take?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Standard shipping typically takes 5-7 business days. Express shipping options are also available.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Can I cancel or modify my order?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Orders can be modified or cancelled within 24 hours of placement.
                        Contact support immediately if you need to make changes.
                    </Typography>
                </AccordionDetails>
            </Accordion>

            {}
            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom>Create Support Ticket</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Can't find the answer you're looking for? Submit a support ticket and our team will get back to you.
                </Typography>

                {!user ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please <Button onClick={() => navigate('/login')}>login</Button> to create a support ticket
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 2 }} required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                label="Category"
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value="TECHNICAL">Technical Issue</MenuItem>
                                <MenuItem value="BILLING">Billing Question</MenuItem>
                                <MenuItem value="ACCOUNT">Account Issue</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={priority}
                                label="Priority"
                                onChange={(e) => setPriority(e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value="LOW">Low</MenuItem>
                                <MenuItem value="MEDIUM">Medium</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Description *"
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            placeholder="Please describe your issue in detail..."
                            sx={{ mb: 2 }}
                            required
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit Ticket'}
                        </Button>
                    </form>
                )}
            </Paper>

            {}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    For urgent matters, you can also email us at{' '}
                    <a href="mailto:support@tiishka.com">support@tiishka.com</a>
                </Typography>
            </Box>
        </Box>
    );
};

export default SupportPage;