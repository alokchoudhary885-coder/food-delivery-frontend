import { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * ImageUpload component
 * Props:
 *  - type: 'restaurant' | 'menu'
 *  - onUpload: (url) => void   called with the Cloudinary URL after upload
 *  - currentImage: string (optional) existing image URL to preview
 */
export default function ImageUpload({ type = 'restaurant', onUpload, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Sirf image files allowed hain');
    }
    const maxMB = type === 'restaurant' ? 5 : 3;
    if (file.size > maxMB * 1024 * 1024) {
      return toast.error(`File size ${maxMB}MB se zyada nahi honi chahiye`);
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post(`/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data.url;
      onUpload(url);
      toast.success('Image upload ho gayi! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`upload-zone ${drag ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{ cursor: uploading ? 'wait' : 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {preview ? (
        <div className="upload-preview">
          <img src={preview} alt="Preview" className="upload-img" />
          <div className="upload-overlay">
            {uploading ? (
              <div className="upload-spinner">⏳ Uploading...</div>
            ) : (
              <div className="upload-change">📷 Change Image</div>
            )}
          </div>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            {uploading ? 'Uploading...' : 'Click ya drag karo image yahan'}
          </p>
          <p className="upload-hint">
            JPG, PNG, WEBP • Max {type === 'restaurant' ? '5' : '3'}MB
          </p>
        </div>
      )}

      <style>{`
        .upload-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          transition: all 0.2s;
          overflow: hidden;
          min-height: 140px;
          position: relative;
        }
        .upload-zone:hover { border-color: var(--color-orange); }
        .upload-zone.drag-over {
          border-color: var(--color-orange);
          background: rgba(255,107,53,0.06);
        }
        .upload-zone.uploading { opacity: 0.7; }
        .upload-preview { position: relative; width: 100%; }
        .upload-img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .upload-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .upload-preview:hover .upload-overlay { opacity: 1; }
        .upload-spinner, .upload-change {
          color: white; font-size: 0.9rem; font-weight: 600;
          background: rgba(0,0,0,0.5); padding: 8px 16px; border-radius: 20px;
        }
        .upload-placeholder {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 2rem; gap: 8px;
        }
        .upload-icon { font-size: 2.5rem; }
        .upload-text { color: var(--color-text-muted); font-size: 0.875rem; font-weight: 500; }
        .upload-hint { color: var(--color-text-muted); font-size: 0.75rem; }
      `}</style>
    </div>
  );
}
