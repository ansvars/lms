// src/pages/TestPage/Question.js
import React, { useState } from 'react';

const Question = ({ number, onQuestionChange }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="question-container">
      <h3>Question {number}</h3>
      <textarea
        placeholder="Enter question text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <textarea
        placeholder="Enter answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload}
      />
      {image && <img src={image} alt="Question visual" className="question-image" />}
    </div>
  );
};

export default Question;