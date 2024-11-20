/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from 'react';

const Genset = ({ BaseUrl }) => {
    const [data, setData] = useState({})
    const [alertsData, setAlertsData] = useState([]);
    const [alertCount, setAlertCount] = useState(0);
    const [shutdownCount, setShutdownCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const response = await fetch(`${BaseUrl}/genset`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.id - b.id);
            console.log(sortedData)
            setData(sortedData[sortedData.length - 1]);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Error:', error);
            setLoading(false);
        }
        try {
            const response = await fetch(`${BaseUrl}/alert`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setAlertsData(data);
            displayCounts(data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };

      useEffect(() => {
        fetchAlerts();
    
        const interval = setInterval(() => {
          fetchAlerts(); 
        }, 5000);
    
        return () => clearInterval(interval); 
      }, []);
    
    const displayCounts = (data) => {
        const gensetData = data.filter((i) => i.category === 'genset');
        const alerts = gensetData.filter((i) => i.severity.toLowerCase() === 'alert');
        const shutdown = gensetData.filter((i) => i.severity.toLowerCase() === 'shutdown');
        setAlertCount(alerts.length);
        setShutdownCount(shutdown.length);
    };
    return (
        !loading && <div className="p-4">
            {/* First Row Section */}
            <div className="grid grid-cols-2 gap-5">
                <div className="relative w-full h-full rounded-md bg-gradient-to-t from-custom-dark-image to-custom-green-image flex items-center justify-center">
                    <div className="w-fit h-fit lg:w-11/12 lg:h-3/4">
                        <img
                            id="overview-image"
                            src="assets/genset_n.png"
                            alt="overview"
                            className="block w-full h-full object-contain"
                        />
                    </div>
                    <div className="absolute top-7 left-5 transform -translate-x-1/5 translate-y-1/5 p-1.5 bg-transparent text-white rounded z-10 flex items-center max-w-[calc(100%-40px)]">
                        <div className="mr-2.5">
                            <img src="assets/Group.png" className="max-h-1/2 max-w-full" alt="Group Icon" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-rows-[25%_25%_45%] gap-4">
                    <div className="grid grid-cols-4 gap-2 mt-1">
                        <div className="bg-[#051E1C] rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs xl:text-sm text-[#C37C5A] font-medium text-center">Operating Hours</p>
                            <p className="text-lg xl:text-xl font-semibold text-[#F3E5DE] pt-2" id="operating-hours">{data.operating_hours} hrs</p>
                        </div>
                        <div className="bg-[#051E1C] rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs xl:text-sm text-[#C37C5A] font-medium text-center">Total Generation</p>
                            <p className="text-lg xl:text-xl font-semibold text-[#F3E5DE] pt-2" id="total-generation">{data.total_generation} kWh</p>
                        </div>
                        <div className="bg-[#051E1C] rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs xl:text-sm text-[#C37C5A] font-medium text-center">Total Consumption</p>
                            <p className="text-lg xl:text-xl font-semibold text-[#F3E5DE] pt-2" id="total-consumption">{data.total_consumption} kWh</p>
                        </div>
                        <div className="bg-[#051E1C] rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs xl:text-sm text-[#C37C5A] font-medium text-center">Total Cost</p>
                            <p className="text-lg xl:text-xl font-semibold text-[#F3E5DE] pt-2" id="total-savings">INR {data.total_saving}</p>
                        </div>
                    </div>

                    <div className="rounded-lg mr-0 p-4 bg-[#051e1c]">
                        <div className="ml-2">
                            <p className="text-white text-start text-base font-bold">Health Index</p>
                        </div>

                        <div className="flex ml-2 justify-between mt-5">
                            <div className="bg-[#F12D2D] h-[10px] w-[90%] mr-[10px] ml-0"></div>
                            <div className="h-[10px] w-[90%] mr-[10px] ml-0 bg-[#FD9C2B]"></div>
                            <div className="h-[10px] w-[90%] mr-[10px] ml-0 bg-[#FCDE2D] relative">
                                <div className="absolute -top-[1.75rem] xl:-top-[2.2rem] flex flex-col items-center justify-center" style={{ left: `${data.healthIndex}%` }}>
                                    <p className="text-white m-0 p-0 text-sm xl:text-base">{data.healthIndex}</p>
                                    <img src="assets/arrow.png" alt="Arrow" className="w-5 h-5 xl:w-6 xl:h-6 mt-1" />
                                </div>
                            </div>
                            <div className="h-[10px] w-[90%] mr-[10px] ml-0 bg-[#199E2E]"></div>
                        </div>

                        <div className="flex justify-between p-2 rounded-b-lg">
                            <div className="text-xs xl:text-sm whitespace-nowrap text-[#959999]">
                                Last Maintenance Date: <span id="last-maintenance" className="text-white">{data.maintainance_last_date}</span>
                            </div>

                            <div className="text-xs xl:text-sm whitespace-nowrap text-[#959999]">
                                Next Maintenance Date: <span id="next-maintenance" className="text-white">{data.next_maintainance_date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 rounded-lg">
                        <div className="bg-[#030F0E] p-4 rounded-lg flex-1">
                            <div className="flex flex-col items-start ml-2">
                                <h5 className="text-[#CACCCC] text-lg flex font-semibold">Fuel</h5>
                                <div className="mt-4 mb-3">
                                    <div className="w-44 h-12 flex items-center justify-center">
                                        <div className="progress-4"></div>
                                    </div>
                                </div>
                                <p className="text-[#CACCCC] text-sm xl:text-base">Tank Capacity - {data.tankCapacity} litres</p>
                                <p className="text-[#CACCCC] text-sm xl:text-base mt-2">Operational - {data.operational} hours</p>
                            </div>
                        </div>

                        <div className="bg-[#030F0E] p-4 rounded-lg flex-1">
                            <h5 className="text-[#CACCCC] xl:text-lg font-semibold text-base mb-5 flex justify-between">
                                Energy Consumption
                            </h5>

                            <div className='pb-2 justify-between mb-2 gap-5'>
                                <div className="w-full flex flex-col gap-2 mt-5">
                                    <div className="text-[#959999] text-sm xl:text-base text-start">Critical Load</div>
                                    <div className="flex flex-row items-center gap-2 w-full">
                                        <div className="bg-[#00283a] rounded-lg h-2 flex-grow">
                                            <div className="bg-[#48d0d0] rounded-lg h-full" style={{ width: `${data.critical_load}%` }}></div>
                                        </div>
                                        <h6 className="text-xs text-white mb-0" id="critical-load">{data.critical_load}%</h6>
                                    </div>
                                </div>
                                <div className="w-full flex flex-col gap-2 mt-5">
                                    <div className="text-[#959999] text-sm xl:text-base text-start">Non-Critical Load</div>
                                    <div className="flex flex-row items-center gap-2 w-full">
                                        <div className="bg-[#00283a] rounded-lg h-2 flex-grow">
                                            <div className="bg-[#d8d362] rounded-lg h-full" style={{ width: `${data.non_critical_load}%` }}></div>
                                        </div>
                                        <h6 className="text-xs text-white mb-0" id="critical-load">{data.non_critical_load}%</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Second Row Section */}
            <div className="grid grid-cols-2 gap-5 mt-2 ">
                {/* Left Section */}
                <div className="grid-item-left">
                    <div className="grid grid-cols-4 gap-2 mt-1">
                        <div className="grid grid-rows-2 mt-2">
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 gap-3 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <img src="assets/battery Temp.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="coolant-temp">{data.coolant_temp}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Coolant Temperature</p>
                            </div>
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex gap-3 flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <img src="assets/batteryV.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="power-generated-yesterday">{data.power_generated_yesterday}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Power Generated Yesterday</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 mt-2">
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <img src="assets/hours operated.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="hours-operated">{data.hours_operated_yesterday}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Hours operated Yesterday</p>
                            </div>
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <img src="assets/discharging1.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="battery-charged">{data.battery_charged}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Battery Charged</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 mt-2">
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between border border-red-500">
                                <div className="flex items-center justify-between">
                                    <img src="assets/oilpressure.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="oil-pressure">{data.oil_pressure}%</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Oil Pressure (PSI)</p>
                            </div>
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <img src="assets/utilisationF.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="utilisation-factor">{data.utilisation_factor}%</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Utilisation Factor</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 mt-2">
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <img src="assets/freq.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="frequency">{data.frequency}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Frequency (Hz)</p>
                            </div>
                            <div className="bg-[#051e1c] rounded-md mb-2 p-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <img src="assets/charging1.svg" alt='image' />
                                    <h6 className="text-[#F3E5DE] text-sm xl:text-base font-semibold" id="battery-charged">{data.power_factor}</h6>
                                </div>
                                <p className="text-sm xl:text-base text-[#AFB2B2] text-start">Power Factor</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid mt-2 rounded-md">
                        <div className="grid-item-left-down mt-2 bg-[#030F0E] mb-7 rounded-md">
                            <table className="table-style w-full border-collapse">
                                <thead className="bg-[#051E1C] text-[#68BFB6]">
                                    <tr className="text-xs xl:text-sm font-medium">
                                        <th className="whitespace-nowrap text-center p-5 xl:p-6 rounded-tl-lg"></th>
                                        <th className="text-center font-medium">Voltage (L-L)(V)</th>
                                        <th className="text-center font-medium">Voltage (L-N)(V)</th>
                                        <th className="text-center rounded-tr-lg font-medium">Current (Amp)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#030F0E] text-[#CACCCC]">
                                    <tr>
                                        <td className="text-center p-4 rounded-l-lg text-sm xl:text-base">L1 Phase</td>
                                        <td id="voltage-l-l-phase1" className="text-center p-4 text-sm xl:text-base">{data.voltagel.phase1}</td>
                                        <td id="voltage-l-n-phase1" className="text-center p-4 text-sm xl:text-base">{data.voltagen.phase1}</td>
                                        <td id="current-phase1" className="text-center p-4 text-sm xl:text-base">{data.current.phase1}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-center p-4 rounded-l-lg text-sm xl:text-base">L2 Phase</td>
                                        <td id="voltage-l-l-phase2" className="text-center p-4 text-sm xl:text-base">{data.voltagel.phase2}</td>
                                        <td id="voltage-l-n-phase2" className="text-center p-4 text-sm xl:text-base">{data.voltagen.phase2}</td>
                                        <td id="current-phase2" className="text-center p-4 text-sm xl:text-base">{data.current.phase2}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-center p-4 rounded-bl-lg text-sm xl:text-base">L3 Phase</td>
                                        <td id="voltage-l-l-phase3" className="text-center p-4 text-sm xl:text-base">{data.voltagel.phase3}</td>
                                        <td id="voltage-l-n-phase3" className="text-center p-4 text-sm xl:text-base">{data.voltagen.phase3}</td>
                                        <td id="current-phase3" className="text-center p-4 rounded-br-lg text-sm xl:text-base">{data.current.phase3}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Right Section */}
                <div className="grid-item-right">
                    <div className="grid-item-right-left">
                        <div className="grid-item-left-down mt-2">
                            <div className="p-2">
                                <div className="text-white text-[20px] flex justify-between items-start">
                                    <div className="mb-4 text-base xl:text-lg font-bold">
                                        Notifications
                                    </div>
                                    <div className="flex">
                                        <p className="flex items-center ml-4 text-[#AFB2B2] text-sm xl:text-base">
                                            Alert
                                            <svg className="ml-2" width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10.5" cy="11" r="10.5" fill="#41ACA1" />
                                                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial" id="alertlen">
                                                    {alertCount}
                                                </text>
                                            </svg>
                                        </p>

                                        <p className="flex items-center ml-4 text-[#AFB2B2] text-sm xl:text-base">
                                            Shutdown
                                            <svg className="ml-2" width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10.5" cy="11" r="10.5" fill="#EB5757" />
                                                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial" id="shutdownlen">
                                                    {shutdownCount}
                                                </text>
                                            </svg>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#030F0E] rounded-lg pb-2.5 overflow-y-auto h-[230px] xl:h-[260px]"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#0A3D38 #0F544C',
                                }}>
                                <table className="w-full border-collapse text-[#CACCCC] text-xs xl:text-sm">
                                    <thead className="bg-[#051E1C] text-left sticky top-0 z-20 text-[#68BFB6]">
                                        <tr className="text-xs xl:text-sm">
                                            <th className="px-3 xl:px-4 py-2 xl:py-3 rounded-tl-lg font-medium">Fault Code</th>
                                            <th className="px-3 py-2 font-medium">Description</th>
                                            <th className="px-3 py-2 font-medium">Severity</th>
                                            <th className="px-3 py-2 font-medium">Status</th>
                                            <th className="px-3 py-2 rounded-tr-lg font-medium">Date/Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#030F0E] capitalize text-[#CACCCC]" id="alert-container">
                                        {alertsData.filter(i => i.category === 'genset').map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-3 xl:px-4 py-4">{item.fault_code}</td>
                                                <td className="px-3 py-2">{item.description}</td>
                                                <td className={`px-3 py-3 whitespace-nowrap ${item.severity.toLowerCase() === 'alert' ? 'severity-alert' : item.severity.toLowerCase() === 'shutdown' ? 'severity-shutdown' : ''}`}>
                                                    {item.severity}
                                                </td>
                                                <td className='px-3 py-3' style={{ color: item.status.toLowerCase() === 'open' ? '#EB5757' : '#57EB66' }}>
                                                    {item.status}
                                                </td>
                                                <td className="px-3 py-2">{item.date_time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="grid-item-left-down mt-5 bg-[#030F0E] mb-7 rounded-lg pb-0">
                            <table className="table-style w-full border-collapse">
                                <thead className="thead-style bg-[#051E1C] text-[#68BFB6]">
                                    <tr className="text-xs xl:text-sm text-center font-medium">
                                        <th className="whitespace-nowrap p-3 rounded-tl-lg font-medium">Power</th>
                                        <th className="p-2 font-medium">Phase 1</th>
                                        <th className="p-2 font-medium">Phase 2</th>
                                        <th className="p-2 rounded-tr-lg font-medium">Phase 3</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#030F0E] text-center text-[#CACCCC]">
                                    <tr className='text-sm xl:text-base'>
                                        <td className="p-3">kW</td>
                                        <td id="kW-phase1" className="p-2">{data.kW.phase1}</td>
                                        <td id="kW-phase2" className="p-2">{data.kW.phase2}</td>
                                        <td id="kW-phase3" className="p-2">{data.kW.phase3}</td>
                                    </tr>
                                    <tr className='text-sm xl:text-base'>
                                        <td className="p-3 rounded-bl-lg">kVA</td>
                                        <td id="kVA-phase1" className="p-2">{data.kVA.phase1}</td>
                                        <td id="kVA-phase2" className="p-2">{data.kVA.phase2}</td>
                                        <td id="kVA-phase3" className="p-2 rounded-br-lg">{data.kVA.phase3}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Genset;