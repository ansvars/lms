import { useState, useEffect } from 'react';
import { getTestDetails, submitTestAnswers } from '../../services/api';
import './TestViewer.css';

export default function TestViewer({ testId, onBack }) {
  const [testDetails, setTestDetails] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const test = await getTestDetails(testId);
        setTestDetails(test);
      } catch (err) {
        setError('Failed to load test. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitTestAnswers(testId, answers);
      setSubmissionStatus('success');
    } catch (error) {
      setSubmissionStatus('error');
    }
  };

  if (loading) return <div className="loading">Loading test...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!testDetails) return <div className="error">Test not found</div>;

  return (
    <div className="test-viewer">
      <div className="test-header">
        <h2>{testDetails.name}</h2>
        <button onClick={onBack} className="back-btn">
          &larr; Back to Tests
        </button>
      </div>
      
      <div className="test-meta">
        {testDetails.description && <p>{testDetails.description}</p>}
        <div className="test-stats">
          <span>{testDetails.questions.length} questions</span>
          {testDetails.timeLimit && <span>Time limit: {testDetails.timeLimit} mins</span>}
        </div>
      </div>

      <div className="questions-container">
        {testDetails.questions.map((question, qIndex) => (
          <div key={question.id || qIndex} className="question-card">
            <div className="question-header">
              <h3>Question {qIndex + 1}</h3>
              {question.points && <span className="points">{question.points} pts</span>}
            </div>
            
            <div className="question-content">
              <p>{question.text}</p>
              
              {question.imageUrl && (
                <div className="question-image-container">
                  <img 
                    src={question.imageUrl} 
                    alt={`Question ${qIndex + 1}`} 
                    className="question-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/image-not-found.png';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="options">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option">
                  <input
                    type={question.multiple ? "checkbox" : "radio"}
                    id={`q${qIndex}-o${oIndex}`}
                    name={`question-${qIndex}`}
                    onChange={() => handleAnswerSelect(qIndex, oIndex)}
                    checked={answers[qIndex] === oIndex || 
                             (Array.isArray(answers[qIndex]) && answers[qIndex].includes(oIndex))}
                  />
                  <label htmlFor={`q${qIndex}-o${oIndex}`}>
                    <span className="option-letter">{String.fromCharCode(65 + oIndex)}.</span>
                    {option.text || option}
                    {option.imageUrl && (
                      <img 
                        src={option.imageUrl} 
                        alt={`Option ${oIndex + 1}`}
                        className="option-image"
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="test-actions">
        <button onClick={handleSubmit} className="submit-btn" disabled={submissionStatus === 'success'}>
          {submissionStatus === 'success' ? 'Submitted!' : 'Submit Test'}
        </button>
      </div>

      {submissionStatus === 'success' && (
        <div className="status-message success">
          <p>Test submitted successfully!</p>
          <button onClick={onBack} className="return-btn">
            Return to Test List
          </button>
        </div>
      )}
      {submissionStatus === 'error' && (
        <div className="status-message error">
          <p>Failed to submit test. Please try again.</p>
          <button onClick={() => setSubmissionStatus(null)} className="retry-btn">
            Retry Submission
          </button>
        </div>
      )}
    </div>
  );
}