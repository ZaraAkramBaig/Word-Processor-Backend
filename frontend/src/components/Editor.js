import React, { useRef, useEffect, useState } from 'react';
import './Editor.css';

function Editor({ content, onChange }) {
  const editorRef = useRef(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold');
      }
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic');
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline');
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  // Listen for table insert event from MenuBar
  useEffect(() => {
    const handleInsertTableEvent = () => {
      setShowTableDialog(true);
    };
    
    window.addEventListener('insertTable', handleInsertTableEvent);
    return () => window.removeEventListener('insertTable', handleInsertTableEvent);
  }, []);

  // Calculate page count based on content height
  useEffect(() => {
    const calculatePages = () => {
      const editor = editorRef.current;
      if (!editor) return;

      // Page height in pixels (11 inches at 96 DPI = 1056px)
      // Minus 2 inches for margins (top 1" + bottom 1") = 864px usable height
      const pageHeight = 864;
      const contentHeight = editor.scrollHeight;
      const calculatedPages = Math.ceil(contentHeight / pageHeight);
      
      if (calculatedPages !== pageCount) {
        setPageCount(calculatedPages);
      }
    };

    // Recalculate after content changes
    const timer = setTimeout(calculatePages, 100);
    return () => clearTimeout(timer);
  }, [content, pageCount]);

  const handleInput = (e) => {
    onChange(e.target.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const insertTable = () => {
    let tableHTML = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += '<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    
    document.execCommand('insertHTML', false, tableHTML);
    setShowTableDialog(false);
  };

  // Generate page dividers
  const renderPageDividers = () => {
    const dividers = [];
    // Page height: 11 inches at 96 DPI = 1056px
    const pageHeight = 1056;
    
    for (let i = 1; i < pageCount; i++) {
      dividers.push(
        <div 
          key={i}
          className="page-divider"
          style={{ top: `${i * pageHeight}px` }}
        >
          <span className="page-number">Page {i + 1}</span>
        </div>
      );
    }
    
    return dividers;
  };

  return (
    <div className="editor-wrapper">
      <div className="page-container">
        <div
          ref={editorRef}
          className="editor"
          contentEditable={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          spellCheck={false}
        >
          {/* Start typing here... */}
        </div>
        {renderPageDividers()}
      </div>

      {showTableDialog && (
        <div className="table-dialog">
          <div className="dialog-content">
            <h3>Insert Table</h3>
            <div className="dialog-row">
              <label>Rows:</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value))}
              />
            </div>
            <div className="dialog-row">
              <label>Columns:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value))}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={insertTable}>Insert</button>
              <button onClick={() => setShowTableDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;
