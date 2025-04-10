import React, { useEffect, useState } from 'react';
import { PiFireSimpleBold } from "react-icons/pi";
import { LuActivity } from "react-icons/lu";
import { GoImage } from "react-icons/go";
import { TbCloudDownload } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { RiCalendarTodoLine } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  //console.log(location.pathname)

  const [path, setPath] = useState('/');

  useEffect(() => {
    if(location.pathname !== '/excel'){
      setPath(location.pathname)
    }
  },[location.pathname])
  return (
    <div className="fixed left-0 top-0 w-14 h-full bg-[#030F0E] pt-2 transition-width duration-300">
      <ul className="flex flex-col items-center space-y-6">
        <li className="my-3">
          <Link to="/">
            <img src="./assets/Logo_N.png" alt="Dashboard" className="w-4 h-6" />
          </Link>
        </li>
        <li className="mt-2">
          <Link to={path}>
          <FiPieChart color='white' className='w-5 h-5'/>
          </Link>
        </li>
        <li className="mt-2">
          <Link to="/excel">
          <img src="./assets/Rename.png" alt="Dashboard" className="w-4 h-5" />
          </Link>
        </li>
        <li className="mt-2">
          <Link to="#">
          <LuSettings color='#7A7F7F' className='w-5 h-5'/>
          </Link>
        </li>
        {/* 
         */}
      </ul>
    </div>
  );
};

export default Sidebar;