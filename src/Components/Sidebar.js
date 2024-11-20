import React from 'react';
import { Link } from 'react-router-dom';
import { PiFireSimpleBold } from "react-icons/pi";
import { LuActivity } from "react-icons/lu";
import { GoImage } from "react-icons/go";
import { TbCloudDownload } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";
import { RiCalendarTodoLine } from "react-icons/ri";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 w-14 h-full bg-[#030F0E] pt-2 transition-width duration-300">
      <ul className="flex flex-col items-center space-y-6">
        <li className="my-3">
          <Link to="/">
            <img src="./assets/Logo_N.png" alt="Dashboard" className="w-4 h-6" />
          </Link>
        </li>
        <li className="mt-2">
          <Link to="#">
          <FiPieChart color='white' className='w-5 h-5'/>
          </Link>
        </li>
        <li className="mt-4">
          <Link to="#">
          <TbCloudDownload color='#7A7F7F' className='w-5 h-5'/>
          </Link>
        </li>
        <li className="mt-4">
          <Link to="#">
          <LuActivity color='#7A7F7F' className='w-5 h-5'/>
          </Link>
        </li>
        <li className="mt-4">
          <Link to="#">
          <GoImage color='#7A7F7F' className='w-5 h-5'/>
          </Link>
        </li>
        <li className="mt-4">
          <Link to="#">
            <RiCalendarTodoLine color='#7A7F7F' className='w-5 h-5 font-bold'/>
          </Link>
        </li>
        <li className="mt-4">
          <Link to="#">
            <PiFireSimpleBold color='#7A7F7F' className='w-5 h-5 font-bold' />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
