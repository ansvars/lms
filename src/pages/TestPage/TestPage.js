import { useState, useEffect } from 'react';
import { createTest, getTests, getTestDetails } from '../../services/api';
import CreateTestModal from './CreateTestModal';
import TestList from './TestList';
import TestViewer from './TestViewer';
import './TestPage.css';

export default function TestPage() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tests on mount
  useEffect(() => {
    const loadTests = async () => {
      try {
        setError(null);
        const response = await getTests();
        setTests(response);
      } catch (err) {
        console.error('Failed to load tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  // Load test details when a test is selected
  useEffect(() => {
    if (selectedTest) {
      const loadTestDetails = async () => {
        try {
          setLoading(true);
          const details = await getTestDetails(selectedTest);
          setTestDetails(details);
        } catch (err) {
          console.error('Failed to load test:', err);
          setError('Failed to load test content.');
        } finally {
          setLoading(false);
        }
      };
      loadTestDetails();
    }
  }, [selectedTest]);

  const handleCreateTest = async (testData) => {
    if (!testData.name || !testData.docUrl) {
      setError('Test name and Google Doc URL are required');
      return;
    }

    try {
      setError(null);
      const newTest = await createTest({
        name: testData.name,
        docUrl: testData.docUrl,  // Still used for initial import
        createdAt: new Date().toISOString()
      });
      
      setTests(prev => [newTest, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create test. Please check the URL and try again.');
    }
  };

  const handleBackToList = () => {
    setSelectedTest(null);
    setTestDetails(null);
    setError(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="test-page">
      <div className="test-header">
        {selectedTest ? (
          <button className="back-btn" onClick={handleBackToList}>
            &larr; Back to Tests
          </button>
        ) : (
          <>
            <h2>Tests Management</h2>
            <button 
              className="create-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Create New Test
            </button>
          </>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {selectedTest ? (
        <TestViewer 
          testDetails={testDetails} 
          onBack={handleBackToList}
        />
      ) : (
        <TestList 
          tests={tests} 
          onTestSelect={setSelectedTest} 
        />
      )}

      {isModalOpen && (
        <CreateTestModal
          onClose={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          onCreate={handleCreateTest}
          error={error}
        />
      )}
    </div>
  );
}