export const getImageUrl = (imagePath, apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') => {
  if (!imagePath) {
    console.warn('Aucun chemin d\'image fourni');
    return 'https://placehold.co/300x150?text=Aucune+image';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  if (!apiBaseUrl) {
    console.error('API_BASE_URL n\'est pas défini');
    return 'https://placehold.co/300x150?text=Aucune+image';
  }
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/uploads/${imagePath}`;
  const fullUrl = `${apiBaseUrl}${normalizedPath}`;
  console.log('URL d\'image générée:', fullUrl); // Débogage
  return fullUrl;
};