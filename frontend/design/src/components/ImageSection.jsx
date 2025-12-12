import React, { useContext, useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, TextField, Stack } from '@mui/material';
import { Collections as MyContentIcon, Upload as UploadIcon } from '@mui/icons-material';
import { DesignContext } from '../DesignContext';
import { AuthContext } from '../AuthContext';
import { imagesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ImagesSection = () => {
    const { addDesign } = useContext(DesignContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addDesign({ src: e.target.result }); // Add as base64 URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadToServer = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!user) {
            setError('Please login to upload images to your account');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await imagesAPI.uploadImage(file, title || file.name, description);
            setSuccess(`Image uploaded successfully! ID: ${response.imageId}`);

            if (response.imageUrl) {
                addDesign({
                    src: response.imageUrl,
                    imageId: response.imageId
                });
            }

            setTitle('');
            setDescription('');
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Images Section</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload images to add to your design or save them to your account.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mt: 2, mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>Quick Upload</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Upload an image temporarily (not saved to account)
                    </Typography>
                    <Button variant="outlined" component="label" fullWidth>
                        Choose Image & Add to Design
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </Button>
                </Box>

                {user && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Upload & Save to Account</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Upload and save image to your account
                        </Typography>

                        <TextField
                            fullWidth
                            label="Title (optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                        />

                        <TextField
                            fullWidth
                            label="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                            size="small"
                        />

                        <Button
                            variant="contained"
                            component="label"
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                        >
                            {loading ? 'Uploading...' : 'Upload to My Images'}
                            <input type="file" hidden accept="image/*" onChange={handleUploadToServer} />
                        </Button>
                    </Box>
                )}

                {user && (
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        startIcon={<MyContentIcon />}
                        onClick={() => navigate('/my-content')}
                    >
                        View My Designs & Images
                    </Button>
                )}

                {!user && (
                    <Alert severity="info">
                        <Typography variant="body2">
                            Login to save images to your account and access them anytime!
                        </Typography>
                    </Alert>
                )}
            </Stack>
        </Box>
    );
};

export default ImagesSection;