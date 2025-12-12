import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Container,
} from '@mui/material';
import {
    Image as ImageIcon,
    Brush as DesignIcon,
    Person as PersonIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { designsAPI, imagesAPI } from '../services/api';
import { DesignContext } from '../DesignContext';
import { AuthContext } from '../AuthContext';
import getApiImageUrl from '../utils/apiImageUrl';

const PublicGalleryPage = () => {
    const navigate = useNavigate();
    const { addDesign } = useContext(DesignContext);
    const { user } = useContext(AuthContext);
    const [allContent, setAllContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        setError('');
        try {

            const [designsData, imagesData] = await Promise.all([
                designsAPI.getPublicDesigns(),
                imagesAPI.getPublicImages()
            ]);

            const merged = [
                ...designsData.map(d => ({ ...d, contentType: 'design' })),
                ...imagesData.map(i => ({ ...i, contentType: 'image' }))
            ];

            merged.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.uploadedDate);
                const dateB = new Date(b.createdAt || b.uploadedDate);
                return dateB - dateA;
            });

            setAllContent(merged);
        } catch (err) {
            console.error('Error loading public gallery:', err);
            setError('Failed to load public gallery. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleUseContent = (content) => {
        if (!user) {

            navigate('/login');
            return;
        }

        const isDesign = content.contentType === 'design';
        const imageUrl = content.imageUrl || (isDesign
            ? `/api/designs/${content.designId}/image`
            : `/api/images/${content.imageId}/file`);

        console.log('PublicGallery: Adding content to canvas:', imageUrl);

        const designData = {
            src: imageUrl,
        };

        if (isDesign) {
            designData.designId = content.designId;
        } else {
            designData.imageId = content.imageId;
        }

        addDesign(designData);

        setTimeout(() => {
            navigate('/');
        }, 250);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    🌐 Community Gallery
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Discover and use designs and images shared by the community ({allContent.length} items)
                </Typography>
            </Box>


            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {allContent.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                No public content yet. Be the first to share your design or image!
                            </Alert>
                        </Grid>
                    ) : (
                        allContent.map((content) => {
                            const isDesign = content.contentType === 'design';
                            const id = isDesign ? content.designId : content.imageId;
                            const title = isDesign
                                ? (content.prompt || 'Untitled Design')
                                : (content.title || 'Untitled Image');
                            const username = isDesign
                                ? (content.ownerUsername || 'Anonymous')
                                : (content.uploaderUsername || 'Anonymous');
                            const date = isDesign ? content.createdAt : content.uploadedDate;

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={`${content.contentType}-${id}`}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={getApiImageUrl(content.imageUrl)}
                                                alt={title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <Chip
                                                icon={isDesign ? <DesignIcon /> : <ImageIcon />}
                                                label={isDesign ? 'Design' : 'Image'}
                                                size="small"
                                                color={isDesign ? 'primary' : 'secondary'}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                }}
                                            />
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {title}
                                            </Typography>

                                            {!isDesign && content.description && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {content.description}
                                                </Typography>
                                            )}

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24 }}>
                                                    <PersonIcon fontSize="small" />
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary">
                                                    {username}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(date)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                color="primary"
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleUseContent(content)}
                                            >
                                                {user ? 'Use This' : 'Login to Use'}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })
                    )}
                </Grid>
            )}
        </Container>
    );
};

export default PublicGalleryPage;

