// src/pages/TestPage/TestPage.js
import React, { useState, useEffect } from 'react';
import { getTests, createTest } from '../../services/api';
import CreateTestModal from './CreateTestModal';
import TestList from './TestList';
import './TestPage.css';

const TestPage = () => {
  const [tests, setTests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await getTests();
        setTests(data);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleCreateTest = async (testData) => {
    try {
      const newTest = await createTest({
        name: testData.name,
        questions: Array(testData.questionCount).fill({ text: '', options: [] })
      });
      setTests([...tests, newTest]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  if (loading) return <div>Loading tests...</div>;

  return (
    <div className="test-page">
      <h1>Tests Management</h1>
      <button className="create-btn" onClick={() => setShowCreateModal(true)}>
        Create New Test
      </button>
      
      <TestList tests={tests} />
      
      {showCreateModal && (
        <CreateTestModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTest}
        />
      )}
    </div>
  );
};

export default TestPage;