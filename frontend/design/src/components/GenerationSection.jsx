import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Alert, CircularProgress } from '@mui/material';
import { Collections as MyContentIcon } from '@mui/icons-material';
import { DesignContext } from '../DesignContext';
import { AuthContext } from '../AuthContext';
import { designsAPI, imagesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GenerationSection = () => {
    const { addDesign } = useContext(DesignContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [text, setText] = useState('');
    const [aiAgent, setAiAgent] = useState(1); // Default to model ID 1
    const [variations, setVariations] = useState(2);
    const [theme, setTheme] = useState('CASUAL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async () => {
        if (!user) {
            setError('Please login to generate designs');
            return;
        }

        if (!prompt) {
            setError('Please enter a design prompt');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await designsAPI.generateDesign(
                prompt,
                text || null,
                aiAgent,
                theme,
                variations
            );

            console.log('Generation response:', response);

            if (response.status === 'PROCESSING') {
                setSuccess('Design generation started! This is a placeholder implementation. Check "My Content" to see your design request.');
            } else if (response.status === 'COMPLETED' && response.imageUrl) {
                setSuccess('Design generated successfully! Added to preview.');

                addDesign({
                    src: response.imageUrl,
                    designId: response.designId
                });
            } else {
                setSuccess('Design request submitted! It will appear in "My Content" when ready.');
            }

            setPrompt('');
            setText('');
        } catch (err) {
            console.error('Generation error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data || err.message || 'Failed to generate design. Please try again.';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    const handleRandomDesign = async () => {
        setLoading(true);
        setError('');
        try {

            const [designs, images] = await Promise.all([
                designsAPI.getPublicDesigns(),
                imagesAPI.getPublicImages()
            ]);

            const allContent = [
                ...designs.map(d => ({
                    type: 'design',
                    id: d.designId,
                    url: d.imageUrl,
                    data: d
                })),
                ...images.map(i => ({
                    type: 'image',
                    id: i.imageId,
                    url: i.imageUrl,
                    data: i
                }))
            ];

            if (allContent.length === 0) {
                setError('No public designs or images available yet. Check the Community Gallery later!');
                return;
            }

            const randomItem = allContent[Math.floor(Math.random() * allContent.length)];

            if (randomItem.type === 'design') {
                addDesign({
                    src: randomItem.url,
                    designId: randomItem.id
                });
                setSuccess(`Added random design by ${randomItem.data.ownerUsername || 'Anonymous'} to preview!`);
            } else {
                addDesign({
                    src: randomItem.url,
                    imageId: randomItem.id
                });
                setSuccess(`Added random image by ${randomItem.data.uploaderUsername || 'Anonymous'} to preview!`);
            }
        } catch (err) {
            console.error('Error fetching random design:', err);
            setError('Failed to fetch from public gallery. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Generation Section</Typography>

            {}
            <TextField
                fullWidth
                label="Design Prompt"
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                placeholder="e.g., A cute cat playing with yarn"
                sx={{ mb: 2 }}
            />

            {}
            <TextField
                fullWidth
                label="Text to include (optional)"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
                placeholder="e.g., Meow"
                sx={{ mb: 2 }}
            />

            {}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Generative AI Model</InputLabel>
                <Select value={aiAgent} onChange={(e) => setAiAgent(e.target.value)} disabled={loading}>
                    <MenuItem value={1}>OpenAI DALL-E 3</MenuItem>
                    <MenuItem value={2}>OpenAI DALL-E 2</MenuItem>
                    <MenuItem value={3}>Stability AI - SDXL (Best Quality)</MenuItem>
                    <MenuItem value={4}>Stability AI - SD v1.6 (Fast)</MenuItem>
                    <MenuItem value={999}>Mock AI (Testing)</MenuItem>
                </Select>
            </FormControl>

            {}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme</InputLabel>
                <Select value={theme} onChange={(e) => setTheme(e.target.value)} disabled={loading}>
                    <MenuItem value="CASUAL">Casual</MenuItem>
                    <MenuItem value="FORMAL">Formal</MenuItem>
                    <MenuItem value="SPORT">Sport</MenuItem>
                    <MenuItem value="ARTISTIC">Artistic</MenuItem>
                    <MenuItem value="MINIMALIST">Minimalist</MenuItem>
                </Select>
            </FormControl>

            {}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Amount of Variations</InputLabel>
                <Select value={variations} onChange={(e) => setVariations(e.target.value)} disabled={loading}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                </Select>
            </FormControl>

            {}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={loading || !user}
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Generate Design'}
            </Button>

            {}
            <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleRandomDesign}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                Add Random from Gallery
            </Button>

            {}
            {user && (
                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<MyContentIcon />}
                    onClick={() => navigate('/my-content')}
                    sx={{ mb: 2 }}
                >
                    View My Designs & Images
                </Button>
            )}

            {}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            {!user && <Alert severity="warning" sx={{ mt: 2 }}>Please login to generate designs</Alert>}
            <Alert severity="info" sx={{ mt: 2 }}>
                Generations may take time based on AI model and complexity.
            </Alert>
        </Box>
    );
};

export default GenerationSection;