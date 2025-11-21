import React, { useState } from 'react';
import './SpellCheckPanel.css';
import { spellCheck, grammarCheck } from '../api/apiClient';

function SpellCheckPanel({ content, onCorrection }) {
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('spelling');

  const checkSpelling = async () => {
    setIsChecking(true);
    try {
      const result = await spellCheck(content);
      setErrors(result.errors || []);
      setSuggestions(result.suggestions || {});
      // Highlight errors in the editor
      if (result.errors && result.errors.length > 0) {
        const editor = document.querySelector('.editor');
        if (editor) {
          let highlightedContent = editor.innerHTML;
          result.errors.forEach(error => {
            const regex = new RegExp(`\\b${error.word}\\b`, 'gi');
            highlightedContent = highlightedContent.replace(
              regex,
              `<mark class="spelling-error" data-word="${error.word}" style="background-color: #ff6b6b; color: white; padding: 2px 4px; border-radius: 3px; cursor: pointer;">$&</mark>`
            );
          });
          editor.innerHTML = highlightedContent;
        }
      }
    } catch (error) {
      console.error('Spell check failed:', error);
    }
    setIsChecking(false);
  };

  const checkGrammar = async () => {
    setIsChecking(true);
    try {
      const result = await grammarCheck(content);
      setGrammarErrors(result.errors || []);
    } catch (error) {
      console.error('Grammar check failed:', error);
    }
    setIsChecking(false);
  };

  const highlightErrorInEditor = (error) => {
    const editor = document.querySelector('.editor');
    if (!editor) return;
    const marks = editor.querySelectorAll('.spelling-error');
    for (let mark of marks) {
      if (mark.textContent.toLowerCase() === error.word.toLowerCase()) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mark.style.backgroundColor = '#ff3838';
        setTimeout(() => {
          mark.style.backgroundColor = '#ff6b6b';
        }, 500);
        break;
      }
    }
  };

  const applySuggestion = (error, suggestion) => {
    const editor = document.querySelector('.editor');
    if (!editor) return;

    let editorContent = editor.innerHTML;
    // Remove the mark tag and replace the word (all occurrences on page)
    const regex = new RegExp(
      `<mark class="spelling-error"[^>]*>${error.word}</mark>`,
      'gi'
    );
    editorContent = editorContent.replace(regex, suggestion);

    editor.innerHTML = editorContent;
    onCorrection(editor.innerHTML); // Sync to App.js

    setErrors(errors.filter(e => e.word !== error.word));
    setTimeout(checkSpelling, 100); // Optionally rerun spelling
  };

  const ignoreError = (error) => {
    const editor = document.querySelector('.editor');
    if (editor) {
      const marks = editor.querySelectorAll('.spelling-error');
      marks.forEach(mark => {
        if (mark.textContent.toLowerCase() === error.word.toLowerCase()) {
          const text = mark.textContent;
          mark.replaceWith(text);
        }
      });
    }
    setErrors(errors.filter(e => e.word !== error.word));
    onCorrection(editor.innerHTML);
    setTimeout(checkSpelling, 100);
  };

  const ignoreAllErrors = (word) => {
    const editor = document.querySelector('.editor');
    if (editor) {
      const marks = editor.querySelectorAll('.spelling-error');
      marks.forEach(mark => {
        if (mark.textContent.toLowerCase() === word.toLowerCase()) {
          const text = mark.textContent;
          mark.replaceWith(text);
        }
      });
    }
    setErrors(errors.filter(e => e.word !== word));
    onCorrection(editor.innerHTML);
    setTimeout(checkSpelling, 100);
  };

  return (
    <div className="spellcheck-panel">
      <div className="panel-header">
        <h3>Spelling & Grammar</h3>
        <button className="close-btn" onClick={() => {}}>×</button>
      </div>

      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'spelling' ? 'active' : ''}`}
          onClick={() => setActiveTab('spelling')}
        >
          Spelling
        </button>
        <button
          className={`tab ${activeTab === 'grammar' ? 'active' : ''}`}
          onClick={() => setActiveTab('grammar')}
        >
          Grammar
        </button>
      </div>

      <div className="panel-actions">
        {activeTab === 'spelling' ? (
          <button
            className="check-btn"
            onClick={checkSpelling}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Spelling'}
          </button>
        ) : (
          <button
            className="check-btn"
            onClick={checkGrammar}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Grammar'}
          </button>
        )}
      </div>

      <div className="panel-content">
        {activeTab === 'spelling' && (
          <div className="errors-list">
            {errors.length === 0 ? (
              <p className="no-errors">No spelling errors found!</p>
            ) : (
              errors.map((error, index) => (
                <div key={index} className="error-item">
                  <div className="error-word">
                    <span className="misspelled">{error.word}</span>
                    <span className="error-position">
                      Page {error.page || 1} • Position: {error.position}
                    </span>
                  </div>
                  {suggestions[error.word] && suggestions[error.word].length > 0 && (
                    <div className="suggestions">
                      <p className="suggestions-label">Suggestions:</p>
                      {suggestions[error.word].map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn"
                          onClick={() => applySuggestion(error, suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="error-actions">
                    <button
                      className="action-btn locate"
                      onClick={() => highlightErrorInEditor(error)}
                      title="Locate in document"
                    >
                      📍 Locate
                    </button>
                    <button
                      className="action-btn ignore"
                      onClick={() => ignoreError(error)}
                    >
                      Ignore
                    </button>
                    <button
                      className="action-btn ignore-all"
                      onClick={() => ignoreAllErrors(error.word)}
                    >
                      Ignore All
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="errors-list">
            {grammarErrors.length === 0 ? (
              <p className="no-errors">No grammar errors found!</p>
            ) : (
              grammarErrors.map((error, index) => (
                <div key={index} className="error-item">
                  <div className="error-type">
                    <span className="error-badge">{error.type}</span>
                  </div>
                  <p className="error-message">{error.message}</p>
                  <p className="error-position">
                    Page {error.page || 1} • Position: {error.position}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpellCheckPanel;




// import React, { useState, useEffect } from 'react';
// import './SpellCheckPanel.css';
// import { spellCheck, grammarCheck } from '../api/apiClient';

// function SpellCheckPanel({ content, onCorrection }) {
//   const [errors, setErrors] = useState([]);
//   const [suggestions, setSuggestions] = useState({});
//   const [grammarErrors, setGrammarErrors] = useState([]);
//   const [isChecking, setIsChecking] = useState(false);
//   const [activeTab, setActiveTab] = useState('spelling');

//   const checkSpelling = async () => {
//     setIsChecking(true);
//     try {
//       const result = await spellCheck(content);
//       setErrors(result.errors || []);
//       setSuggestions(result.suggestions || {});
//     } catch (error) {
//       console.error('Spell check failed:', error);
//     }
//     setIsChecking(false);
//   };

//   const checkGrammar = async () => {
//     setIsChecking(true);
//     try {
//       const result = await grammarCheck(content);
//       setGrammarErrors(result.errors || []);
//     } catch (error) {
//       console.error('Grammar check failed:', error);
//     }
//     setIsChecking(false);
//   };

//   const applySuggestion = (error, suggestion) => {
//     // Replace the error word with suggestion
//     const newContent = content.replace(error.word, suggestion);
//     onCorrection(newContent);
    
//     // Remove this error from the list
//     setErrors(errors.filter(e => e !== error));
//   };

//   const ignoreError = (error) => {
//     setErrors(errors.filter(e => e !== error));
//   };

//   const ignoreAllErrors = (word) => {
//     setErrors(errors.filter(e => e.word !== word));
//   };

//   return (
//     <div className="spellcheck-panel">
//       <div className="panel-header">
//         <h3>Spelling & Grammar</h3>
//         <button className="close-btn" onClick={() => {}}>×</button>
//       </div>

//       <div className="panel-tabs">
//         <button 
//           className={`tab ${activeTab === 'spelling' ? 'active' : ''}`}
//           onClick={() => setActiveTab('spelling')}
//         >
//           Spelling
//         </button>
//         <button 
//           className={`tab ${activeTab === 'grammar' ? 'active' : ''}`}
//           onClick={() => setActiveTab('grammar')}
//         >
//           Grammar
//         </button>
//       </div>

//       <div className="panel-actions">
//         {activeTab === 'spelling' ? (
//           <button 
//             className="check-btn"
//             onClick={checkSpelling}
//             disabled={isChecking}
//           >
//             {isChecking ? 'Checking...' : 'Check Spelling'}
//           </button>
//         ) : (
//           <button 
//             className="check-btn"
//             onClick={checkGrammar}
//             disabled={isChecking}
//           >
//             {isChecking ? 'Checking...' : 'Check Grammar'}
//           </button>
//         )}
//       </div>

//       <div className="panel-content">
//         {activeTab === 'spelling' && (
//           <div className="errors-list">
//             {errors.length === 0 ? (
//               <p className="no-errors">No spelling errors found!</p>
//             ) : (
//               errors.map((error, index) => (
//                 <div key={index} className="error-item">
//                   <div className="error-word">
//                     <span className="misspelled">{error.word}</span>
//                     <span className="error-position">
//                       Page {Math.ceil(error.position / 3000)} • Position: {error.position}
//                     </span>
//                   </div>
                  
//                   {suggestions[error.word] && suggestions[error.word].length > 0 && (
//                     <div className="suggestions">
//                       <p className="suggestions-label">Suggestions:</p>
//                       {suggestions[error.word].map((suggestion, idx) => (
//                         <button
//                           key={idx}
//                           className="suggestion-btn"
//                           onClick={() => applySuggestion(error, suggestion)}
//                         >
//                           {suggestion}
//                         </button>
//                       ))}
//                     </div>
//                   )}
                  
//                   <div className="error-actions">
//                     <button 
//                       className="action-btn ignore"
//                       onClick={() => ignoreError(error)}
//                     >
//                       Ignore
//                     </button>
//                     <button 
//                       className="action-btn ignore-all"
//                       onClick={() => ignoreAllErrors(error.word)}
//                     >
//                       Ignore All
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}


//         {activeTab === 'grammar' && (
//           <div className="errors-list">
//             {grammarErrors.length === 0 ? (
//               <p className="no-errors">No grammar errors found!</p>
//             ) : (
//               grammarErrors.map((error, index) => (
//                 <div key={index} className="error-item">
//                   <div className="error-type">
//                     <span className="error-badge">{error.type}</span>
//                   </div>
//                   <p className="error-message">{error.message}</p>
//                   <p className="error-position">Position: {error.position}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default SpellCheckPanel;

