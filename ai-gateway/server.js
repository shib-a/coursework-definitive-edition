const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('combined'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            openai: !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your-api-key-here',
            stability: !!STABILITY_API_KEY && STABILITY_API_KEY !== 'your-api-key-here'
        }
    });
});

app.post('/api/ai/generate/openai', async (req, res) => {
    try {
        if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
            return res.status(503).json({
                error: 'OpenAI API key not configured',
                type: 'API_KEY_MISSING'
            });
        }

        const { prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard', style = 'vivid' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('[OpenAI]', prompt.substring(0, 40) + '...');

        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model,
                prompt,
                n: 1,
                size,
                quality: model.includes('dall-e-3') ? quality : undefined,
                style: model.includes('dall-e-3') ? style : undefined,
                response_format: 'b64_json'
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        const imageData = openaiResponse.data.data[0];
        const imageBase64 = imageData.b64_json;


        res.json({
            success: true,
            imageBase64,
            revised_prompt: imageData.revised_prompt,
            model,
            size
        });

    } catch (error) {
        console.error('[OpenAI] Error:', error.response?.data || error.message);
        
        let errorType = 'UNKNOWN_ERROR';
        let statusCode = 500;
        let message = error.message;

        if (error.response) {
            statusCode = error.response.status;
            message = error.response.data?.error?.message || error.message;
            
            if (statusCode === 401 || statusCode === 403) {
                errorType = 'API_KEY_INVALID';
            } else if (statusCode === 429) {
                errorType = 'RATE_LIMIT_EXCEEDED';
            } else if (error.response.data?.error?.type?.includes('content_policy')) {
                errorType = 'CONTENT_POLICY_VIOLATION';
            }
        }

        res.status(statusCode).json({
            error: message,
            type: errorType,
            service: 'OpenAI'
        });
    }
});

app.post('/api/ai/generate/stability', async (req, res) => {
    try {
        if (!STABILITY_API_KEY || STABILITY_API_KEY === 'your-api-key-here') {
            return res.status(503).json({
                error: 'Stability AI API key not configured',
                type: 'API_KEY_MISSING'
            });
        }

        const { prompt, model = 'sd3-medium', size = '1024x1024', cfg_scale = 7.0, steps = 30 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const [width, height] = size.split('x').map(Number);

        console.log('[Stability]', prompt.substring(0, 40) + '...');

        const FormData = require('form-data');
        const formData = new FormData();
        
        formData.append('prompt', prompt);
        formData.append('output_format', 'png');
        formData.append('model', model || 'sd3-medium');
        
        if (width === height && width === 1024) {
            formData.append('aspect_ratio', '1:1');
        } else {
            formData.append('aspect_ratio', `${width}:${height}`);
        }

        const stabilityResponse = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/sd3',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${STABILITY_API_KEY}`,
                    ...formData.getHeaders()
                },
                timeout: 60000,
                responseType: 'arraybuffer'
            }
        );

        const imageBase64 = Buffer.from(stabilityResponse.data).toString('base64');


        res.json({
            success: true,
            imageBase64,
            model,
            size: `${width}x${height}`
        });

    } catch (error) {
        console.error('[Stability] Error:', error.response?.data?.toString() || error.message);
        
        let errorType = 'UNKNOWN_ERROR';
        let statusCode = 500;
        let message = error.message;

        if (error.response) {
            statusCode = error.response.status;
            
            if (statusCode === 401 || statusCode === 403) {
                errorType = 'API_KEY_INVALID';
                message = 'Invalid or missing API key';
            } else if (statusCode === 429) {
                errorType = 'RATE_LIMIT_EXCEEDED';
                message = 'Rate limit exceeded';
            }
        }

        res.status(statusCode).json({
            error: message,
            type: errorType,
            service: 'Stability AI'
        });
    }
});

app.post('/api/ai/generate', async (req, res) => {
    const { provider = 'openai' } = req.body;
    
    if (provider === 'stability') {
        return app.handle(req, res, '/api/ai/generate/stability');
    } else {
        return app.handle(req, res, '/api/ai/generate/openai');
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        type: 'UNKNOWN_ERROR'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Gateway :${PORT}`);
});
