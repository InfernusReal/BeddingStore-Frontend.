import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductDetailView from './ProductDetailView';

export default function AdminProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    published: true,
    collection_id: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/slug/${slug}`)
      .then(res => {
        setProduct(res.data);
        setFormData({
          name: res.data.name || '',
          description: res.data.description || '',
          price: res.data.price || '',
          published: res.data.published,
          collection_id: res.data.collection_id || '',
          image: null
        });
        setPreview(res.data.image_url ? `http://localhost:5000${res.data.image_url}` : null);
      })
      .catch(() => alert('Product not found.'));
  }, [slug]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file || null }));
    setPreview(file ? URL.createObjectURL(file) : (product?.image_url ? `http://localhost:5000${product.image_url}` : null));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    for (let key in formData) {
      if (key === 'image' && !formData[key]) continue;
      // Fix: send null for collection_id if empty string or falsy
      if (key === 'collection_id') {
        data.append('collection_id', formData.collection_id ? formData.collection_id : null);
      } else {
        data.append(key, formData[key]);
      }
    }
    try {
      await axios.put(`/api/products/slug/${slug}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product updated!');
      navigate('/admin');
    } catch (err) {
      alert('Update failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!product) return <div>Loading...</div>;

  return (
    <div className="admin-product-detail">
      <h2 className="edit-product-heading">Edit Product</h2>
      <ProductDetailView
        product={product}
        formData={formData}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        editMode={true}
        saving={saving}
        preview={preview}
      />
    </div>
  );
}
