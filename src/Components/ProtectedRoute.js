import React from 'react';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); 

  if (!token) {
    window.location.href = "http://13.126.205.156:8082/"
  }

  return children;
};

export default ProtectedRoute;

