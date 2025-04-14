// src/pages/TestPage/CreateTestModal.js
import React, { useState } from 'react';
import './TestPage.css';

const CreateTestModal = ({ onClose, onSubmit }) => {
  const [testName, setTestName] = useState('');
  const [questionCount, setQuestionCount] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: testName,
      questionCount: parseInt(questionCount)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Test</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Test Name:</label>
            <input 
              type="text" 
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Questions:</label>
            <input 
              type="number" 
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create Questions</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestModal;