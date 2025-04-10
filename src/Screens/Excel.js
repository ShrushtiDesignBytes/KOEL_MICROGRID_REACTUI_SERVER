import React, { useState, useRef, useEffect } from 'react';
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineCalendarToday } from "react-icons/md";
import ExcelJS from "exceljs";


const Excel = ({ BaseUrl }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isLoadingV, setIsLoadingV] = useState(false);
    const [isPressedV, setIsPressedV] = useState(false);
    const [energySource, setEnergySource] = useState("all");
    const [category, setCategory] = useState("savings");
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);

    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        now.setHours(0, 5, 0, 0); // Set time to 00:05
        return now;
    });
    const [endDate, setEndDate] = useState(() => {
        const now = new Date();
        now.setHours(23, 55, 0, 0); // Set time to 23:55
        return now;
    });
    const datepickerRef = useRef(null);
    const datepickerendRef = useRef(null);

    const handleEnergySourceChange = (e) => {
        const value = e.target.value;
        setEnergySource(value);

        // Automatically update category
        if (value === "all") {
            setCategory("savings");
        } else {
            setCategory("energy generated");
        }

        setShowTable(prev => !prev);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategory(value);

        // Automatically update category
        if (value === "savings") {
            setEnergySource("all");
        } else {
            setEnergySource("solar");
        }

        setShowTable(prev => !prev);
    };

    const formatDateWithOffset = (dateString) => {
        const date = new Date(dateString);

        // Subtract 5 hours 30 minutes (5 * 60 + 30 = 330 minutes)
        date.setMinutes(date.getMinutes() - 330);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formatDateLocal = (dateString) => {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleStartIconClick = () => {
        if (datepickerRef.current) {
            datepickerRef.current.setOpen(true);
        }
    };

    const handleEndIconClick = () => {
        if (datepickerendRef.current) {
            datepickerendRef.current.setOpen(true);
        }
    };


    const fetchPowerData = async () => {
        //console.log(startDate, endDate)
        const startd = formatDateLocal(startDate);
        const endd = formatDateLocal(endDate)

        const enddT = formatDateWithOffset(endDate);

        // console.log(startd, endd)
        const today = formatDateLocal(new Date());

        try {
            const requestBody = { fromDate: startd };
            if (endd !== today) {
                requestBody.toDate = enddT; // Only include toDate if it's not today
            }

            const [solarRes, mainsRes, gensetRes] = await Promise.all([
                fetch(`${BaseUrl}/solar/report`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }).then((res) => res.json()),

                fetch(`${BaseUrl}/mains/report`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }).then((res) => res.json()),

                fetch(`${BaseUrl}/genset/report`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }).then((res) => res.json())
            ]);

            // console.log("Solar Data:", solarRes);
            // console.log("Mains Data:", mainsRes);
            // console.log("Genset Data:", gensetRes);

            return { solar: solarRes, mains: mainsRes, genset: gensetRes };
        } catch (error) {
            console.error("Error fetching power data:", error);
            return { solar: [], mains: [], genset: [] };
        }
    };

    const handleView = async (energySource, category) => {
        console.log(energySource, category);

        setIsLoadingV(true);
        setIsPressedV(true);

        const data = await viewExcel(energySource, category);
        setTableData(data);


        setShowTable(prev => !prev);

        setIsLoadingV(false);
        setTimeout(() => setIsPressedV(false), 200);
    }


    const viewExcel = async (energySource, category) => {
        if (energySource === 'all') {

            const { solar, mains, genset } = await fetchPowerData();

            const combinedData = {};


            solar.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`; // Unique key using date + minute
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].solar_kwh = kwh_reading;
                combinedData[key].solar_unit = unit_generation;
            });

            mains.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`;
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].mains_kwh = kwh_reading;
                combinedData[key].mains_unit = unit_generation;
            });

            genset.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`;
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].genset_kwh = kwh_reading;
                combinedData[key].genset_unit = unit_generation;
            });


            // Calculate total power for each hour
            Object.values(combinedData).forEach((item) => {
                item.Total = item.solar_kwh + item.mains_kwh + item.genset_kwh;
            });

            // Calculate total power for each hour
            Object.values(combinedData).forEach((item) => {
                if (item.solar_kwh > 0 && item.mains_kwh > 0) {
                    item.Savings = parseFloat((item.solar_kwh * 6.6).toFixed(2));
                } else if (item.solar_kwh > 0 && item.genset_kwh > 0) {
                    item.Savings = parseFloat((item.solar_kwh * 18.4).toFixed(2));
                } else if (item.solar_kwh <= 0) {
                    item.Savings = 0;
                }
            });


            // Convert to array
            return Object.values(combinedData);

        } else {
            if (energySource === 'solar' || energySource === 'main' || energySource === 'genset') {
                console.log(energySource)
                const { solar, mains, genset } = await fetchPowerData();

                const combinedData = {};

                const addToCombined = (data, source) => {
                    data.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                        const key = `${date} ${minute}`;
                        if (!combinedData[key]) {
                            combinedData[key] = {
                                Date: date,
                                Hour: minute,
                            };
                        }
                        combinedData[key][`${source}_kwh`] = kwh_reading;
                        combinedData[key][`${source}_unit`] = unit_generation;
                    });
                };

                if (energySource === 'solar') {
                    addToCombined(solar, 'solar');
                } if (energySource === 'main') {
                    addToCombined(mains, 'mains');
                } if (energySource === 'genset') {
                    addToCombined(genset, 'genset');
                }

                return Object.values(combinedData);
            }
        }

    }


    const downloadExcel = async (energySource, category) => {
        console.log(energySource, category);

        setIsLoading(true);
        setIsPressed(true);

        if (energySource === 'all') {

            const { solar, mains, genset } = await fetchPowerData();

            const combinedData = {};


            solar.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`; // Unique key using date + minute
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].solar_kwh = kwh_reading;
                combinedData[key].solar_unit = unit_generation;
            });

            mains.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`;
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].mains_kwh = kwh_reading;
                combinedData[key].mains_unit = unit_generation;
            });

            genset.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`;
                if (!combinedData[key]) combinedData[key] = { Date: date, Hour: minute, solar_kwh: 0, solar_unit: 0, mains_kwh: 0, mains_unit: 0, genset_kwh: 0, genset_unit: 0, Total: 0, Savings: 0 };
                combinedData[key].genset_kwh = kwh_reading;
                combinedData[key].genset_unit = unit_generation;
            });


            // Calculate total power for each hour
            Object.values(combinedData).forEach((item) => {
                item.Total = item.solar_kwh + item.mains_kwh + item.genset_kwh;
            });

            // Calculate total power for each hour
            Object.values(combinedData).forEach((item) => {
                if (item.solar_kwh > 0 && item.mains_kwh > 0) {
                    item.Savings = parseFloat((item.solar_kwh * 6.6).toFixed(2));
                } else if (item.solar_kwh > 0 && item.genset_kwh > 0) {
                    item.Savings = parseFloat((item.solar_kwh * 18.4).toFixed(2));
                } else if (item.solar_kwh <= 0) {
                    item.Savings = 0;
                }
            });


            // Convert to array
            const finalData = Object.values(combinedData);

            setTableData(finalData);

            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Hourly Power Data");

            // Merge cells for multi-row and multi-column headers
            worksheet.mergeCells("A1:A3"); // Date (rowspan 3)
            worksheet.getCell("A1").value = "Date";
            worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("B1:B3"); // Hour (rowspan 3)
            worksheet.getCell("B1").value = "Hour";
            worksheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("C1:H1"); // Energy Generation (colspan 6, rowspan 1)
            worksheet.getCell("C1").value = "Energy Generation";
            worksheet.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("I1:I3"); // Total Load (rowspan 3)
            worksheet.getCell("I1").value = "Total";
            worksheet.getCell("I1").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("J1:J3"); // Savings (rowspan 3)
            worksheet.getCell("J1").value = "Savings";
            worksheet.getCell("J1").alignment = { horizontal: "center", vertical: "middle" };

            // Second row: Solar, Mains, Genset each spanning two columns
            worksheet.mergeCells("C2:D2"); // Solar (colspan 2, rowspan 1)
            worksheet.getCell("C2").value = "Solar";
            worksheet.getCell("C2").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("E2:F2"); // Mains (colspan 2, rowspan 1)
            worksheet.getCell("E2").value = "Mains";
            worksheet.getCell("E2").alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("G2:H2"); // Genset (colspan 2, rowspan 1)
            worksheet.getCell("G2").value = "Genset";
            worksheet.getCell("G2").alignment = { horizontal: "center", vertical: "middle" };

            // Third row: kWh Reading & Unit Generated under each section
            worksheet.getCell("C3").value = "kWh Reading";
            worksheet.getCell("D3").value = "Unit Generated";
            worksheet.getCell("E3").value = "kWh Reading";
            worksheet.getCell("F3").value = "Unit Generated";
            worksheet.getCell("G3").value = "kWh Reading";
            worksheet.getCell("H3").value = "Unit Generated";

            // Bold and center align headers
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.alignment = { horizontal: "center", vertical: "middle", width: 15 };
                });
            });

            // Define column widths
            worksheet.columns = [
                { key: "Date", width: 15 },
                { key: "Hour", width: 15 },
                { key: "solar_kwh", width: 15 },
                { key: "solar_unit", width: 15 },
                { key: "mains_kwh", width: 15 },
                { key: "mains_unit", width: 15 },
                { key: "genset_kwh", width: 15 },
                { key: "genset_unit", width: 15 },
                { key: "Total", width: 12 },
                { key: "Savings", width: 12 },

            ];


            worksheet.getRow(1).font = { bold: true, size: 12 };

            // console.log(finalData)
            // Add rows to the worksheet
            worksheet.addRows(finalData);

            // Apply alignment to all cells (centered horizontally and vertically)
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            });


            // Download the file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const today = new Date().toISOString().split('T')[0];
            link.download = `${today}_CMKL_Microgrid_Report.xlsx`;
            link.click();

            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            if (energySource === 'solar' || energySource === 'main' || energySource === 'genset') {
                await exportEnergyData(energySource);
            }
        }

        setIsLoading(false);
        setTimeout(() => setIsPressed(false), 200);
    };

    const exportEnergyData = async (energySource) => {
        console.log(energySource)
        const { solar, mains, genset } = await fetchPowerData();

        const combinedData = {};

        const addToCombined = (data, source) => {
            data.forEach(({ date, minute, kwh_reading, unit_generation }) => {
                const key = `${date} ${minute}`;
                if (!combinedData[key]) {
                    combinedData[key] = {
                        Date: date,
                        Hour: minute,
                    };
                }
                combinedData[key][`${source}_kwh`] = kwh_reading;
                combinedData[key][`${source}_unit`] = unit_generation;
            });
        };

        if (energySource === 'solar') {
            addToCombined(solar, 'solar');
        } if (energySource === 'main') {
            addToCombined(mains, 'mains');
        } if (energySource === 'genset') {
            addToCombined(genset, 'genset');
        }

        const finalData = Object.values(combinedData);

        console.log(finalData)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Hourly Power Data");

        // Header definitions based on energy source
        const energyLabelMap = {
            solar: { title: "Solar", keys: ["solar_kwh", "solar_unit"] },
            main: { title: "Mains", keys: ["mains_kwh", "mains_unit"] },
            genset: { title: "Genset", keys: ["genset_kwh", "genset_unit"] }
        };

        const { title, keys } = energyLabelMap[energySource];

        // Merge and set main headers
        worksheet.mergeCells("A1:A3");
        worksheet.getCell("A1").value = "Date";
        worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

        worksheet.mergeCells("B1:B3");
        worksheet.getCell("B1").value = "Hour";
        worksheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };

        worksheet.mergeCells("C1:D1");
        worksheet.getCell("C1").value = title;
        worksheet.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };

        worksheet.getCell("C2").value = "kWh Reading";
        worksheet.getCell("D2").value = "Unit Generated";

        // Set column widths
        worksheet.columns = [
            { key: "Date", width: 15 },
            { key: "Hour", width: 15 },
            { key: keys[0], width: 15 },
            { key: keys[1], width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true, size: 12 };

        // Format header rows
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.font = { bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        });

        worksheet.addRows(finalData);

        // Align all rows
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
        });

        // Download logic
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const today = new Date().toISOString().split('T')[0];
        link.download = `${today}_CMKL_Microgrid_Report.xlsx`;
        link.click();

        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const headers = Array.isArray(tableData) && tableData.length > 0
        ? Object.keys(tableData[0])
        : [];


    return (

        <div className="h-screen">
            <div className='text-[#F3E5DE] text-sm pl-4'>Reports</div>
            <div className="flex gap-10 p-4 text-[#CACCCC] font-poppins">
                {/* Energy Source Dropdown */}
                <div className="flex flex-col">
                    <label className="text-sm mb-3 text-[#959999]">Energy Source</label>
                    <select
                        className="bg-[#0A3D38] text-white p-2 rounded-md w-60"
                        onChange={handleEnergySourceChange}
                        value={energySource}
                    >
                        <option value="all">All plants</option>
                        <option value="solar">Solar plants</option>
                        <option value="main">Mains plants</option>
                        <option value="genset">Genset plants</option>
                        <option value="wind" disabled>Wind plants</option>
                        <option value="ess" disabled>Ess plants</option>
                        <option value="biogas" disabled>Biogas plants</option>

                    </select>
                </div>

                {/* Date Range Picker */}
                <div className="flex flex-col">
                    <label className="text-sm mb-3 text-[#959999]">Date Range</label>
                    <div className='flex'>
                        <div className="relative flex justify-between items-center bg-[#0A3D38] text-white p-2 rounded-md w-52">
                            <input
                                type="text"
                                value={startDate ? `${startDate.getFullYear()}.${(startDate.getMonth() + 1).toString().padStart(2, '0')}.${startDate.getDate().toString().padStart(2, '0')}` : ""}
                                readOnly
                                className="bg-transparent focus:outline-none w-[120px] cursor-default"
                            />
                            <MdOutlineCalendarToday
                                className="absolute right-2"
                                size={18}
                                onClick={handleStartIconClick}
                            />
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    const updatedDate = new Date(date);
                                    updatedDate.setHours(0, 5, 0, 0); // Ensure the selected date keeps the time at 00:05
                                    setStartDate(updatedDate);
                                }}
                                ref={datepickerRef}
                                dateFormat="dd.MM.yyyy"
                                className="hidden"
                                popperClassName="!z-50"
                                maxDate={endDate}
                            />
                        </div>
                        <span className="mx-2 text-[#68BFB6] mt-2">-</span>
                        <div className="relative flex justify-between items-center bg-[#0A3D38] text-white p-2 rounded-md w-52">
                            <input
                                type="text"
                                value={endDate ? `${endDate.getFullYear()}.${(endDate.getMonth() + 1).toString().padStart(2, '0')}.${endDate.getDate().toString().padStart(2, '0')}` : ""}
                                readOnly
                                className="bg-transparent focus:outline-none w-[120px] cursor-default"
                            />
                            <MdOutlineCalendarToday
                                className="absolute right-2"
                                size={18}
                                onClick={handleEndIconClick}
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                ref={datepickerendRef}
                                dateFormat="dd.MM.yyyy"
                                className="hidden"
                                popperClassName="!z-50"
                                minDate={startDate}
                            />
                        </div>
                    </div>
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col">
                    <label className="text-sm mb-3 text-[#959999]">Category</label>
                    <select
                        className="bg-[#0A3D38] text-white p-2 rounded-md w-60"
                        value={category}
                        onChange={handleCategoryChange}
                    >
                        <option value="energy generated">Energy Generated</option>
                        <option value="savings">Savings</option>
                    </select>
                </div>
            </div>
            <div className='p-4 flex justify-between'>
                <div className='py-2 text-[#7A7F7F] text-sm'>
                    {showTable ? `${tableData.length} results` : '0 results'}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleView(energySource, category)}
                        className={`px-5 flex items-center justify-center rounded-md shadow-md transition 
                     ${isLoadingV ? "bg-gray-500 cursor-not-allowed" : " hover:border-[#68BFB6] hover:border-4 bg-[#41ACA1]"} 
                    ${isPressedV ? "scale-95" : "scale-100"}`}
                        disabled={isLoadingV}
                    >

                        <p className='text-[#031210] text-sm'>{isLoadingV ? "Loading..." : "View "}</p>
                        <div
                            className={`transition-transform text-white pl-2`}
                        >
                            {showTable ? <FaEye color='#031210' className='w-4 h-4' />
                                : <FaEyeSlash color='#031210' className='w-4 h-4' />}
                        </div>

                    </button>
                    <button
                        onClick={() => downloadExcel(energySource, category)}
                        className={`px-5 flex items-center justify-center rounded-md shadow-md transition 
                    ${isLoading ? "bg-gray-500 cursor-not-allowed" : " hover:border-[#68BFB6] hover:border-4 bg-[#41ACA1]"} 
                    ${isPressed ? "scale-95" : "scale-100"}`}
                        disabled={isLoading}
                    >

                        <p className='text-[#031210] text-sm'>{isLoading ? "Downloading..." : "Export "}</p>
                        <div
                            className={`transition-transform ${isLoading ? "rotate-180" : ""
                                } text-white`}
                        >
                            <RiArrowDropDownLine color='#031210' className='w-6 h-6' />
                        </div>

                    </button>

                </div>
            </div>
            {Array.isArray(tableData) && tableData.length > 0 && showTable && (
                <div className="max-h-[420px] xl:max-h-[650px] overflow-hidden rounded-lg p-4">
                    <div className="overflow-y-auto max-h-[400px] xl:max-h-[600px] scrollbar-hide rounded-lg">
                        <table className="w-full text-sm text-center bg-[#030F0E]">
                            <thead className="bg-[#051E1C] text-[#68BFB6] text-[1rem] sticky top-0 z-10">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="p-5 capitalize text-nowrap bg-[#051E1C]">
                                            {header.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, idx) => (
                                    <tr key={idx} className="text-[#CACCCC]">
                                        {headers.map((key, keyIndex) => (
                                            <td key={keyIndex} className="p-3 text-nowrap">
                                                {row[key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            )}




        </div>
    );

}

export default Excel;