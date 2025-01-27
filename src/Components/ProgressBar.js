import React, { useState, useEffect } from "react";

const ProgressBar = ({ value }) => {

  // Configuration
  const totalBars = 10; 
  const barWidth = "w-3"; 
  const barGap = "gap-3"; 
  const barHeight = "h-9"; 

  const calculateFilledBars = (value) => {
    if (value <= 0) return 0; 
  

    if (value <= 100) {
      return Math.min(Math.floor(value / 10), totalBars);
    }
    if (value <= 1000) {
      return Math.min(Math.floor(value / 100), totalBars);
    }
    return Math.min(Math.floor(value / 1000), totalBars); 
  };
  

  // Initialize the filledBars state
  const [filledBars, setFilledBars] = useState(() => calculateFilledBars(value));

  useEffect(() => {
    setFilledBars(calculateFilledBars(value)); 
  }, [value]); 

  return (
    <div className={`flex ${barGap} pl-12`}>
      {Array.from({ length: totalBars }).map((_, index) => (
        <div
          key={index}
          className={`${barWidth} ${barHeight} ${
            index < filledBars ? "bg-blue-500" : "bg-gray-300"
          } transition-colors duration-300 delay-700 `}
        ></div>
      ))}
    </div>
  );
};

export default ProgressBar;
