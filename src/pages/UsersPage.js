import React, { useState, useEffect } from 'react';
import './UsersPage.css';

const UsersPage = () => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    error: null,
    showModal: false,
    isSubmitting: false,
    editingUser: null,
    form: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  });

  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        users: data,
        loading: false
      }));
    } catch (error) {
      console.error('Fetch error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEdit = (user) => {
    setState(prev => ({
      ...prev,
      editingUser: user,
      showModal: true,
      form: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: ''
      }
    }));
  };

  const handleReports = (userId) => {
    console.log(`Generate reports for user ${userId}`);
    // Implement your reports functionality here
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        showModal: false,
        editingUser: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const url = state.editingUser 
        ? `/api/users/${state.editingUser.id}` 
        : '/api/users';
      const method = state.editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(state.form)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user');
      }

      const updatedUser = await response.json();
      
      setState(prev => ({
        ...prev,
        users: state.editingUser
          ? prev.users.map(u => u.id === state.editingUser.id ? updatedUser : u)
          : [...prev.users, updatedUser],
        form: {
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        },
        editingUser: null,
        showModal: false,
        isSubmitting: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isSubmitting: false
      }));
    }
  };

  if (state.loading) return <div className="loading">Loading users...</div>;
  if (state.error) return <div className="error">Error: {state.error}</div>;

  return (
    <div className="users-container">
      <div className="header">
        <h2>Users</h2>
        <button 
          className="add-user-btn"
          onClick={() => setState(prev => ({ 
            ...prev, 
            showModal: true, 
            editingUser: null,
            form: {
              firstName: '',
              lastName: '',
              email: '',
              password: ''
            }
          }))}
        >
          Add User
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Registered</th>
            <th>Last Login</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {state.users.map(user => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
              <td>{user.lastLogin || 'Never'}</td>
              <td className="options-cell">
                <button 
                  className="option-btn reports-btn"
                  onClick={() => handleReports(user.id)}
                >
                  Reports
                </button>
                <button 
                  className="option-btn edit-btn"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {state.showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header">
              <h3>{state.editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="close-btn"
                onClick={() => !state.isSubmitting && setState(prev => ({ ...prev, showModal: false }))}
                disabled={state.isSubmitting}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={state.form.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                    maxLength="50"
                    required
                  />
                  <div className="char-count">{state.form.firstName.length}/50</div>
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={state.form.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Doe"
                    maxLength="50"
                    required
                  />
                  <div className="char-count">{state.form.lastName.length}/50</div>
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={state.form.email}
                  onChange={handleInputChange}
                  placeholder="e.g. jdoe@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password {!state.editingUser && '(optional)'}</label>
                <input
                  type="password"
                  name="password"
                  value={state.form.password}
                  onChange={handleInputChange}
                  placeholder={state.editingUser ? 'Leave blank to keep current' : 'Blank for random password'}
                />
              </div>

              <div className="modal-actions">
                {state.editingUser && (
                  <button 
                    type="button" 
                    className="delete-btn"
                    onClick={() => handleDelete(state.editingUser.id)}
                    disabled={state.isSubmitting}
                  >
                    Delete User
                  </button>
                )}
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setState(prev => ({ ...prev, showModal: false }))}
                  disabled={state.isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={state.isSubmitting}
                >
                  {state.isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
