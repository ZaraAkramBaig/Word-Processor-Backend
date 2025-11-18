import React, { useState, useEffect } from 'react';
import './App.css';
import MenuBar from './components/MenuBar';
import FormatToolbar from './components/FormatToolbar';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import SpellCheckPanel from './components/SpellCheckPanel';
import { 
  checkHealth, 
  createDocument, 
  getDocument, 
  updateDocument,
  autoSave,
  exportToHTML,
  exportToPDF,
  exportToDOCX
} from './api/apiClient';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [documentContent, setDocumentContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [pageCount, setPageCount] = useState(1);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(data => {
        setBackendStatus('connected ✓');
      })
      .catch(() => {
        setBackendStatus('disconnected ✗');
      });
  }, []);

  // Calculate page count based on lines
  useEffect(() => {
    const plainText = documentContent.replace(/<[^>]*>/g, '');
    const contentLength = plainText.length;
    
    // More accurate: count actual line breaks and content
    const lines = plainText.split('\n').length;
    const estimatedPages = Math.max(1, Math.ceil(lines / 40)); // ~40 lines per page
    
    setPageCount(estimatedPages);
  }, [documentContent]);

  // Calculate word count
  useEffect(() => {
    const words = documentContent
      .replace(/<[^>]*>/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWordCount(words.length);
  }, [documentContent]);

  // Auto-save timer
  useEffect(() => {
    if (!documentId || !documentContent) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [documentContent, documentId]);

  const handleAutoSave = async () => {
    if (!documentId) return;
    try {
      await autoSave(documentId, documentContent);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleContentChange = (content) => {
    setDocumentContent(content);
  };

  const handleNew = async () => {
    const title = prompt('Enter document title:', 'Untitled Document');
    if (!title) return;
    try {
      const newDoc = await createDocument(title, '');
      setDocumentId(newDoc.id);
      setDocumentTitle(newDoc.title);
      setDocumentContent('');
      
      // Focus the editor
      setTimeout(() => {
        const editor = document.querySelector('.editor');
        if (editor) editor.focus();
      }, 0);
      
      alert(`New document created!\nDocument ID: ${newDoc.id}\n(Save this ID to open your document later)`);
    } catch (error) {
      alert('Failed to create document');
    }
  };

  const handleOpen = async () => {
    const docId = prompt('Enter document ID to open:');
    if (!docId) return;
    try {
      const doc = await getDocument(docId);
      setDocumentId(doc.id);
      setDocumentTitle(doc.title);
      setDocumentContent(doc.content);
      alert('Document opened successfully!');
    } catch (error) {
      alert('Document not found');
    }
  };

  const handleSave = async () => {
    if (!documentId) {
      await handleNew();
      return;
    }
    setIsSaving(true);
    try {
      await updateDocument(documentId, { title: documentTitle, content: documentContent });
      setLastSaved(new Date().toLocaleTimeString());
      alert(`Document saved successfully!\nYour Document ID: ${documentId}\n(Keep this ID to open your document later)`);
    } catch (error) {
      alert('Failed to save document');
    }
    setIsSaving(false);
  };

  const handleExport = async (format) => {
    if (!documentId) {
      alert('Please save the document first');
      return;
    }
    try {
      let result;
      switch (format) {
        case 'pdf':
          result = await exportToPDF(documentId);
          break;
        case 'docx':
          result = await exportToDOCX(documentId);
          break;
        case 'html':
          result = await exportToHTML(documentId);
          break;
        default:
          return;
      }
      if (result.path) window.open(`http://localhost:8000${result.path}`, '_blank');
      alert(`Document exported as ${format.toUpperCase()}!`);
    } catch {
      alert('Export failed');
    }
  };

  const handlePrint = () => window.print();

  const handleUndo = () => document.execCommand('undo');
  const handleRedo = () => document.execCommand('redo');

  const handleInsertTable = () => {
    const event = new CustomEvent('insertTable');
    window.dispatchEvent(event);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const imgHTML = `<img src="${url}" style="max-width: 100%; height: auto;" alt="Inserted image" />`;
      document.execCommand('insertHTML', false, imgHTML);
    }
  };

  const handleInsertPageBreak = () => {
    const pageBreakHTML = `
      <div class="page-break-container" style="
        page-break-after: always;
        height: 20px;
        border-top: 3px dashed #0078d4;
        border-bottom: 3px dashed #0078d4;
        margin: 20px 0;
        position: relative;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          background: #0078d4;
          color: white;
          padding: 2px 10px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        ">Page Break</span>
      </div>
      <div style="page-break-before: always;"></div>
    `;
    document.execCommand('insertHTML', false, pageBreakHTML);
  };

  const handleSpellCheckCorrection = (correctedContent) => setDocumentContent(correctedContent);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'n':
            e.preventDefault();
            handleNew();
            break;
          case 'o':
            e.preventDefault();
            handleOpen();
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentId, documentContent, documentTitle]);

  return (
    <div className="App">
      <div className="app-header">
        <h1 className="app-title">Word Processor - {documentTitle}</h1>
        <div className="header-info">
          <span className="save-status">
            {isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved}` : 'Not saved'}
          </span>
          <div className="backend-status">
            Backend: <span className={backendStatus.includes('✓') ? 'status-ok' : 'status-error'}>
              {backendStatus}
            </span>
          </div>
        </div>
      </div>
      
      <MenuBar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onExport={handleExport}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onInsertTable={handleInsertTable}
        onInsertImage={handleInsertImage}
        onInsertPageBreak={handleInsertPageBreak}
      />
      
      <FormatToolbar />
      
      <div className="main-content">
        <div className="editor-section">
          <Editor content={documentContent} onChange={handleContentChange} />
        </div>
        {showSpellCheck && (
          <div className="sidebar">
            <SpellCheckPanel 
              content={documentContent} 
              onCorrection={handleSpellCheckCorrection} 
            />
          </div>
        )}
      </div>
      
      <StatusBar 
        wordCount={wordCount} 
        charCount={documentContent.replace(/<[^>]*>/g, '').length} 
        pageCount={pageCount} 
      />
      
      <button 
        className="spellcheck-toggle" 
        onClick={() => setShowSpellCheck(!showSpellCheck)} 
        title="Toggle Spell Check Panel"
      >
        {showSpellCheck ? '✕' : 'ABC'}
      </button>
    </div>
  );
}

export default App;
