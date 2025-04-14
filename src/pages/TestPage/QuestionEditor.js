// src/pages/TestPage/QuestionEditor.js
import React, { useState } from 'react';
import { uploadTestImage } from '../../services/api';
import './TestPage.css';

const QuestionEditor = ({ question, testId, onUpdate }) => {
  const [text, setText] = useState(question.text || '');
  const [options, setOptions] = useState(question.options || [{ text: '', correct: false }]);
  const [image, setImage] = useState(question.imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadTestImage(file, testId, question.id);
      setImage(result.imageUrl);
      onUpdate({ ...question, imageUrl: result.imageUrl });
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, { text: '', correct: false }];
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <div className="question-editor">
      <h3>Question {question.id}</h3>
      <textarea
        placeholder="Enter question text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onUpdate({ ...question, text: e.target.value });
        }}
      />

      <div className="image-upload">
        <label>
          {image ? 'Change Image' : 'Upload Image'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>
        {uploading && <span>Uploading...</span>}
        {image && <img src={image} alt="Question visual" className="question-image" />}
      </div>

      <h4>Options:</h4>
      {options.map((option, index) => (
        <div key={index} className="option">
          <input
            type="text"
            value={option.text}
            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          <label>
            Correct:
            <input
              type="checkbox"
              checked={option.correct}
              onChange={(e) => handleOptionChange(index, 'correct', e.target.checked)}
            />
          </label>
        </div>
      ))}
      <button type="button" onClick={addOption}>Add Option</button>
    </div>
  );
};

export default QuestionEditor;