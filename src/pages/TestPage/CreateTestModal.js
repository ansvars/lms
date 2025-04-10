import { useState } from 'react';

export default function CreateTestModal({ onClose, onCreate }) {
  const [testName, setTestName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const handleSubmit = () => {
    if (!testName.trim() || !docUrl.trim()) {
      alert('Please fill all fields');
      return;
    }
    onCreate({ name: testName, docUrl });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create New Test</h2>
        <input
          type="text"
          placeholder="Test Name"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
        />
        <input
          type="url"
          placeholder="Google Doc URL"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}