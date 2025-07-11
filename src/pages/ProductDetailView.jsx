import React from 'react';
import { getImageUrl } from '../utils/api';
import './ProductDetailView.css';

export default function ProductDetailView({
  product,
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  editMode = false,
  saving = false,
  preview
}) {
  // User side: image left, info center, no inputs, no admin buttons
  if (!editMode) {
    return (
      <div className="product-detail-view user-mode" style={{ display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: '0 0 260px', display: 'flex', justifyContent: 'center' }}>
          <img src={getImageUrl(product?.image_url)} alt={product?.name} style={{ width: 240, height: 240, objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, maxWidth: 400 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: '1.05rem', color: '#bdbdbd', fontWeight: 600, letterSpacing: 0.5 }}>Product Name</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>{product?.name}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: '1.05rem', color: '#bdbdbd', fontWeight: 600, letterSpacing: 0.5 }}>Description</span>
            <div style={{ fontSize: '1.08rem', color: '#e0e0e0', marginTop: 2 }}>{product?.description}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: '1.05rem', color: '#bdbdbd', fontWeight: 600, letterSpacing: 0.5 }}>Price</span>
            <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginTop: 2 }}>PKR {product?.price}</div>
          </div>
        </div>
      </div>
    );
  }

  // Admin side (edit mode)
  return (
    <div className="product-detail-view admin-mode" style={{ display: 'flex', gap: 32 }}>
      <div style={{ flex: '0 0 260px' }}>
        {preview && (
          <img src={preview} alt="Preview" style={{ width: 240, height: 240, objectFit: 'cover', marginTop: 8 }} />
        )}
        {!preview && (
          <img src={getImageUrl(product?.image_url)} alt={product?.name} style={{ width: 240, height: 240, objectFit: 'cover' }} />
        )}
      </div>
      <form onSubmit={onSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <label>Title</label>
        <input type="text" name="name" value={formData.name} onChange={onChange} required />
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={onChange} maxLength={200} />
        <label>Price</label>
        <input type="number" name="price" value={formData.price} onChange={onChange} required />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Done'}</button>
          {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
