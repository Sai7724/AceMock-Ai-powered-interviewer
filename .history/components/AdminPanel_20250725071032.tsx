import React from 'react';
import { useAuth } from '../App';

const ADMIN_EMAIL = 'acemock_admin26@gmail.com'; // Updated admin email

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Panel</h1>
      <p>Welcome, Admin! Here you can manage the application.</p>
      {/* Add admin actions here */}
    </div>
  );
};

export default AdminPanel; 