/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Chart from 'chart.js/auto';

const Overview = ({ BaseUrl}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const myDatavizRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const doughnutChartInstanceRef = useRef(null);
    const tooltipRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    let resizeTimeout = null;
    const [data, setData] = useState({});
    
    const fetchConfig = () => {
        fetch(`${BaseUrl}/overview`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    const sortedData = data.sort((a, b) => a.id - b.id);
                    console.log(sortedData)
                    setData(sortedData[sortedData.length - 1]);
                    setLoading(false);
                } else {
                    console.error("No data found in response.");
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    useEffect(() => {
        fetchConfig();

        const interval = setInterval(() => {
            fetchConfig();
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };


    const fetchData = () => {
        if (imageLoaded && !loading) {
            fetch('./dummy_data.json')
                .then((response) => response.json())
                .then((data) => {
                    const filteredData = data.graph.filter((d) => d.hour >= 8 && d.hour <= 16);
                    displayDataCurveGraph(filteredData);
                    const labels = data.pieChart.labels;
                    const values = data.pieChart.values;
                    displayDoughnutChart(labels, values);
                }).catch((error) => console.error('Error fetching data:', error));
        }

    };

    useEffect(() => {

        fetchData();

        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => fetchData(), 300);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (tooltipRef.current) {
                d3.select(tooltipRef.current).remove();
            }
        };
    }, [imageLoaded, loading]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        console.error('Image failed to load');
    };

    const displayDataCurveGraph = (data) => {

        if (!myDatavizRef.current || !myDatavizRef.current.parentElement) {
            console.error("Graph container or its parent doesn't exist.");
            return;
        }

        d3.select(myDatavizRef.current).selectAll('svg').remove();

        const margin = { top: 20, right: 30, bottom: 20, left: 20 };
        const width = myDatavizRef.current.parentElement.offsetWidth
            ? myDatavizRef.current.parentElement.offsetWidth - margin.left - margin.right
            : 500;
        const height = myDatavizRef.current.parentElement.offsetHeight - margin.top - margin.bottom;

        if (width <= 0) {
            console.error("Parent element has zero width.");
            return;
        }

        const svg = d3.select(myDatavizRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([8, 16]).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(data, (d) => +d.power)]).nice().range([height, 0]);

        // X axis
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(9).tickFormat(d => formatAMPM(d)))
            .selectAll('text').style('fill', 'white').style('font-size', width > 500 ? '14px' : '10px');

        // Y axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(() => ''))
            .selectAll('text').style('fill', 'white');

        // Add curve
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#68BFB6')
            .attr('stroke-width', 2)
            .attr('d', d3.line()
                .x(d => x(d.hour))
                .y(d => y(+d.power))
                .curve(d3.curveBasis)
            );

        // Define gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'shadowGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#0A3D38')
            .attr('stop-opacity', 0.9);

        gradient.append('stop')
            .attr('offset', '80%')
            .attr('stop-color', '#0A3D38')
            .attr('stop-opacity', 0);

        // Add shadow beneath the curve
        svg.append('path')
            .datum(data)
            .attr('fill', 'url(#shadowGradient)')
            .attr('stroke-width', 0)
            .attr('d', d3.area()
                .x(d => x(d.hour))
                .y0(height)
                .y1(d => y(+d.power))
                .curve(d3.curveBasis)
            );

        // Tooltip setup
        if (!tooltipRef.current) {
            tooltipRef.current = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);
        }
    };

    function formatAMPM(hour) {
        return hour >= 12
            ? hour === 12
                ? "12 PM"
                : hour - 12 + " PM"
            : hour === 0
                ? "12 AM"
                : hour + " AM";
    }

    const displayDoughnutChart = (labels, values) => {
        if (!doughnutChartRef.current) return;
        if (doughnutChartInstanceRef.current) {
            doughnutChartInstanceRef.current.destroy();
        }
        const ctx = doughnutChartRef.current.getContext('2d');
        doughnutChartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: [
                            'rgba(118, 171, 174, 1)',
                            'rgba(176, 197, 164, 1)',
                            'rgba(145, 149, 246, 1)',
                            'rgba(94, 136, 68, 1)',
                            'rgba(242, 193, 141, 1)',
                            'rgba(243, 165, 49, 1)',
                        ],
                        borderColor: [
                            'rgba(118, 171, 174, 1)',
                            'rgba(176, 197, 164, 1)',
                            'rgba(145, 149, 246, 1)',
                            'rgba(94, 136, 68, 1)',
                            'rgba(242, 193, 141, 1)',
                            'rgba(243, 165, 49, 1)',
                        ],
                        borderWidth: 1,
                        cutout: '70%',
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });
    };

    const images = [
        { src: "assets/image 12.png", label: "WIND", hours: !loading && data.wind.operatinghours, generations: !loading && data.wind.powergenerated },
        { src: "assets/image 13.png", label: "SOLAR", hours: !loading && data.solar.operatinghours, generations: !loading && data.solar.powergenerated },
        { src: "assets/image 11.png", label: "BIOGAS", hours: !loading && data.biogas.operatinghours, generations: !loading && data.biogas.powergenerated },
    ];

    return (
        !loading && <div className="p-4">
            {/* First Row Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* Left Section */}
                <div>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-3 transition-transform duration-500 gap-3 xl:gap-5 h-[45vh]"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {images.map((image, index) => (
                            <div key={index} className="relative flex-shrink-0 w-full">
                                <img
                                    src={image.src}
                                    alt={image.label}
                                    className="object-cover rounded-lg w-full h-full"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                                <div className="absolute bottom-[15%] left-[20%] transform translate-x-[-20%] translate-y-[20%] p-2 bg-transparent text-white rounded z-10 w-[90%] flex flex-col">
                                    <div className="font-bold text-xl">{image.label}</div>
                                    <div className="flex justify-between mt-3 text-sm">
                                        <p>Hours:</p>
                                        <p>{image.hours}</p>
                                    </div>
                                    <div className="flex justify-between mt-2 text-sm">
                                        <p>Generations:</p>
                                        <p>{image.generations}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-end mt-2 xl:mt-5 space-x-2">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className='h-2 w-2 rounded-full cursor-pointer bg-[#0F5B53]'
                            ></span>
                        ))}
                    </div>
                </div>

                {/* Right Section */}
                <div className="rounded mt-2 bg-[#030F0E] p-5" id="grid-it-rl2">
                    <div className="flex justify-between mb-4">
                        <h5 className="text-base xl:text-lg text-white">Energy Generated Today</h5>
                        <p className="text-[#7A7F7F] text-sm xl:text-base font-normal">Updated 15 min ago</p>
                    </div>

                    <p className="mt-2 text-white text-base xl:text-lg font-light mb-5">
                        Total Daily Generation:
                        <span className="bg-[#0821FF] text-sm xl:text-base rounded-full px-3 py-1 ml-2 inline-block font-extralight">
                            {data.daily_generation} kWh
                        </span>
                    </p>
                    <div className="mt-4">
                        <div
                            id="my_dataviz"
                            ref={myDatavizRef}
                            className="flex-1 h-[200px] xl:h-[300px]"

                        ></div>
                    </div>
                </div>
            </div>
            {/* Second Row Section */}
            <div className="grid grid-cols-[35.5%_63%] gap-4 pt-2">
                <div className="pie">
                    <div className="text-white flex mb-5 text-lg xl:text-xl">Energy Generation Comparison</div>

                    <div className="bg-[#051e1c] rounded-lg mt-4 h-[89%]">
                        <div className="flex justify-center items-center w-[250px] h-[250px] relative mx-auto">
                            <canvas id="myChart" ref={doughnutChartRef} className="w-full h-full" width={200} height={200}></canvas>
                        </div>

                        <div className="flex items-center p-5 justify-around mt-2">
                            <div className="flex flex-col justify-around gap-5 mr-5">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(243,165,49,1)] mr-2"></div>
                                    <span className="text-[#CACCCC]">Solar (20%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(118,171,174,1)] mr-2"></div>
                                    <span className="text-[#CACCCC]">Wind (10%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(94,136,68,1)] mr-2"></div>
                                    <span className="text-[#CACCCC] whitespace-nowrap">Biogas (30%)</span>
                                </div>
                            </div>

                            <div className="flex flex-col ml-2 gap-5 mr-5">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(145,149,246,1)] mr-2"></div>
                                    <span className="text-[#CACCCC]">ESS (10%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(176,197,164,1)] mr-2"></div>
                                    <span className="text-[#CACCCC]">Mains (15%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-[rgba(242,193,141,1)] mr-2"></div>
                                    <span className="text-[#CACCCC] whitespace-nowrap">Genset (5%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="text-white flex mb-2 text-lg xl:text-xl ">Energy Resources</div>
                    <div className="grid-item-left-down2 text-white">
                        <table className="table-auto w-full border-separate border-spacing-y-3">
                            <thead className="text-sm xl:text-base font-light">
                                <tr>
                                    <td className="whitespace-nowrap">Energy Source</td>
                                    <td>Operating Hours</td>
                                    <td>Power Generated</td>
                                    <td>Cost</td>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {[
                                    { src: './assets/Icons.png', name: 'Solar', hours: `${data.solar.operatinghours} hrs`, power: `${data.solar.powergenerated} kWh`, cost: data.solar.cost, costColor: '#57EB66' },
                                    { src: './assets/Icons-z.png', name: 'Wind', hours: data.wind.operatinghours + ' hrs', power: data.wind.powergenerated + 'kWh', cost: data.wind.cost, costColor: '#57EB66' },
                                    { src: './assets/Icons-y.png', name: 'Biogas', hours: data.biogas.operatinghours + ' hrs', power: data.biogas.powergenerated + ' kWh', cost: data.biogas.cost, costColor: '#57EB66' },
                                    { src: './assets/Icons-x.png', name: 'ESS', hours: data.ess.operatinghours + ' hrs', power: data.ess.powergenerated + ' kWh', cost: data.ess.cost, costColor: '#57EB66' },
                                    { src: './assets/Icons-w.png', name: 'Genset', hours: data.genset.operatinghours + ' hrs', power: data.genset.powergenerated + ' kWh', cost: data.genset.cost, costColor: '#EB5757' },
                                    { src: './assets/Icons-u.png', name: 'Mains', hours: data.mains.operatinghours + ' hrs', power: data.mains.powergenerated + ' kWh', cost: data.mains.cost, costColor: '#EB5757' },
                                ].map((item, index) => (
                                    <tr key={index}>
                                        <td className="bg-[#051E1C] text-[#CACCCC] text-base xl:text-lg flex items-center gap-2 p-4 rounded-tl-lg rounded-bl-lg">
                                            <img src={item.src} alt={item.name} />
                                            {item.name}
                                        </td>
                                        <td className="bg-[#051E1C] text-[#CACCCC] text-base xl:text-lg">{item.hours}</td>
                                        <td className="bg-[#051E1C] text-[#CACCCC] text-base xl:text-lg">{item.power}</td>
                                        <td className="bg-[#051E1C] text-[#CACCCC] text-base xl:text-lg rounded-tr-lg rounded-br-lg" style={{ color: item.costColor }}>{item.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Third Row Section */}
            <div className="grid grid-cols-[36%_22%_22%_17%] mt-2 gap-4 mr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#051e1c] rounded-lg flex flex-col justify-around items-center">
                        <img src="assets/Vector 3.svg" className="p-1.5 w-[160px]" alt='image' />
                        <div className="flex flex-col items-start p-1.5 ml-2.5">
                            <h6 id="avg-kw" className="text-white text-lg mb-1.5">{data.average_power_kw} kW</h6>
                            <p className="text-[#7A7F7F] text-sm xl:text-base mb-1.5">Average Power (kWh)</p>
                        </div>
                    </div>
                    <div className="bg-[#051e1c] rounded-lg flex flex-col justify-around items-center">
                        <img src="assets/Frame 1000001841.svg" className="p-1.5 w-[160px]" alt='image' />
                        <div className="flex flex-col items-start p-1.5 ml-2.5">
                            <h6 id="avg-kv" className="text-white text-lg mb-1.5">{data.average_power_kva} kW</h6>
                            <p className="text-[#7A7F7F] text-sm xl:text-base mb-1.5 ">Average Power (kVA)</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 justify-between">
                    <div className="bg-[#051e1c] rounded-lg flex flex-col justify-between p-5">
                        <div className="flex items-center">
                            <img src="assets/Icons.svg" className="pr-2.5" alt='image' />
                            <h6 className="text-base xl:text-lg font-medium text-white">Mains</h6>
                        </div>
                        <div className="flex justify-between items-start flex-row mt-5 ">
                            <p className="text-[#7A7F7F] text-sm xl:text-base">Operated Yesterday</p>
                            <p id="mains" className="text-[#CACCCC] text-base xl:text-lg ml-1 whitespace-nowrap">{data.mains_operated_yesterday} Hrs</p>
                        </div>
                    </div>
                    <div className="bg-[#051e1c] rounded-lg flex flex-col justify-between p-5">
                        <div className="flex items-center">
                            <img src="assets/Icons (2).svg" className="pr-2.5" alt='image' />
                            <h6 className="text-base xl:text-lg font-medium text-white">Genset</h6>
                        </div>
                        <div className="flex justify-between items-start flex-row mt-5">
                            <p className="text-[#7A7F7F] text-sm xl:text-base">Operated Yesterday</p>
                            <p id="genset" className="text-[#CACCCC] text-base xl:text-lg ml-1 whitespace-nowrap">{data.genset_operated_yesterday} Hrs</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 justify-between">
                    <div className="bg-[#051e1c] rounded-lg flex justify-start items-center p-[26px] h-full">
                        <div>
                            <svg width="60" height="60" viewBox="0 0 38 38">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0F5B53" strokeWidth="5" strokeDasharray="100, 100" strokeLinecap="round" />
                                <path id="myPathess" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#48D0D0" strokeWidth="5" strokeDasharray={`${data.ess_energy_stored}, 100`} strokeLinecap="round" />
                                <text x="18" y="20.35" textAnchor="middle" fontSize="8px" fill="white" fontFamily="Arial" id="ess">{data.ess_energy_stored}%</text>
                            </svg>
                        </div>
                        <p className="text-sm xl:text-base text-[#CACCCC] ml-5">Energy Stored (ESS)</p>
                    </div>
                    <div className="bg-[#051e1c] rounded-lg flex justify-start items-center p-[26px] h-full">
                        <div>
                            <svg width="60" height="60" viewBox="0 0 37 37">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0F5B53" strokeWidth="5" strokeDasharray="100, 100" strokeLinecap="round" />
                                <path id="myPathsoc" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#D8D362" strokeWidth="5" strokeDasharray={`${data.soc_ess}, 100`} strokeLinecap="round" />
                                <text x="18" y="20.35" textAnchor="middle" fontSize="8px" fill="white" fontFamily="Arial" id="soc">{data.soc_ess}%</text>
                            </svg>
                        </div>
                        <p className="text-sm xl:text-base text-[#CACCCC] ml-5">SOC (ESS)</p>
                    </div>
                </div>
                <div className="flex flex-col h-full">
                    <div className="p-4 flex flex-col justify-evenly bg-[#051e1c] rounded-lg h-full">
                        <div className="flex items-center">
                            <img src="assets/dollar.svg" className="w-[35px]" alt='image' />
                            <p className="text-white ml-3">Savings</p>
                        </div>
                        <div className="mt-2 ml-2">
                            <p id="savings" className="text-white my-1.5 text-lg xl:text-xl">INR {data.savings.savings}</p>
                            <p className="text-[#959999] mt-1.5 text-xs xl:text-sm">(per month)</p>
                        </div>
                        <div className="mt-4 ml-2">
                            <p id="savingt" className="text-white my-1.5 text-lg xl:text-xl">INR {data.savings.savingt}</p>
                            <p className="text-[#959999] my-1.5 text-xs xl:text-sm">(till date)</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Fourth Row Section */}
            <div className="grid grid-cols-[36%_18%_44%] gap-4 pr-3 pb-5 mt-3.5">
                <div className="grid">
                    <div className="bg-[#051e1c] rounded-lg pr-5 flex flex-col justify-evenly">
                        <div className="flex items-center justify-between gap-5 ml-5">
                            <div className="text-white text-start text-sm xl:text-base m-0 flex justify-start ">
                                <img src="assets/pink.svg" className="mr-2.5 align-middle inline-block" alt="Energy Icon" />
                                Total Energy Generated
                            </div>
                            <div className="text-white text-lg ml-2.5 m-0 md:text-base text-nowrap" id="total">{data.energy.total} (kWh)</div>
                        </div>
                        <div className="mb-0">
                            <div className="flex items-center justify-between ml-5 mb-3">
                                <p className="text-sm xl:text-base text-[#AFB2B2] m-0">From Renewable Resources</p>
                                <p className="text-sm xl:text-base text-[#AFB2B2] m-0 ml-2.5 whitespace-nowrap" id="renew">{data.energy.renewable} (kWh)</p>
                            </div>
                            <div className="flex items-center justify-between ml-5 mb-0">
                                <p className="text-sm xl:text-base text-[#AFB2B2] m-0">From Non-Renewable Resources</p>
                                <p className="text-sm xl:text-base text-[#AFB2B2] m-0 ml-2.5 whitespace-nowrap" id="non-renew">{data.energy.nonrenewable} (kWh)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-rows-2 gap-4">
                    <div className="bg-[#051e1c] rounded-lg p-5 flex items-center justify-between">
                        <div className="h-2.5 w-2.5 bg-[#FFAF12] rounded-full"></div>
                        <p className="text-[#7A7F7F] text-base xl:text-lg">Alerts</p>
                        <div className="text-white text-xl xl:text-2xl" id="alerts">{data.alerts}</div>
                    </div>
                    <div className="bg-[#051e1c] rounded-lg p-5 flex items-center justify-between">
                        <div className="h-2.5 w-2.5 bg-red-600 rounded-full"></div>
                        <p className="text-[#7A7F7F] text-base xl:text-lg">Shutdowns</p>
                        <div className="text-white text-xl xl:text-2xl" id="shutdown">{data.shutdown}</div>

                    </div>
                </div>

                <div className="flex w-full gap-4">
                    <div className="flex-1 bg-[#051e1c] rounded-lg p-2">
                        <img src="assets/Icons (9).svg" className="p-3" alt="Current Icon" />
                        <div className="flex flex-col justify-center mt-5">
                            <h6 id="av-current" className="text-white text-xl xl:text-2xl ml-2 mb-5 font-semibold">{data.av_current_amp}A</h6>
                            <p className="text-sm xl:text-base text-[#7A7F7F] ml-2">Average Current (Amp.)</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#051e1c] rounded-lg p-2">
                        <img src="assets/Icons (8).svg" className="p-3" alt="Voltage Icon" />
                        <div className="flex flex-col justify-center mt-5">
                            <h6 id="averagel" className="text-white text-xl xl:text-2xl ml-2 mb-5 font-semibold">{data.average_voltagel}V</h6>
                            <p className="text-sm xl:text-base text-[#7A7F7F] ml-2">Avg. Voltage (L-L) (Volts)</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#051e1c] rounded-lg p-2">
                        <img src="assets/Icons (7).svg" className="p-3" alt="Voltage Icon" />
                        <div className="flex flex-col justify-center mt-5">
                            <h6 id="averagen" className="text-white text-xl xl:text-2xl ml-2 mb-5 font-semibold">{data.average_voltagen}V</h6>
                            <p className="text-sm xl:text-base text-[#7A7F7F] ml-2">Avg. Voltage (L-N) (Volts)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}


export default Overview;