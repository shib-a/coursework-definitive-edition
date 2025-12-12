import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Image as ImageIcon,
    Brush as DesignIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import { designsAPI, imagesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { DesignContext } from '../DesignContext';
import getApiImageUrl from '../utils/apiImageUrl';
import VisibilityToggle from '../components/VisibilityToggle';

const MyContentPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { addDesign, designState } = useContext(DesignContext);
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(0);
    const [designs, setDesigns] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            loadContent();
        }
    }, [user, currentTab]);

    const loadContent = async () => {
        setLoading(true);
        setError('');
        try {
            if (currentTab === 0) {

                const designsData = await designsAPI.getMyDesigns();
                setDesigns(designsData);
            } else {

                const imagesData = await imagesAPI.getMyImages();
                setImages(imagesData);
            }
        } catch (err) {
            console.error('Error loading content:', err);
            setError(err.response?.data?.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedItem(null);
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
            return;
        }

        try {
            if (type === 'design') {
                await designsAPI.deleteDesign(id);
                setDesigns(designs.filter(d => d.designId !== id));
            } else {
                await imagesAPI.deleteImage(id);
                setImages(images.filter(i => i.imageId !== id));
            }
            handleCloseDialog();
        } catch (err) {
            console.error('Error deleting:', err);
            setError(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleUseDesign = (design) => {

        const imageUrl = design.imageUrl || `/api/designs/${design.designId}/image`;
        console.log('MyContent: Adding design to canvas:', imageUrl);
        console.log('MyContent: Current design count before add:', designState.designs.length);

        addDesign({
            src: imageUrl, // Don't call getApiImageUrl here - it will be called in Preview
            designId: design.designId,
        });

        setTimeout(() => {
            console.log('MyContent: Navigating to home after adding design');
            navigate('/');
        }, 250);
    };

    const handleUseImage = (image) => {

        const imageUrl = image.imageUrl || `/api/images/${image.imageId}/file`;
        console.log('MyContent: Adding image to design:', imageUrl);
        console.log('MyContent: Current design count before add:', designState.designs.length);

        addDesign({
            src: imageUrl, // Don't call getApiImageUrl here - it will be called in Preview
            imageId: image.imageId,
        });

        setTimeout(() => {
            console.log('MyContent: Navigating to home after adding image');
            navigate('/');
        }, 250);
    };

    const handleDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = getApiImageUrl(url);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Content
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                View and manage your uploaded images and generated designs
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab icon={<DesignIcon />} label="My Designs" />
                    <Tab icon={<ImageIcon />} label="My Images" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {}
                    {currentTab === 0 && (
                        <Grid container spacing={3}>
                            {designs.length === 0 ? (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        No designs found. Start generating designs in the Generation section!
                                    </Alert>
                                </Grid>
                            ) : (
                                designs.map((design) => (
                                    <Grid item xs={12} sm={6} md={4} key={design.designId}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={getApiImageUrl(design.imageUrl || `/api/designs/${design.designId}/image`)}
                                                alt={design.prompt}
                                                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(design)}
                                            />
                                            <CardContent>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {design.prompt}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip label={design.theme} size="small" />
                                                    <Chip label={design.status} size="small" color={
                                                        design.status === 'COMPLETED' ? 'success' :
                                                        design.status === 'FAILED' ? 'error' : 'default'
                                                    } />
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    size="small"
                                                    startIcon={<ViewIcon />}
                                                    onClick={() => handleViewDetails(design)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleUseDesign(design)}
                                                    disabled={design.status !== 'COMPLETED'}
                                                >
                                                    Use
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(design.designId, 'design')}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}

                    {}
                    {currentTab === 1 && (
                        <Grid container spacing={3}>
                            {images.length === 0 ? (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        No images found. Upload images in the Images section!
                                    </Alert>
                                </Grid>
                            ) : (
                                images.map((image) => (
                                    <Grid item xs={12} sm={6} md={4} key={image.imageId}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={getApiImageUrl(image.imageUrl || `/api/images/${image.imageId}/file`)}
                                                alt={image.title}
                                                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(image)}
                                            />
                                            <CardContent>
                                                <Typography variant="subtitle2" noWrap>
                                                    {image.title || 'Untitled'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {image.description || 'No description'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(image.uploadedDate).toLocaleDateString()}
                                                </Typography>
                                                <Box sx={{ mt: 2 }}>
                                                    <VisibilityToggle
                                                        itemId={image.imageId}
                                                        itemType="image"
                                                        initialStatus={image.isPublic}
                                                        onUpdate={loadContent}
                                                    />
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    size="small"
                                                    startIcon={<ViewIcon />}
                                                    onClick={() => handleViewDetails(image)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleUseImage(image)}
                                                >
                                                    Use
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(image.imageId, 'image')}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}
                </>
            )}

            {}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                {selectedItem && (
                    <>
                        <DialogTitle>
                            {currentTab === 0 ? 'Design Details' : 'Image Details'}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <img
                                    src={getApiImageUrl(
                                        selectedItem.imageUrl ||
                                        (currentTab === 0
                                            ? `/api/designs/${selectedItem.designId}/image`
                                            : `/api/images/${selectedItem.imageId}/file`)
                                    )}
                                    alt={selectedItem.prompt || selectedItem.title}
                                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                                />
                            </Box>

                            {currentTab === 0 ? (

                                <>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Prompt:
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedItem.prompt}
                                    </Typography>

                                    {selectedItem.text && (
                                        <>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Text:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                {selectedItem.text}
                                            </Typography>
                                        </>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        <Chip label={`Theme: ${selectedItem.theme}`} size="small" />
                                        <Chip label={`Model: ${selectedItem.aiModelId}`} size="small" />
                                        <Chip label={`Status: ${selectedItem.status}`} size="small" color={
                                            selectedItem.status === 'COMPLETED' ? 'success' :
                                            selectedItem.status === 'FAILED' ? 'error' : 'default'
                                        } />
                                    </Box>

                                    <Typography variant="caption" color="text.secondary">
                                        Created: {new Date(selectedItem.createdDate).toLocaleString()}
                                    </Typography>
                                </>
                            ) : (

                                <>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Title:
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedItem.title || 'Untitled'}
                                    </Typography>

                                    <Typography variant="subtitle2" gutterBottom>
                                        Description:
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedItem.description || 'No description'}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        Uploaded: {new Date(selectedItem.uploadedDate).toLocaleString()}
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                startIcon={<DownloadIcon />}
                                onClick={() =>
                                    handleDownload(
                                        selectedItem.imageUrl ||
                                        (currentTab === 0
                                            ? `/api/designs/${selectedItem.designId}/image`
                                            : `/api/images/${selectedItem.imageId}/file`),
                                        currentTab === 0
                                            ? `design-${selectedItem.designId}.png`
                                            : `image-${selectedItem.imageId}.png`
                                    )
                                }
                            >
                                Download
                            </Button>
                            <Button
                                color="primary"
                                onClick={() => {
                                    if (currentTab === 0) {
                                        handleUseDesign(selectedItem);
                                    } else {
                                        handleUseImage(selectedItem);
                                    }
                                    handleCloseDialog();
                                }}
                            >
                                Use in Design
                            </Button>
                            <Button
                                color="error"
                                onClick={() =>
                                    handleDelete(
                                        currentTab === 0 ? selectedItem.designId : selectedItem.imageId,
                                        currentTab === 0 ? 'design' : 'image'
                                    )
                                }
                            >
                                Delete
                            </Button>
                            <Button onClick={handleCloseDialog}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default MyContentPage;

