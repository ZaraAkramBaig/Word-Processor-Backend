import React, { useState } from 'react';
import './FormatToolbar.css';

function FormatToolbar() {
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Calibri');

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    const editor = document.querySelector('.editor');
    if (editor) {
      editor.focus();
    }
  };

  const applyHeading = (level) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    const isHeading = /^H[1-6]$/.test(parentElement.tagName);
    
    if (isHeading) {
      // Remove heading - convert back to paragraph
      const p = document.createElement('p');
      p.innerHTML = parentElement.innerHTML;
      parentElement.parentNode.replaceChild(p, parentElement);
    } else {
      // Get selected text
      let text = selection.toString() || parentElement.textContent;
      
      // Apply capitalization based on heading level
      if (level === 1) {
        text = text.toUpperCase(); // H1: ALL CAPS
      } else if (level === 2) {
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); // H2: First letter
      }
      
      // Create heading element
      const heading = document.createElement(`h${level}`);
      heading.textContent = text;
      
      // Replace selection
      range.deleteContents();
      range.insertNode(heading);
    }

    const editor = document.querySelector('.editor');
    if (editor) editor.focus();
  };


  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    setFontSize(size);
    applyFormat('fontSize', size);

    // Apply font size using proper method
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      document.execCommand('fontSize', false, '7'); // Use a dummy size
      const fontElements = document.querySelectorAll('font[size]');
      fontElements.forEach(el => {
        el.removeAttribute('size');
        el.style.fontSize = size;
      });
    }
    
    const editor = document.querySelector('.editor');
    if (editor) editor.focus();
  };

  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    setFontFamily(font);
    applyFormat('fontName', font);
  };

  return (
    <div className="format-toolbar">
      <div className="toolbar-group">
        <select 
          className="font-family-select"
          value={fontFamily}
          onChange={handleFontFamilyChange}
        >
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>

        <select 
          className="font-size-select"
          value={fontSize}
          onChange={handleFontSizeChange}
        >
          <option value="8px">8</option>
          <option value="10px">10</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
          <option value="36px">36</option>
          <option value="48px">48</option>
        </select>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('bold');
          }}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('italic');
          }}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('underline');
          }}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('strikeThrough');
          }}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
      </div>
      {/* mmmmmm */}
      
      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '9px', marginBottom: '2px' }}>Text</label>
          <input 
            type="color"
            className="color-picker"
            onChange={(e) => applyFormat('foreColor', e.target.value)}
            onMouseDown={(e) => e.preventDefault()}
            title="Text Color"
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '9px', marginBottom: '2px' }}>Highlight</label>
          <input 
            type="color"
            className="color-picker"
            onChange={(e) => applyFormat('hiliteColor', e.target.value)}
            onMouseDown={(e) => e.preventDefault()}
            title="Highlight Color"
          />
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyLeft');
          }}
          title="Align Left"
        >
          ☰
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyCenter');
          }}
          title="Align Center"
        >
          ☰
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyRight');
          }}
          title="Align Right"
        >
          ☰
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('justifyFull');
          }}
          title="Justify"
        >
          ☰
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertUnorderedList');
          }}
          title="Bullet List"
        >
          • List
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertOrderedList');
          }}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('indent');
          }}
          title="Increase Indent"
        >
          →
        </button>
        <button 
          className="toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('outdent');
          }}
          title="Decrease Indent"
        >
          ←
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn toolbar-heading"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading(1);
          }}
          title="Heading 1 (32pt)"
        >
          H1
        </button>
        <button 
          className="toolbar-btn toolbar-heading"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading(2);
          }}
          title="Heading 2 (24pt)"
        >
          H2
        </button>
        <button 
          className="toolbar-btn toolbar-heading"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading(3);
          }}
          title="Heading 3 (18pt)"
        >
          H3
        </button>
      </div>
    </div>
  );
}

export default FormatToolbar;
