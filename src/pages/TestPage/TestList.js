export default function TestList({ tests, onTestSelect }) {
  if (tests.length === 0) {
    return <div className="no-tests">No tests created yet</div>;
  }

  return (
    <div className="test-list">
      <h3>Your Tests</h3>
      <ul>
        {tests.map((test) => (
          <li key={test.id} className="test-item">
            <div className="test-name">{test.name}</div>
            <div className="test-actions">
              <button 
                onClick={() => onTestSelect(test.id)}
                className="view-test-btn"
              >
                View Test
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}