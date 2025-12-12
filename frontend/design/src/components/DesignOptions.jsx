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
                maxHeight: '80vh', // Make it scrollable
                border: '1px solid #ddd',
                borderRadius: 2,
                backgroundColor: '#fff',
            }}
        >
            {}
            <Typography variant="h6" gutterBottom>
                Design <span role="img" aria-label="info">ℹ️</span>
            </Typography>
            <TextField fullWidth label="Custom t-shirt prompt" variant="outlined" sx={{ mb: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
                Text on Design <span role="img" aria-label="info">ℹ️</span>
            </Typography>
            <TextField fullWidth label="Words or phrase (optional)" variant="outlined" sx={{ mb: 2 }} />

            {}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Cat" onDelete={() => {}} color="primary" variant="outlined" />
                <Chip label="Thanksgiving" onDelete={() => {}} color="primary" variant="outlined" />
                <Chip label="Halloween" onDelete={() => {}} color="primary" variant="outlined" />
            </Box>

            {}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Ideogram</InputLabel>
                        <Select value="Premium" label="Ideogram">
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
                        <InputLabel>Quality</InputLabel>
                        <Select value="AR" label="Quality">
                            <MenuItem value="AR">AR</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Variations</InputLabel>
                        <Select value="Draft" label="Variations">
                            <MenuItem value="Draft">Draft -15s</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Premium</InputLabel>
                        <Select value="Premium" label="Premium">
                            <MenuItem value="Premium">Premium -10s</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Ultra</InputLabel>
                        <Select value="Ultra" label="Ultra">
                            <MenuItem value="Ultra">Ultra -10s</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {}
            <Button variant="contained" color="warning" fullWidth sx={{ mb: 1 }}>
                Submit 2 Credits
            </Button>

            {}
            <Alert severity="error" sx={{ mb: 2 }}>
                This service is currently unavailable in your country.
            </Alert>

            <Divider sx={{ mb: 2 }} />

            {}
            <Typography variant="h6" gutterBottom>
                VIBES <span role="img" aria-label="info">ℹ️</span>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography>Create your own vibe</Typography>
                <Button variant="contained" color="primary">
                    ADD
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Funny</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Trendy</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Inclusivity</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Minimalist</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Peace</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {}
            <Typography variant="h6" gutterBottom>
                SHAPES <span role="img" aria-label="info">ℹ️</span>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography>Create your own shape</Typography>
                <Button variant="contained" color="primary">
                    ADD
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Heart</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Cat</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Music note</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Dog</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Anchor</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {}
            <Typography variant="h6" gutterBottom>
                PATTERNS
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton> {}
                    <Typography>Infinite Cosmos</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Nebula Blaze</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton>
                    <Typography>Asteroid Field</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton> {}
                    <Typography>Galactic Spiral</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <IconButton></IconButton> {}
                    <Typography>Saratoga Cosmos</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default DesignOptions;