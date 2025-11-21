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

    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      // If text is selected
      if (!range.collapsed) {
        // Create span and apply font size
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.appendChild(range.extractContents());
        range.insertNode(span);

        // Move cursor after applied span
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no text selected, set font size for future input
        const editor = document.querySelector('.editor');
        if (editor.contains(selection.anchorNode)) {
          // Insert an empty span as cursor marker
          const marker = document.createElement('span');
          marker.style.fontSize = size;
          marker.innerHTML = "\u200B"; // zero-width space
          range.insertNode(marker);

          // Move cursor inside marker
          range.setStart(marker, 1);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    // Refocus the editor
    const editor = document.querySelector('.editor');
    if (editor) editor.focus();
  };

  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    setFontFamily(font);
    applyFormat('fontName', font);
  };

  // ---- ADDED TEXT COLOR HANDLER ----
  const handleTextColorChange = (e) => {
    const color = e.target.value;
    const selection = window.getSelection();

    if (selection && selection.rangeCount && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      // Wrap selected text in a span with style
      const span = document.createElement('span');
      span.style.color = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);

      // Reselect the new span for user experience
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // For future text, insert a styled span at cursor
      const editor = document.querySelector('.editor');
      if (editor && selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const marker = document.createElement('span');
        marker.style.color = color;
        marker.innerHTML = "\u200B";
        range.insertNode(marker);

        // Move cursor inside marker
        range.setStart(marker, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    const editor = document.querySelector('.editor');
    if (editor) editor.focus();
  };

  // ---- ADDED HIGHLIGHT HANDLER ----
  const handleHighlightChange = (e) => {
    const color = e.target.value;
    const selection = window.getSelection();

    if (selection && selection.rangeCount && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      // Wrap selected text in a span with highlight style
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);

      // Reselect the new span for user experience
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // For future text, insert a styled span at cursor
      const editor = document.querySelector('.editor');
      if (editor && selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const marker = document.createElement('span');
        marker.style.backgroundColor = color;
        marker.innerHTML = "\u200B";
        range.insertNode(marker);

        // Move cursor inside marker
        range.setStart(marker, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    const editor = document.querySelector('.editor');
    if (editor) editor.focus();
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

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '9px', marginBottom: '2px' }}>Text</label>
          <input
            type="color"
            className="color-picker"
            onChange={handleTextColorChange}
            onMouseDown={(e) => e.preventDefault()}
            title="Text Color"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '9px', marginBottom: '2px' }}>Highlight</label>
          <input
            type="color"
            className="color-picker"
            onChange={handleHighlightChange}
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



