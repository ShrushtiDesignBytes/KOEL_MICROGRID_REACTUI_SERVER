import React from 'react';
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
import './App.css';

const App = () => {
  const BaseUrl = "http://13.126.205.156/micro"
 // const Url = "http://13.126.205.156/micro"
  
  return (
    <Router>
      <div className="flex h-screen custom-body">
        <Sidebar />
        <div className="flex flex-col flex-grow ml-12 transition-all duration-300">
          <Navbar />
          <Header />
          <div className="content flex-grow p-2  bg-gradient-to-r from-custom-green to-custom-dark">
            <Routes>
              <Route path="/" element={<Overview BaseUrl = {BaseUrl}/>} />
              <Route path="/solar" element={<Solar BaseUrl = {BaseUrl}/>} />
              <Route path="/wind" element={<Wind BaseUrl = {BaseUrl}/>}/>
              <Route path="/biogas" element={<Biogas BaseUrl = {BaseUrl}/>} />
              <Route path="/mains" element={<Mains BaseUrl = {BaseUrl}/>} />
              <Route path="/genset" element={<Genset BaseUrl = {BaseUrl}/>} />
              <Route path="/ess" element={<Ess BaseUrl = {BaseUrl}/>}/>
              <Route path="/alerts" element={<Alerts BaseUrl = {BaseUrl}/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
