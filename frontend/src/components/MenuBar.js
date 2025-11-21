import React, { useState } from 'react';
import './MenuBar.css';

function MenuBar({ 
  onNew, 
  onOpen, 
  onSave, 
  onExport, 
  onPrint,
  onUndo,
  onRedo,
  onInsertTable,
  onInsertImage,
  onInsertPageBreak
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const handleInsertImageFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgHTML = `<img src="${event.target.result}" style="max-width: 100%; height: auto;" alt="Uploaded image" />`;
          document.execCommand('insertHTML', false, imgHTML);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
    closeMenu();
  };

  const handleFindReplace = () => {
    const searchTerm = prompt('Find:');
    if (!searchTerm) return;
    
    const replaceTerm = prompt('Replace with:');
    if (replaceTerm === null) return;
    
    const editor = document.querySelector('.editor');
    if (!editor) return;
    
    let content = editor.innerHTML;
    const regex = new RegExp(searchTerm, 'gi');
    
    const replaceAll = window.confirm('Replace all occurrences? (OK = Yes, Cancel = First only)');

if (replaceAll) {
  // Replace all matches (global /g flag)
  const regexAll = new RegExp(searchTerm, 'gi');
  content = content.replace(regexAll, replaceTerm);
} else {
  // Replace only first instance (no /g flag)
  const regexFirst = new RegExp(searchTerm, 'i');
  content = content.replace(regexFirst, replaceTerm);
}

editor.innerHTML = content;

    closeMenu();
  };

  const handleTemplate = (templateType) => {
    const editor = document.querySelector('.editor');
    if (!editor) return;
    
    let templateContent = '';
    
    switch(templateType) {
      case 'blank':
        templateContent = '';
        break;
      case 'business':
        templateContent = `
          <div style="margin-top: 2in;">
            <p><strong>[Your Name]</strong></p>
            <p>[Your Address]</p>
            <p>[City, State ZIP]</p>
            <br/>
            <p>[Date]</p>
            <br/>
            <p>[Recipient Name]</p>
            <p>[Company]</p>
            <p>[Address]</p>
            <br/>
            <p>Dear [Recipient Name],</p>
            <br/>
            <p>[Letter body]</p>
            <br/>
            <p>Sincerely,</p>
            <p>[Your Name]</p>
          </div>
        `;
        break;
      case 'resume':
        templateContent = `
          <div style="text-align: center;">
            <h1 style="margin-bottom: 0;">[YOUR NAME]</h1>
            <p>[Email] | [Phone] | [LinkedIn]</p>
          </div>
          <hr/>
          <h2>EXPERIENCE</h2>
          <p><strong>[Job Title]</strong> - [Company] ([Date Range])</p>
          <ul>
            <li>[Achievement/Responsibility]</li>
          </ul>
          <h2>EDUCATION</h2>
          <p><strong>[Degree]</strong> - [University] ([Year])</p>
          <h2>SKILLS</h2>
          <p>[Skill 1], [Skill 2], [Skill 3]</p>
        `;
        break;
      case 'report':
        templateContent = `
          <div style="text-align: center;">
            <h1>[REPORT TITLE]</h1>
            <p>Prepared by: [Your Name]</p>
            <p>Date: [Date]</p>
          </div>
          <br/><br/>
          <h2>Executive Summary</h2>
          <p>[Summary content]</p>
          <h2>Introduction</h2>
          <p>[Introduction content]</p>
          <h2>Findings</h2>
          <p>[Findings content]</p>
          <h2>Conclusion</h2>
          <p>[Conclusion content]</p>
        `;
        break;
      default:
        templateContent = '';
    }
    
    editor.innerHTML = templateContent;
    closeMenu();
  };

  return (
    <div className="menu-bar">
      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('file')}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div className="dropdown-menu">
            <button onClick={() => { onNew(); closeMenu(); }}>
              New <span className="shortcut">Ctrl+N</span>
            </button>
            <button onClick={() => { onOpen(); closeMenu(); }}>
              Open <span className="shortcut">Ctrl+O</span>
            </button>
            <button onClick={() => { onSave(); closeMenu(); }}>
              Save <span className="shortcut">Ctrl+S</span>
            </button>
            <button onClick={() => { onSave(); closeMenu(); }}>
              Save As...
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { onPrint(); closeMenu(); }}>
              Print <span className="shortcut">Ctrl+P</span>
            </button>
            <button onClick={() => { onExport('pdf'); closeMenu(); }}>
              Export as PDF
            </button>
            <button onClick={() => { onExport('docx'); closeMenu(); }}>
              Export as DOCX
            </button>
            <button onClick={() => { onExport('html'); closeMenu(); }}>
              Export as HTML
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('templates')}
        >
          Templates
        </button>
        {activeMenu === 'templates' && (
          <div className="dropdown-menu">
            <button onClick={() => { handleTemplate('blank'); }}>
              Blank Document
            </button>
            <button onClick={() => { handleTemplate('business'); }}>
              Business Letter
            </button>
            <button onClick={() => { handleTemplate('resume'); }}>
              Resume
            </button>
            <button onClick={() => { handleTemplate('report'); }}>
              Report
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('edit')}
        >
          Edit
        </button>
        {activeMenu === 'edit' && (
          <div className="dropdown-menu">
            <button onClick={() => { onUndo(); closeMenu(); }}>
              Undo <span className="shortcut">Ctrl+Z</span>
            </button>
            <button onClick={() => { onRedo(); closeMenu(); }}>
              Redo <span className="shortcut">Ctrl+Y</span>
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { document.execCommand('cut'); closeMenu(); }}>
              Cut <span className="shortcut">Ctrl+X</span>
            </button>
            <button onClick={() => { document.execCommand('copy'); closeMenu(); }}>
              Copy <span className="shortcut">Ctrl+C</span>
            </button>
            <button onClick={() => { document.execCommand('paste'); closeMenu(); }}>
              Paste <span className="shortcut">Ctrl+V</span>
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { document.execCommand('selectAll'); closeMenu(); }}>
              Select All <span className="shortcut">Ctrl+A</span>
            </button>
            <button onClick={handleFindReplace}>
              Find & Replace <span className="shortcut">Ctrl+F</span>
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('insert')}
        >
          Insert
        </button>
        {activeMenu === 'insert' && (
          <div className="dropdown-menu">
            <button onClick={() => { onInsertTable(); closeMenu(); }}>
              Table
            </button>
            <button onClick={() => { onInsertImage(); closeMenu(); }}>
              Image (URL)
            </button>
            <button onClick={handleInsertImageFile}>
              Upload Image
            </button>
            <button onClick={() => { onInsertPageBreak(); closeMenu(); }}>
              Page Break
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { document.execCommand('createLink'); closeMenu(); }}>
              Hyperlink
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('format')}
        >
          Format
        </button>
        {activeMenu === 'format' && (
          <div className="dropdown-menu">
            <button onClick={() => { document.execCommand('bold'); closeMenu(); }}>
              Bold <span className="shortcut">Ctrl+B</span>
            </button>
            <button onClick={() => { document.execCommand('italic'); closeMenu(); }}>
              Italic <span className="shortcut">Ctrl+I</span>
            </button>
            <button onClick={() => { document.execCommand('underline'); closeMenu(); }}>
              Underline <span className="shortcut">Ctrl+U</span>
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { document.execCommand('insertUnorderedList'); closeMenu(); }}>
              Bullet List
            </button>
            <button onClick={() => { document.execCommand('insertOrderedList'); closeMenu(); }}>
              Numbered List
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { document.execCommand('justifyLeft'); closeMenu(); }}>
              Align Left
            </button>
            <button onClick={() => { document.execCommand('justifyCenter'); closeMenu(); }}>
              Align Center
            </button>
            <button onClick={() => { document.execCommand('justifyRight'); closeMenu(); }}>
              Align Right
            </button>
            <button onClick={() => { document.execCommand('justifyFull'); closeMenu(); }}>
              Justify
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('tools')}
        >
          Tools
        </button>
        {activeMenu === 'tools' && (
          <div className="dropdown-menu">
            <button onClick={() => { closeMenu(); }}>
              Spelling & Grammar
            </button>
            <button onClick={() => { closeMenu(); }}>
              Word Count
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => { 
              alert('Track Changes feature - This will be connected to TrackChangesPanel in a future update');
              closeMenu(); 
            }}>
              Track Changes
            </button>
            <button onClick={() => { 
              alert('Comments feature - Coming soon');
              closeMenu(); 
            }}>
              Comments
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          className="menu-button" 
          onClick={() => toggleMenu('help')}
        >
          Help
        </button>
        {activeMenu === 'help' && (
          <div className="dropdown-menu">
            <button onClick={() => {
              alert('Word Processor v1.0\n\nA modern word processing application with rich text editing, spell checking, and document management features.');
              closeMenu();
            }}>
              Documentation
            </button>
            <button onClick={() => {
              alert('Keyboard Shortcuts:\n\nCtrl+N - New Document\nCtrl+O - Open Document\nCtrl+S - Save Document\nCtrl+P - Print\nCtrl+Z - Undo\nCtrl+Y - Redo\nCtrl+B - Bold\nCtrl+I - Italic\nCtrl+U - Underline');
              closeMenu();
            }}>
              Keyboard Shortcuts
            </button>
            <div className="menu-divider"></div>
            <button onClick={() => {
              alert('Word Processor v1.0\n\nDeveloped for CS 80/82/110/104\n© 2025');
              closeMenu();
            }}>
              About
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuBar;
