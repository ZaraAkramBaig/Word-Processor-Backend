import React, { useRef, useEffect, useState } from 'react';
import './Editor.css';

const PAGE_HEIGHT = 1056; // 11in at 96dpi

function Editor({ content, onChange }) {
  const editorRef = useRef(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [pageCount, setPageCount] = useState(1);
  const hasInitialized = useRef(false);

  // Only set innerHTML once per doc load
  useEffect(() => {
    if (editorRef.current && !hasInitialized.current) {
      editorRef.current.innerHTML = content || '';
      hasInitialized.current = true;
      updatePageCount();
      enforceImageStyles(editorRef.current);
    }
  }, [content]);

  // Table Insert
  const insertTable = () => {
    let tableHTML = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin: 10px 0;">';
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
    setTimeout(() => enforceImageStyles(editorRef.current), 50);
  };

  // Menu insert table event
  useEffect(() => {
    const handleInsertTableEvent = () => setShowTableDialog(true);
    window.addEventListener('insertTable', handleInsertTableEvent);
    return () => window.removeEventListener('insertTable', handleInsertTableEvent);
  }, []);

  // Ensure images fit/margin after any change
  function enforceImageStyles(editor) {
    if (!editor) return;
    const imgs = editor.querySelectorAll('img');
    imgs.forEach(img => {
      img.classList.add('resizable-img');
      img.style.maxWidth = "720px";
      img.style.minWidth = "32px";
      img.style.minHeight = "32px";
      img.style.maxHeight = "880px";
      img.style.display = "block";
      img.style.margin = "10px auto";
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.height = img.style.height || "auto";
      img.setAttribute('tabindex', 0);
    });
  }

  // Proper coloring + highlight logic (custom because execCommand 'foreColor' is flaky)
  // Expose for FormatToolbar: window.applyTextColor/color, window.applyHighlight
  useEffect(() => {
    window.applyTextColor = color => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      const span = document.createElement('span');
      span.style.color = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      selection.addRange(range);
      enforceImageStyles(editorRef.current);
      onChange(editorRef.current.innerHTML);
    };
    window.applyHighlight = color => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      selection.addRange(range);
      enforceImageStyles(editorRef.current);
      onChange(editorRef.current.innerHTML);
    };
  }, [onChange]);

  // Headings H1/H2/H3 using execCommand (toolbar sends e.g. document.execCommand('formatBlock', false, 'h1'))
  // You must use <button onClick={()=>document.execCommand('formatBlock',false,'h1')}>H1</button> in your FormatToolbar

  // Font size: execCommand('fontSize', ...)
  // Page count
  const updatePageCount = () => {
    if (editorRef.current) {
      const h = editorRef.current.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(h / PAGE_HEIGHT)));
    }
  };

  // Always re-enforce img/table styles and update parent
  const handleInput = e => {
    enforceImageStyles(e.currentTarget);
    onChange(e.currentTarget.innerHTML);
    updatePageCount();
  };

  // On paste: enforce margin/size on images/tables
  useEffect(() => {
    const editor = editorRef.current;
    const handlePaste = () => setTimeout(() => enforceImageStyles(editor), 0);
    editor && editor.addEventListener('paste', handlePaste);
    return () => editor && editor.removeEventListener('paste', handlePaste);
  }, []);
  useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  function handleImageClick(e) {
    if (e.target.tagName === 'IMG') {
      // Remove 'selected' from others
      editor.querySelectorAll('img.selected').forEach(img => img.classList.remove('selected'));
      e.target.classList.add('selected');
    } else {
      editor.querySelectorAll('img.selected').forEach(img => img.classList.remove('selected'));
    }
  }

  editor.addEventListener('click', handleImageClick);
  return () => editor.removeEventListener('click', handleImageClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const editor = editorRef.current;
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        document.execCommand('bold');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        document.execCommand('italic');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        document.execCommand('underline');
      }
    };
    editor && editor.addEventListener('keydown', handler);
    return () => editor && editor.removeEventListener('keydown', handler);
  }, []);

  // Visual page overlays and numbers
  // Add this function back (before the return statement)
  const renderPageOverlays = () => {
    const overlays = [];
    for (let i = 0; i < pageCount; i++) {
      overlays.push(
        <div
          key={i}
          className="editor-page-bg"
          style={{
            position: 'absolute',
            top: `${i * PAGE_HEIGHT}px`,
            left: 0,
            width: '100%',
            height: PAGE_HEIGHT,
            background: '#fff',
            border: '1px solid #ddd',
            zIndex: 0,
            boxSizing: 'border-box',
            pointerEvents: 'none'
          }}
        >
          <div
            className="page-number-overlay"
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#aaa',
              fontSize: 16,
              pointerEvents: 'none'
            }}
          >
            Page {i + 1}
          </div>
        </div>
      );
    }
    return overlays;
  };


  return (
    <div className="editor-wrapper">
      <div className="page-container" style={{ position: 'relative', minHeight: PAGE_HEIGHT }}>
        {renderPageOverlays()}
        <div
          ref={editorRef}
          className="editor"
          contentEditable={true}
          spellCheck={true}
          onInput={handleInput}
          suppressContentEditableWarning={true}
          style={{
            minHeight: PAGE_HEIGHT * pageCount,
            background: 'transparent',
            position: 'relative',
            zIndex: 1,
            outline: 'none'
          }}
        />
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
                onChange={e => setTableRows(parseInt(e.target.value))}
              />
            </div>
            <div className="dialog-row">
              <label>Columns:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={e => setTableCols(parseInt(e.target.value))}
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








