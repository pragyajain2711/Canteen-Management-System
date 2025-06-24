import React, { useState ,useContext} from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
 import {useTheme} from "../ThemeContext";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
function SignIn() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 const navigate = useNavigate();
 const { login } = useContext(AuthContext);
 const [showForgotPassword, setShowForgotPassword] = useState(false);
 const {theme} =useTheme();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !password) {
      setError('Both fields are required');
      return;
    }

     try {
      const response = await api.post('/api/auth/signin', { 
        employeeId, 
        password 
      });
      
     
       const employeeData = {
        fullName: response.data.fullName,
        employeeId: response.data.employeeId,
        department: response.data.department
      };
             login(response.data.token, employeeData,response.data.admin,response.data.superAdmin);
      console.log("Login response:", response.data);

// In your handleSubmit function
if (response.data.superAdmin) {
  navigate('/superadmin-dashboard');
} else if (response.data.admin) {
  navigate('/admin-dashboard'); 
} else {
  navigate('/dashboard');
}
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
      console.log("Error response:", err.response);

    }
  };
   

  const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: 350,
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: 'black',
  },
  input: {
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  }
};


  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Employee Sign In</h2>
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                <a 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPassword(true);
                    }}
                    style={{ color: '#007bff', textDecoration: 'none' }}
                >
                    Forgot Password?
                </a>
            </div>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.button}>Sign In</button>
      </form>
      {showForgotPassword && (
            <ForgotPasswordDialog onClose={() => setShowForgotPassword(false)} />
        )}
    </div>
  );
}

export default SignIn;
