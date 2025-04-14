// src/pages/TestPage/TestList.js
import React from 'react';
import { Link } from 'react-router-dom';
import './TestPage.css';

const TestList = ({ tests }) => {
  if (tests.length === 0) {
    return <div className="no-tests">No tests created yet.</div>;
  }

  return (
    <div className="test-list">
      <h2>Your Tests</h2>
      <ul>
        {tests.map((test) => (
          <li key={test.id}>
            <Link to={`/tests/${test.id}`}>
              <h3>{test.name}</h3>
              <p>Questions: {test.questions?.length || 0}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestList;