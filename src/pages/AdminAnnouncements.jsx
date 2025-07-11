import React, { useState, useEffect } from 'react';
import { getApiUrl, getImageUrl } from '../utils/api';
import './AdminAnnouncements.css';

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(getApiUrl('/api/announcements'));
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setMessage('Error fetching announcements');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image || !formData.description.trim()) {
      setMessage('Please provide both image and description');
      return;
    }

    setLoading(true);
    setMessage('');

    const submitFormData = new FormData();
    submitFormData.append('image', formData.image);
    submitFormData.append('description', formData.description);

    try {
      const response = await fetch(getApiUrl('/api/announcements'), {
        method: 'POST',
        body: submitFormData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Announcement created successfully!');
        setFormData({ description: '', image: null });
        setImagePreview('');
        document.getElementById('imageInput').value = '';
        fetchAnnouncements(); // Refresh the list
      } else {
        setMessage(result.error || 'Error creating announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setMessage('Error creating announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imagePath) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/announcements/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Announcement deleted successfully');
        fetchAnnouncements(); // Refresh the list
      } else {
        const result = await response.json();
        setMessage(result.error || 'Error deleting announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setMessage('Error deleting announcement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-announcements">
      <div className="admin-announcements-container">
        <h1 className="admin-announcements-title">Announcements Management</h1>
        
        {/* Create Announcement Form */}
        <div className="announcement-form-section">
          <h2>Create New Announcement</h2>
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="form-group">
              <label className="form-label">Upload Announcement Image</label>
              <div className="upload-section">
                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-file-input"
                  required
                />
                <label htmlFor="imageInput" className="upload-button">
                  <div className="upload-icon">📸</div>
                  <div className="upload-text">
                    <span className="upload-main-text">
                      {formData.image ? 'Change Image' : 'Choose Image'}
                    </span>
                    <span className="upload-sub-text">
                      Click to upload your announcement image
                    </span>
                  </div>
                </label>
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <div className="preview-overlay">
                      <span className="preview-text">✓ Image Selected</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Announcement Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write your announcement description here..."
                rows="4"
                className="description-input"
                required
              />
              <div className="char-counter">
                {formData.description.length}/500 characters
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !formData.image || !formData.description.trim()}
            >
              <span className="btn-icon">
                {loading ? '⏳' : '🚀'}
              </span>
              <span className="btn-text">
                {loading ? 'Creating Announcement...' : 'Create Announcement'}
              </span>
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Existing Announcements */}
        <div className="announcements-list-section">
          <h2>Existing Announcements ({announcements.length})</h2>
          
          {announcements.length === 0 ? (
            <div className="no-announcements">
              <p>No announcements found. Create your first announcement above!</p>
            </div>
          ) : (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-image">
                    <img 
                      src={getImageUrl(`/images/announcements/${announcement.image_path}`)} 
                      alt="Announcement" 
                      onError={(e) => {
                        console.error('Admin image failed to load:', announcement.image_path);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="announcement-content">
                    <p className="announcement-description">
                      {announcement.description}
                    </p>
                    
                    <div className="announcement-stats">
                      <span className="stat">
                        <span className="stat-icon">❤️</span>
                        {announcement.like_count || 0} likes
                      </span>
                      <span className="stat">
                        <span className="stat-icon">💬</span>
                        {announcement.comment_count || 0} comments
                      </span>
                    </div>
                    
                    <div className="announcement-meta">
                      <span className="date">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(announcement.id, announcement.image_path)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncements;
