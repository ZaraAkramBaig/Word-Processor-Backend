import React, { useState } from 'react';

function Home({ onCreateDocument }) {
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  // Handler for Blank Document click
  const handleBlankDocumentClick = () => {
    setShowTitlePrompt(true);
  };

  // Handler for creating new document
  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a document title.');
      return;
    }
    setError('');
    onCreateDocument(title.trim());
    setShowTitlePrompt(false);
    setTitle('');
  };

  return (
    <div className="home-container" style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontFamily: 'sans-serif', letterSpacing: 1 }}>Word Processor</h1>
      <div style={{ margin: '60px auto', display: 'flex', justifyContent: 'center' }}>
        <div
          className="blank-document-card"
          style={{
            border: '2px solid #4285f4',
            borderRadius: 12,
            width: 170,
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(66,133,244,0.08)'
          }}
          onClick={handleBlankDocumentClick}
        >
          <div style={{ fontSize: 48, color: '#4285f4', marginBottom: 16 }}>📄</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2d2d2d' }}>Blank Document</div>
        </div>
      </div>

      {showTitlePrompt && (
        <div className="title-modal" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 8,
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)'
          }}>
            <h3>Name your document</h3>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter title"
              style={{ fontSize: 16, padding: 8, width: 220, marginBottom: 12, borderRadius: 4, border: '1px solid #ddd' }}
              autoFocus
            />
            <br />
            <button onClick={handleCreate} style={{
              background: '#4285f4',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: 4,
              padding: '8px 20px',
              fontSize: 16,
              marginTop: 8,
              marginRight: 8
            }}>Create</button>
            <button onClick={() => setShowTitlePrompt(false)} style={{
              background: '#eee',
              color: '#444',
              border: 'none',
              borderRadius: 4,
              padding: '8px 20px',
              fontSize: 16,
              marginTop: 8
            }}>Cancel</button>
            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

