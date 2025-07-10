import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CollectionManager() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [collections, setCollections] = useState([]);
  const [hovered, setHovered] = useState(null);

  // Fetch all existing collections
  useEffect(() => {
    fetchCollections();
  }, []);

  function fetchCollections() {
    axios.get('/api/collections')
      .then(res => setCollections(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to fetch collections:', err));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Collection name required");

    try {
      await axios.post('/api/collections', {
        name,
        description,
        show_on_homepage: showOnHomepage
      });
      alert('Collection created!');
      setName('');
      setDescription('');
      setShowOnHomepage(false);
      fetchCollections(); // refresh list
    } catch (err) {
      console.error(err);
      alert('Creation failed.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await axios.delete(`/api/collections/${id}`);
      fetchCollections();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  }

  return (
    <div className="collection-manager">
      <h2>Create Collection</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Collection name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label style={{display:'block',margin:'0.5rem 0'}}>
          <input
            type="checkbox"
            checked={showOnHomepage}
            onChange={e => setShowOnHomepage(e.target.checked)}
          /> Show on homepage
        </label>
        <button type="submit">Create</button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <h3>Existing Collections:</h3>
        <ul className="collection-list">
          {(Array.isArray(collections) ? collections : []).map(c => (
            <li key={c.id}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ position: 'relative', minHeight: 32 }}
            >
              <span className="collection-heading-animated">{c.name}</span>
              {hovered === c.id && (
                <button
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#d9534f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '2px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                    zIndex: 2
                  }}
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CollectionManager;
