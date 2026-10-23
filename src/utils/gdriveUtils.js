// Helper Parser dan Embed URL Google Drive Aman

export function getGDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  // Pola regex Google Drive: /file/d/FILE_ID/view, id=FILE_ID
  const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);

  return match ? match[1] || match[2] : null;
}

export function getGDriveEmbedUrl(url) {
  const fileId = getGDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
