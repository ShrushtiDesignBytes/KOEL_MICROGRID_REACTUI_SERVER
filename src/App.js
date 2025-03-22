import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import Header from './Components/Header';
import Overview from './Screens/Overview';
import Solar from './Screens/Solar';
import Wind from './Screens/Wind';
import Biogas from './Screens/Biogas';
import Mains from './Screens/Mains';
import Genset from './Screens/Genset';
import Alerts from './Screens/Alert';
import Ess from './Screens/Ess';
import ProtectedRoute from './Components/ProtectedRoute';
import './App.css';

const App = () => {
  //const BaseUrl = "http://13.126.205.156/micro"
  const BaseUrl = "http://localhost:5000/micro"

  const [routeData, setRouteData] = useState();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const id = urlParams.get('id');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('id', id);
      console.log('Token & Id stored in localStorage');
    }

    // Remove token from URL to avoid exposure
    const removeTokenFromUrl = () => {
      const url = new URL(window.location);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url);
    };

    removeTokenFromUrl();
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const id = localStorage.getItem('id');
  //     if (id) { 
  //       try {
  //         const response = await fetch(`http://localhost:5001/assignRoutes/${id}`);
  //         const result = await response.json(); 
  //         console.log(result); 
  //         setRouteData(result); 
  //       } catch (error) {
  //         console.error('Error fetching data:', error);
  //       }
  //     } else {
  //       console.log('No ID found in localStorage');
  //     }
  //   };

  //   fetchData();
  // }, []);
  return (
    <Router>
      <div className="flex h-screen custom-body">
        <Sidebar />
        <div className="flex flex-col flex-grow ml-12 transition-all duration-300">
          <Navbar />
          <Header />
          <div className="content flex-grow p-2  bg-gradient-to-r from-custom-green to-custom-dark">
            <Routes>
              <Route path="/" element={
                // <ProtectedRoute>
                  <Overview BaseUrl={BaseUrl} />
                // </ProtectedRoute>
              } />
              <Route path="/solar" element={
               // <ProtectedRoute>
                  <Solar BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
              <Route path="/wind" element={
               // <ProtectedRoute>
                  <Wind BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
              <Route path="/biogas" element={
                //<ProtectedRoute>
                  <Biogas BaseUrl={BaseUrl} />
                //</ProtectedRoute>
              } />
              <Route path="/mains" element={
               // <ProtectedRoute>
                  <Mains BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
              <Route path="/genset" element={
                //<ProtectedRoute>
                  <Genset BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
              <Route path="/ess" element={
               // <ProtectedRoute>
                  <Ess BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                //<ProtectedRoute>
                  <Alerts BaseUrl={BaseUrl} />
               // </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
