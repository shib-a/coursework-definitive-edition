

export const getApiImageUrl = (path) => {

    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }


    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = isDevelopment ? 'http://localhost:8080' : '';

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${backendUrl}${normalizedPath}`;
};

export default getApiImageUrl;

