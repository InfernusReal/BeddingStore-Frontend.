import React, { useState, useEffect } from 'react';
import './Announcements.css';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [likedAnnouncements, setLikedAnnouncements] = useState(new Set());

  useEffect(() => {
    fetchAnnouncements();
    // Load username from localStorage if available
    const savedUsername = localStorage.getItem('announcementUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAnnouncements(data);
        
        // Check like status for each announcement
        const likedSet = new Set();
        for (const announcement of data) {
          try {
            const likeResponse = await fetch(`/api/announcements/${announcement.id}/like-status`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              if (likeData.liked) {
                likedSet.add(announcement.id);
              }
            }
          } catch (likeError) {
            console.error('Error checking like status:', likeError);
          }
        }
        setLikedAnnouncements(likedSet);
      } else {
        console.error('Expected array but got:', data);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (announcementId) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update local like status
        const newLikedSet = new Set(likedAnnouncements);
        if (result.liked) {
          newLikedSet.add(announcementId);
        } else {
          newLikedSet.delete(announcementId);
        }
        setLikedAnnouncements(newLikedSet);
        
        // Update like count in announcements
        setAnnouncements(prev => prev.map(ann => 
          ann.id === announcementId 
            ? { ...ann, like_count: ann.like_count + (result.liked ? 1 : -1) }
            : ann
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const openCommentsModal = async (announcement) => {
    setSelectedAnnouncement(announcement);
    try {
      const response = await fetch(`/api/announcements/${announcement.id}/comments`);
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const closeCommentsModal = () => {
    setSelectedAnnouncement(null);
    setComments([]);
    setNewComment('');
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem('announcementUsername', newUsername);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !username.trim()) {
      alert('Please enter both username and comment');
      return;
    }

    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          username: username
        })
      });

      if (response.ok) {
        const result = await response.json();
        setComments(prev => [result, ...prev]);
        setNewComment('');
        
        // Update comment count in announcements
        setAnnouncements(prev => prev.map(ann => 
          ann.id === selectedAnnouncement.id 
            ? { ...ann, comment_count: ann.comment_count + 1 }
            : ann
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Error posting comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment');
    }
  };

  const handleShare = async (announcement) => {
    const shareData = {
      title: 'BnS Store Announcement',
      text: announcement.description,
      url: window.location.href
    };

    try {
      // Check if the Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const shareText = `Check out this announcement from BnS Store:\n\n"${announcement.description}"\n\nView more at: ${window.location.href}`;
        
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert('Announcement details copied to clipboard!');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Announcement details copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback - show a modal with share options
      const confirmed = confirm(
        `Share this announcement:\n\n"${announcement.description}"\n\nClick OK to copy the text, or Cancel to close.`
      );
      
      if (confirmed) {
        try {
          const shareText = `"${announcement.description}" - BnS Store`;
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareText);
            alert('Copied to clipboard!');
          }
        } catch (clipboardError) {
          console.error('Clipboard access failed:', clipboardError);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="announcements-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <div className="announcements-container">
        <header className="announcements-header">
          <h1>Latest Announcements</h1>
          <p>Stay updated with our latest news and updates!</p>
        </header>

        {announcements.length === 0 ? (
          <div className="no-announcements">
            <div className="no-announcements-icon">📢</div>
            <h2>No Announcements Yet</h2>
            <p>Check back later for exciting updates and news!</p>
          </div>
        ) : (
          <div className="announcements-feed">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="announcement-post">
                <div className="post-header">
                  <div className="brand-info">
                    <div className="brand-avatar">
                      <span>B&S</span>
                    </div>
                    <div className="brand-details">
                      <h3>B&S Store</h3>
                      <span className="post-date">{formatDate(announcement.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="post-image">
                  <img 
                    src={`http://localhost:5000/images/announcements/${announcement.image_path}`} 
                    alt="Announcement" 
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', announcement.image_path);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="post-actions">
                  <button 
                    className={`action-btn like-btn ${likedAnnouncements.has(announcement.id) ? 'liked' : ''}`}
                    onClick={() => handleLike(announcement.id)}
                  >
                    <span className="action-icon">
                      {likedAnnouncements.has(announcement.id) ? '❤️' : '🤍'}
                    </span>
                  </button>
                  
                  <button 
                    className="action-btn comment-btn"
                    onClick={() => openCommentsModal(announcement)}
                  >
                    <span className="action-icon">💬</span>
                  </button>
                  
                  <button 
                    className="action-btn share-btn"
                    onClick={() => handleShare(announcement)}
                  >
                    <span className="action-icon">📤</span>
                  </button>
                </div>

                <div className="post-stats">
                  <p className="likes-count">
                    <strong>{announcement.like_count || 0}</strong> likes
                  </p>
                </div>

                <div className="post-content">
                  <p>
                    <strong>bns_store</strong> {announcement.description}
                  </p>
                </div>

                {announcement.comment_count > 0 && (
                  <button 
                    className="view-comments-btn"
                    onClick={() => openCommentsModal(announcement)}
                  >
                    View all {announcement.comment_count} comments
                  </button>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Comments Modal */}
        {selectedAnnouncement && (
          <div className="modal-overlay" onClick={closeCommentsModal}>
            <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Comments</h3>
                <button className="close-btn" onClick={closeCommentsModal}>×</button>
              </div>

              <div className="modal-content">
                <div className="announcement-preview">
                  <img src={`http://localhost:5000/images/announcements/${selectedAnnouncement.image_path}`} alt="Announcement" />
                  <p>{selectedAnnouncement.description}</p>
                </div>

                <div className="comments-section">
                  <form onSubmit={handleSubmitComment} className="comment-form">
                    <input
                      type="text"
                      placeholder="Your username"
                      value={username}
                      onChange={handleUsernameChange}
                      className="username-input"
                      required
                    />
                    <textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="3"
                      required
                    />
                    <button type="submit" className="post-comment-btn">
                      Post Comment
                    </button>
                  </form>

                  <div className="comments-list">
                    {comments.length === 0 ? (
                      <p className="no-comments">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <strong className="comment-username">{comment.username}</strong>
                            <span className="comment-date">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="comment-text">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
