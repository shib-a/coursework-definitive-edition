import React, { useState } from 'react';
import {
    Switch,
    FormControlLabel,
    CircularProgress,
    Tooltip,
    Box,
} from '@mui/material';
import { Public as PublicIcon, Lock as LockIcon } from '@mui/icons-material';


const VisibilityToggle = ({ itemId, itemType, initialStatus, onUpdate, disabled = false }) => {
    const [isPublic, setIsPublic] = useState(initialStatus || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleToggle = async (event) => {
        const newStatus = event.target.checked;
        setLoading(true);
        setError('');

        try {

            const { designsAPI, imagesAPI } = await import('../services/api');

            if (itemType === 'design') {
                await designsAPI.updateDesignVisibility(itemId, newStatus);
            } else if (itemType === 'image') {
                await imagesAPI.updateImageVisibility(itemId, newStatus);
            }

            setIsPublic(newStatus);

            if (onUpdate) {
                onUpdate(newStatus);
            }
        } catch (err) {
            console.error('Failed to update visibility:', err);
            setError(err.response?.data?.error || 'Failed to update visibility');

            setIsPublic(!newStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip
                title={
                    loading
                        ? 'Updating...'
                        : error
                        ? error
                        : isPublic
                        ? 'Public - Anyone can see this'
                        : 'Private - Only you can see this'
                }
                arrow
            >
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPublic}
                            onChange={handleToggle}
                            disabled={loading || disabled}
                            color="primary"
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {loading ? (
                                <CircularProgress size={16} />
                            ) : isPublic ? (
                                <PublicIcon fontSize="small" />
                            ) : (
                                <LockIcon fontSize="small" />
                            )}
                            <span>{isPublic ? 'Public' : 'Private'}</span>
                        </Box>
                    }
                />
            </Tooltip>
        </Box>
    );
};

export default VisibilityToggle;

