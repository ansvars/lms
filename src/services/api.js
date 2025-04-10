const API_BASE_URL = process.env.REACT_APP_API_URL;

// ====================== AUTH FUNCTION ======================
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

// ====================== USER MANAGEMENT ======================
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add user');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ====================== TEST MANAGEMENT ======================
export const getTests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tests`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tests');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getTestDetails = async (testId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch test details');
    }

    const testData = await response.json();
    
    return {
      id: testData.id,
      name: testData.name,
      description: testData.description || '',
      timeLimit: testData.timeLimit || null,
      questions: testData.questions.map(q => ({
        id: q.id,
        text: q.text,
        imageUrl: q.imageUrl || null,
        points: q.points || 1,
        multiple: q.multiple || false,
        options: q.options.map((opt, index) => ({
          text: opt.text || `Option ${index + 1}`,
          imageUrl: opt.imageUrl || null,
          correct: opt.correct || false
        }))
      }))
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const createTest = async (testData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tests`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create test');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const submitTestAnswers = async (testId, answers) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tests/${testId}/submit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit answers');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const uploadTestImage = async (file, testId, questionId) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('testId', testId);
    formData.append('questionId', questionId);

    const response = await fetch(`${API_BASE_URL}/api/tests/upload-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ====================== EXPORT OBJECT ======================
export default {
  loginUser,
  fetchUsers,
  addUser,
  getTests,
  getTestDetails,
  createTest,
  submitTestAnswers,
  uploadTestImage
};