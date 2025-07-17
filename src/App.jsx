import React, { useState, useEffect, useRef } from 'react';
// The CSS is in a separate immersive block named 'script-app-css'.
import './script-app-css.css';

// --- Initial Data Model for Sentence Bank ---
const initialSentenceBank = [
  {
    id: 's1',
    text: 'Ariana independently worked [PERCENTAGE]% of the time during the session. Staff gave verbal praise to reinforce the desired behavior.',
  },
  {
    id: 's2',
    text: 'Ariana independently completed tasks for [PERCENTAGE]% of the session. Staff used verbal prompting to remind her of expectations.',
  },
  {
    id: 's3',
    text: 'During the activity, Ariana engaged for approximately [PERCENTAGE]% of the time. Staff modeled appropriate responses.',
  },
  {
    id: 's4',
    text: 'Ariana demonstrated sustained attention for [PERCENTAGE]% of the session. Staff provided positive reinforcement.',
  },
  {
    id: 's5',
    text: 'Task completion was observed [PERCENTAGE]% of the time. Staff redirected Ariana to task as needed.',
  },
  {
    id: 's6',
    text: 'The student remained on task for [PERCENTAGE]% of the period, requiring minimal prompts.',
  },
  {
    id: 's7',
    text: 'Compliance with instructions was noted at [PERCENTAGE]% during the group activity.',
  },
  {
    id: 's8',
    text: 'Peer interaction occurred for [PERCENTAGE]% of the free play play time, showing good social skills.',
  },
  {
    id: 's9',
    text: 'Independent work completion reached [PERCENTAGE]% today, a significant improvement.',
  },
  {
    id: 's10',
    text: 'Ariana followed classroom rules [PERCENTAGE]% of the time, responding well to reminders.',
  },
  {
    id: 's11', // Example of a sentence without percentage
    text: 'The student showed great enthusiasm during the art session.',
  },
  {
    id: 's12', // Another example without percentage
    text: 'Staff provided one-on-one support as needed throughout the morning.',
  },
];

// --- Predefined Session Context Options ---
const sessionContextOptions = {
  oneToOne: "The 1:1 ABA direct therapy session had the following present: the client (Ariana 7 year-old-female), mom, sister, and RBT (Steven Cobleigh). RBT met with client at the client's house.",
  withSupervision: "The ABA therapy session, with supervision, had the following present: the client (Ariana 7 year-old-female), mom, sister, uncle, RBT (Steven Cobleigh), and BCBA (Jennifer Smith). RBT met with client at the client's house."
};


// --- Custom Modal Component (for messages and confirmations) ---
const CustomModal = ({ message, onClose, onConfirm, showConfirmButton = false, confirmButtonText = "Confirm" }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {confirmButtonText}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component for the "Manage Sentences" View ---
const ManageSentencesView = ({ sentenceBank, onAddSentence, onDeleteSentence, onGoBack }) => {
  const [newSentenceText, setNewSentenceText] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  const [sentenceToDelete, setSentenceToDelete] = useState(null); // State to hold sentence ID for confirmation
  const [showPunctuationWarningModal, setShowPunctuationWarningModal] = useState(false); // New state for punctuation warning
  const textareaRef = useRef(null); // Ref for the textarea

  const handleAddClick = () => {
    if (newSentenceText.trim()) {
      // Check for ending punctuation
      const lastChar = newSentenceText.trim().slice(-1);
      if (!['.', '!', '?'].includes(lastChar)) {
        setShowPunctuationWarningModal(true);
      } else {
        onAddSentence(newSentenceText.trim());
        setNewSentenceText('');
      }
    } else {
      setModalMessage('Please enter a sentence.');
    }
  };

  const handleConfirmAddWithoutPunctuation = () => {
    onAddSentence(newSentenceText.trim());
    setNewSentenceText('');
    setShowPunctuationWarningModal(false); // Close the warning modal
  };

  const handleDeleteClick = (sentenceId) => {
    setSentenceToDelete(sentenceId); // Set the sentence to be deleted
    setModalMessage('Are you sure you want to delete this sentence? This action cannot be undone.');
  };

  const confirmDelete = () => {
    if (sentenceToDelete) {
      onDeleteSentence(sentenceToDelete);
      setSentenceToDelete(null); // Clear the sentence to delete
      setModalMessage(null); // Close the modal
    }
  };

  // Handler for auto-completing [PERCENTAGE]
  const handleSentenceTextChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Check if the last character typed is '['
    if (value.charAt(cursorPosition - 1) === '[' && !value.substring(cursorPosition - 1).startsWith('[PERCENTAGE]')) {
      const newValue = value.substring(0, cursorPosition) + 'PERCENTAGE]' + value.substring(cursorPosition);
      setNewSentenceText(newValue);

      // Set cursor position right after 'PERCENTAGE]'
      // Use setTimeout to ensure state update has rendered before setting selection
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPosition + 'PERCENTAGE]'.length;
          textareaRef.current.selectionEnd = cursorPosition + 'PERCENTAGE]'.length;
        }
      }, 0);
    } else {
      setNewSentenceText(value);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manage Sentence Templates</h2>

      {/* Add New Sentence Section */}
      <div className="w-full mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Add New Sentence</h3>
        <p className="text-gray-600 mb-4 text-center">
          Type your sentence below. You can use <code className="bg-gray-100 p-1 rounded font-mono text-sm">[PERCENTAGE]</code> where a number should go (e.g., "Student was focused <code className="bg-100 p-1 rounded font-mono text-sm">[PERCENTAGE]</code>% of the time"). If not used, the sentence will be static.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[120px] text-gray-800"
          value={newSentenceText}
          onChange={handleSentenceTextChange}
          placeholder="e.g., John independently worked for [PERCENTAGE]% of the session. OR The student enjoyed the activity."
          rows="5"
          ref={textareaRef}
        ></textarea>
        <button
          onClick={handleAddClick}
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Add Sentence
        </button>
      </div>

      {/* Existing Sentences List */}
      <div className="w-full mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Existing Sentences:</h3>
        {sentenceBank.length > 0 ? (
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {sentenceBank.map((sentence) => (
              <li key={sentence.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-200">
                <span className="text-gray-800 flex-grow mr-4">
                  {/* Displays [PERCENTAGE] directly */}
                  {sentence.text}
                </span>
                <button
                  onClick={() => handleDeleteClick(sentence.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-bold hover:bg-red-600 transition duration-200 ease-in-out"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">No sentences added yet.</p>
        )}
      </div>


      <div className="flex space-x-4 mt-6">
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Back to Main
        </button>
      </div>

      {modalMessage && (
        <CustomModal
          message={modalMessage}
          onClose={() => {
            setModalMessage(null);
            setSentenceToDelete(null); // Clear sentence to delete if modal is closed without confirmation
          }}
          onConfirm={confirmDelete}
          showConfirmButton={sentenceToDelete !== null} // Show confirm button only for delete confirmation
          confirmButtonText="Yes, Delete"
        />
      )}

      {showPunctuationWarningModal && (
        <CustomModal
          message="The sentence does not end with a period (.), exclamation mark (!), or question mark (?). Do you want to add it anyway?"
          onClose={() => setShowPunctuationWarningModal(false)}
          onConfirm={handleConfirmAddWithoutPunctuation}
          showConfirmButton={true}
          confirmButtonText="Add Anyway"
        />
      )}
    </div>
  );
};

// --- Main App Component ---
function App() {
  // Function to get initial sentence bank from local storage or use default
  const getInitialSentenceBank = () => {
    try {
      const storedSentences = localStorage.getItem('sentenceBank');
      return storedSentences ? JSON.parse(storedSentences) : initialSentenceBank;
    } catch (error) {
      console.error("Error loading sentences from local storage:", error);
      return initialSentenceBank; // Fallback to default if local storage fails
    }
  };

  const [currentView, setCurrentView] = useState('main');
  // Initialize sentenceBank from local storage
  const [sentenceBank, setSentenceBank] = useState(getInitialSentenceBank());
  const [selectedSentencesData, setSelectedSentencesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [generatedScriptOutput, setGeneratedScriptOutput] = useState('');
  const contentEditableRef = useRef(null);
  const [caretPosition, setCaretPosition] = useState(0);
  const [modalMessage, setModalMessage] = useState(null);
  const [showPercentageWarningModal, setShowPercentageWarningModal] = useState(false);

  // New state for character count
  const [characterCount, setCharacterCount] = useState(0);

  // New state for session context
  const [sessionContext, setSessionContext] = useState(sessionContextOptions.oneToOne); // Default to one-to-one

  // States for drag and drop (mouse)
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  // Touch-specific drag states
  const [touchDraggingIndex, setTouchDraggingIndex] = useState(null); // The index of the item being touched/dragged
  const [touchStartCoords, setTouchStartCoords] = useState({ x: 0, y: 0 }); // Initial touch coordinates
  const [touchCurrentCoords, setTouchCurrentCoords] = useState({ x: 0, y: 0 }); // Current touch coordinates
  const [isTouchDragging, setIsTouchDragging] = useState(false); // Flag to indicate active touch drag
  const touchListItemRefs = useRef([]); // Refs for all list items to get their positions

  const DRAG_THRESHOLD = 10; // Pixels to move before a drag is initiated

  // Effect to update generatedScriptOutput whenever selectedSentencesData or sentenceBank changes
  useEffect(() => {
    const newScript = generateFinalScript();
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      contentEditableRef.current.innerText = newScript;
    }
    setGeneratedScriptOutput(newScript); // Keep state updated for copy/char count
  }, [selectedSentencesData, sentenceBank, sessionContext]);

  // Effect to update character count whenever generatedScriptOutput changes
  useEffect(() => {
    setCharacterCount(generatedScriptOutput.length);
  }, [generatedScriptOutput]);

  // Effect to save sentenceBank to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sentenceBank', JSON.stringify(sentenceBank));
    } catch (error) {
      console.error("Error saving sentences to local storage:", error);
    }
  }, [sentenceBank]); // Dependency array ensures this runs when sentenceBank changes


  // Effect to restore caret position after re-render
  useEffect(() => {
    if (contentEditableRef.current && document.activeElement === contentEditableRef.current) {
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        if (contentEditableRef.current.firstChild && contentEditableRef.current.firstChild.nodeType === Node.TEXT_NODE) {
          const textNodeLength = contentEditableRef.current.firstChild.length;
          const safeCaretPosition = Math.min(caretPosition, textNodeLength);
          range.setStart(contentEditableRef.current.firstChild, safeCaretPosition);
        } else {
          // If no text node, or empty, set cursor at beginning of the div
          range.setStart(contentEditableRef.current, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (error) {
        console.warn("Could not restore caret position:", error);
        contentEditableRef.current.focus(); // Fallback to just focusing
      }
    }
  }, [caretPosition]);


  // Function to add a new sentence to the sentenceBank
  const handleAddSentence = (newSentence) => {
    const newId = `custom-s-${Date.now()}`;
    setSentenceBank(prevBank => [
      ...prevBank,
      { id: newId, text: newSentence }
    ]);
    // Automatically select the newly added sentence and add it to selectedSentencesData
    setSelectedSentencesData(prevData => [...prevData, { id: newId, percentage: '' }]);
    setCurrentView('main');
  };

  // Function to delete a sentence from the sentenceBank
  const handleDeleteSentence = (sentenceIdToDelete) => {
    setSentenceBank(prevBank => prevBank.filter(s => s.id !== sentenceIdToDelete));
    setSelectedSentencesData(prevData => prevData.filter(s => s.id !== sentenceIdToDelete)); // Also remove from selected
  };

  // Function to generate the final script text from selected sentences
  const generateFinalScript = () => {
    let scriptParts = [];

    // Add session context first
    if (sessionContext) {
      scriptParts.push(sessionContext);
    }

    if (selectedSentencesData.length === 0) {
      if (!sessionContext) { // Only show this if no session context is selected either
        return "Select sentences above to get started.";
      }
    }

    selectedSentencesData.forEach(selected => {
      const sentenceTemplate = sentenceBank.find(s => s.id === selected.id);
      if (sentenceTemplate) {
        let sentenceText = sentenceTemplate.text;
        // Only replace [PERCENTAGE] if it exists in the template text
        if (sentenceText.includes('[PERCENTAGE]')) {
          sentenceText = sentenceText.replace('[PERCENTAGE]', selected.percentage || '[PERCENTAGE]');
        }
        scriptParts.push(sentenceText);
      }
    });
    return scriptParts.join(' ').trim(); // Join all parts with a space
  };

  // Handles copying the generated script to the clipboard
  const handleCopy = () => {
    // Use the current content of the contentEditable div for copying
    const currentScriptContent = contentEditableRef.current ? contentEditableRef.current.innerText : generatedScriptOutput;

    if (currentScriptContent.includes('[PERCENTAGE]')) {
      setShowPercentageWarningModal(true);
    } else {
      performCopy(currentScriptContent);
    }
  };

  // Actual copy logic, separated for conditional execution
  const performCopy = (textToCopy) => {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
      setModalMessage('Script copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      setModalMessage('Failed to copy script.');
    }
    document.body.removeChild(tempTextArea);
    setShowPercentageWarningModal(false); // Close warning modal if open
  };


  // Handles input directly into the contentEditable generated script output
  const handleGeneratedScriptInput = (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(contentEditableRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      setCaretPosition(preCaretRange.toString().length);
    } else {
      setCaretPosition(0);
    }
    // Update the state based on the current contentEditable value
    setGeneratedScriptOutput(e.target.innerText);
  };

  // Toggle selection of a sentence
  const toggleSentenceSelection = (sentenceId) => {
    setSelectedSentencesData(prevData => {
      const isSelected = prevData.some(s => s.id === sentenceId);
      if (isSelected) {
        // Remove sentence
        return prevData.filter(s => s.id !== sentenceId);
      } else {
        // Add sentence to the end of the selected list
        return [...prevData, { id: sentenceId, percentage: '' }];
      }
    });
  };

  // Update percentage for a specific selected sentence
  const updateSelectedSentencePercentage = (selectedSentenceId, newPercentage) => {
    setSelectedSentencesData(prevData =>
      prevData.map(s =>
        s.id === selectedSentenceId ? { ...s, percentage: newPercentage } : s
      )
    );
  };

  // --- Drag and Drop Handlers (Mouse) ---
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent image for the drag feedback to prevent default ghost image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault(); // Necessary to allow drop
    if (draggedItemIndex === index) return; // Don't highlight if dragging over itself
    setDragOverItemIndex(index);
  };

  const handleDragLeave = (e) => {
    // Clear highlight when leaving, but only if not leaving to a child element
    // For simplicity, we'll let dragOverItemIndex be updated by dragEnter
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Crucial: Allows a drop to happen
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      return; // No item being dragged or dropping on itself
    }

    const newSelectedSentences = [...selectedSentencesData];
    const [draggedItem] = newSelectedSentences.splice(draggedItemIndex, 1);
    newSelectedSentences.splice(dropIndex, 0, draggedItem);

    setSelectedSentencesData(newSelectedSentences);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };
  // --- End Drag and Drop Handlers (Mouse) ---

  // --- Touch Drag and Drop Handlers (using a grab handle) ---

  // Effect to manage touchListItemRefs: clear and re-populate on data change
  useEffect(() => {
    touchListItemRefs.current = touchListItemRefs.current.slice(0, selectedSentencesData.length);
  }, [selectedSentencesData]);

  const handleGrabHandleTouchStart = (e, index) => {
    e.stopPropagation(); // Prevent the li's onClick from firing
    if (e.touches.length !== 1) return;

    setTouchDraggingIndex(index);
    setTouchStartCoords({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setTouchCurrentCoords({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsTouchDragging(false); // Initially not dragging, waiting for threshold

    // Add event listeners to the document to capture moves outside the initial element
    // Use { passive: false } to allow preventDefault
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (touchDraggingIndex === null || e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const deltaX = currentX - touchStartCoords.x;
    const deltaY = currentY - touchStartCoords.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (!isTouchDragging && distance > DRAG_THRESHOLD) {
      // Threshold met, start dragging
      setIsTouchDragging(true);
      // Apply initial drag styles
      const listItem = touchListItemRefs.current[touchDraggingIndex];
      if (listItem) {
        // Get initial bounding rect for positioning
        const rect = listItem.getBoundingClientRect();
        listItem.style.position = 'fixed'; // Use fixed to drag relative to viewport
        listItem.style.width = `${rect.width}px`; // Maintain original width
        listItem.style.height = `${rect.height}px`; // Maintain original height
        listItem.style.left = `${rect.left}px`;
        listItem.style.top = `${rect.top}px`;
        listItem.style.zIndex = '1000'; // Bring to front
        listItem.classList.add('opacity-50'); // Visual feedback for dragging
      }
    }

    if (isTouchDragging) {
      e.preventDefault(); // Prevent scrolling ONLY when actively dragging
      setTouchCurrentCoords({ x: currentX, y: currentY });

      const listItem = touchListItemRefs.current[touchDraggingIndex];
      if (listItem) {
        // Update position relative to initial touch start
        const initialRect = listItem.getBoundingClientRect(); // Get current position
        listItem.style.left = `${initialRect.left + deltaX}px`;
        listItem.style.top = `${initialRect.top + deltaY}px`;
      }

      // Determine the element under the current touch
      const targetElement = document.elementFromPoint(currentX, currentY);

      if (targetElement) {
        const closestLi = targetElement.closest('.customize-selected-sentence-item');
        if (closestLi && closestLi.parentNode === touchListItemRefs.current[touchDraggingIndex]?.parentNode) {
          // Find the index of the closestLi within the current visible list items
          const allListItems = Array.from(closestLi.parentNode.children);
          const targetIndex = allListItems.indexOf(closestLi);

          if (targetIndex !== -1 && targetIndex !== touchDraggingIndex) {
            setDragOverItemIndex(targetIndex);
          } else {
            setDragOverItemIndex(null);
          }
        } else {
          setDragOverItemIndex(null);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchDraggingIndex === null) return;

    // Clean up styles
    const listItem = touchListItemRefs.current[touchDraggingIndex];
    if (listItem) {
      listItem.style.position = ''; // Reset position
      listItem.style.width = ''; // Reset width
      listItem.style.height = ''; // Reset height
      listItem.style.left = ''; // Reset left
      listItem.style.top = ''; // Reset top
      listItem.style.zIndex = '';
      listItem.classList.remove('opacity-50');
    }

    // Perform reordering if a drag was active and a valid target was found
    if (isTouchDragging && dragOverItemIndex !== null && touchDraggingIndex !== dragOverItemIndex) {
      const newSelectedSentences = [...selectedSentencesData];
      const [draggedItem] = newSelectedSentences.splice(touchDraggingIndex, 1);
      newSelectedSentences.splice(dragOverItemIndex, 0, draggedItem);
      setSelectedSentencesData(newSelectedSentences);
    }

    // Reset all touch drag states
    setTouchDraggingIndex(null);
    setTouchStartCoords({ x: 0, y: 0 });
    setTouchCurrentCoords({ x: 0, y: 0 });
    setIsTouchDragging(false);
    setDragOverItemIndex(null); // Reset drag over visual

    // Remove global listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
  };
  // --- End Touch Drag and Drop Handlers ---


  // Filter sentences based on search term
  const filteredSentences = sentenceBank.filter(sentence =>
    sentence.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8 drop-shadow-sm">
          Script Generator
        </h1>

        {currentView === 'main' ? (
          <>
            {/* Main Script Editor Section */}
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Select or Customize Your Script</h2>

              {/* Session Context Selection */}
              <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Choose Session Context:</h3>
                <div className="flex flex-col space-y-3">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-blue-600"
                      name="sessionContext"
                      value={sessionContextOptions.oneToOne}
                      checked={sessionContext === sessionContextOptions.oneToOne}
                      onChange={(e) => setSessionContext(e.target.value)}
                    />
                    <span className="ml-2 text-gray-700">{sessionContextOptions.oneToOne}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-blue-600"
                      name="sessionContext"
                      value={sessionContextOptions.withSupervision}
                      checked={sessionContext === sessionContextOptions.withSupervision}
                      onChange={(e) => setSessionContext(e.target.value)}
                    />
                    <span className="ml-2 text-gray-700">{sessionContextOptions.withSupervision}</span>
                  </label>
                </div>
              </div>


              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search sentences..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sentence Selection List */}
              <div className="mb-6 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                {filteredSentences.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredSentences.map((sentence) => (
                      <li
                        key={sentence.id}
                        className={`p-3 rounded-md cursor-pointer transition duration-200 ease-in-out ${
                          selectedSentencesData.some(s => s.id === sentence.id)
                            ? 'bg-blue-100 border border-blue-400 text-blue-800 font-medium shadow-sm'
                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => toggleSentenceSelection(sentence.id)}
                      >
                        {sentence.text.replace('[PERCENTAGE]', '___')} {/* Show placeholder in selection */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">No sentences found. Try a different search or add a new one!</p>
                )}
              </div>

              {/* Customize Selected Sentences individually - MOVED HERE */}
              {selectedSentencesData.length > 0 && (
                <div className="mt-6 p-4 border border-blue-300 bg-blue-50 rounded-lg shadow-inner">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Customize Selected Sentences:</h3>
                  <ul className="space-y-3">
                    {selectedSentencesData.map((selected, index) => {
                      const sentenceTemplate = sentenceBank.find(s => s.id === selected.id);
                      if (!sentenceTemplate) return null;

                      const hasPercentage = sentenceTemplate.text.includes('[PERCENTAGE]');
                      const parts = hasPercentage ? sentenceTemplate.text.split('[PERCENTAGE]') : [sentenceTemplate.text];

                      return (
                        <li
                          key={selected.id} // Use unique ID for key
                          data-id={selected.id} // Add data-id for easier lookup in touch events
                          draggable="true" // Keep for mouse drag
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragEnter={(e) => handleDragEnter(e, index)}
                          onDragLeave={(e) => setDragOverItemIndex(null)} // Clear on leave
                          onDragOver={handleDragOver} // Crucial for drop to work
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          // Removed onTouchStart from the li itself
                          className={`flex items-center bg-white p-3 rounded-md shadow-sm border border-gray-200 customize-selected-sentence-item
                            ${(draggedItemIndex === index || touchDraggingIndex === index) ? 'opacity-50' : ''}
                            ${dragOverItemIndex === index && (draggedItemIndex !== index && touchDraggingIndex !== index) ? 'border-2 border-blue-500 bg-blue-50' : ''}
                          `}
                          ref={el => touchListItemRefs.current[index] = el} // Store ref for each item
                          style={{ touchAction: 'none' }} // Prevent default touch actions on the list item itself
                        >
                          <span className="text-gray-800 flex-grow">
                            {parts[0]}
                            {hasPercentage && (
                              <input
                                type="number"
                                className="inline-block w-20 p-1 mx-2 border border-blue-400 rounded-md text-center text-blue-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                placeholder="e.g., 80"
                                value={selected.percentage}
                                onChange={(e) => updateSelectedSentencePercentage(selected.id, e.target.value)}
                                min="0"
                                max="100"
                              />
                            )}
                            {parts[1]}
                          </span>
                          {/* Grab Handle for Touch Drag */}
                          <div
                            className="ml-2 px-2 py-1 bg-gray-200 rounded-md cursor-grab text-gray-600 flex flex-col items-center justify-center"
                            onTouchStart={(e) => handleGrabHandleTouchStart(e, index)}
                            style={{ touchAction: 'none' }} // Prevent default browser touch actions on the handle
                          >
                            <span className="text-xs leading-none">•••</span>
                            <span className="text-xs leading-none">•••</span>
                          </div>
                          <button
                            onClick={() => toggleSentenceSelection(selected.id)}
                            className="ml-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition duration-200 ease-in-out"
                          >
                            &times;
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setCurrentView('manageSentences')} // Changed to manageSentences
                className="mt-6 w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg"
              >
                Manage Sentence Templates
              </button>
            </div>

            {/* Generated Script Output Section */}
            <div className="output-section bg-white p-6 rounded-xl shadow-2xl border border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Script:</h2>
              <div
                className="generated-script-preview w-full p-4 border border-gray-300 rounded-md bg-gray-50 text-gray-800 text-lg min-h-[80px] focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out"
                contentEditable="true"
                onInput={handleGeneratedScriptInput}
                ref={contentEditableRef}
              ></div>

              {/* Character Count UI Element */}
              <p className="text-right text-gray-600 text-sm mt-2">
                Character Count: <span className="font-semibold">{characterCount}</span>
              </p>

              <div className="flex justify-center mt-4">
                <button
                  className="copy-button px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg"
                  onClick={handleCopy}
                >
                  Copy Script
                </button>
              </div>
            </div>
          </>
        ) : (
          // Manage Sentences View
          <ManageSentencesView
            sentenceBank={sentenceBank}
            onAddSentence={handleAddSentence}
            onDeleteSentence={handleDeleteSentence}
            onGoBack={() => setCurrentView('main')}
          />
        )}

        <p className="note text-center text-gray-500 text-sm mt-8">
          Note: This is a frontend-only demo. Changes are not saved persistently.
          Direct edits in the "Generated Script" area are captured for copying, but do not update the structured inputs above.
        </p>

        {/* Modal for general messages */}
        {modalMessage && <CustomModal message={modalMessage} onClose={() => setModalMessage(null)} />}

        {/* Warning Modal for [PERCENTAGE] placeholder */}
        {showPercentageWarningModal && (
          <CustomModal
            message="The generated script still contains '[PERCENTAGE]' placeholders. Do you want to copy it anyway?"
            onClose={() => setShowPercentageWarningModal(false)}
            onConfirm={performCopy}
            showConfirmButton={true}
            confirmButtonText="Copy Anyway"
          />
        )}
      </div>
    </div>
  );
}

export default App;

