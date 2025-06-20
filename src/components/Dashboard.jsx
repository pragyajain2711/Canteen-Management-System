import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import {useTheme} from "../ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { employee } = useContext(AuthContext);
  const {theme} =useTheme();
  if (!employee) {
    return <div>Loading...</div>; // Prevent crash while data loads
  }

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    infoCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Welcome, {employee.fullName}!</h1>
        <p>Employee Dashboard</p>
      </div>

      <div style={styles.infoCard}>
        <h3>Your Information</h3>
        <p><strong>Employee ID:</strong> {employee.employeeId}</p>
        <p><strong>Department:</strong> {employee.department}</p>
      </div>

      <div>
        <button 
          style={styles.button}
          onClick={() => navigate('/menu')}
        >
          View Menu
        </button>
        <button 
          style={styles.button}
          onClick={() => navigate('/cart')}
        >
          View Cart
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
