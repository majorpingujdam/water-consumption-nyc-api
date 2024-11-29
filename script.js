// Fetch data from the NYC Open Data API
const apiUrl = "https://data.cityofnewyork.us/resource/ia2d-e54m.json";

// Initial fetch and rendering
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const parsedData = data
      .map(d => ({
        year: +d.year,
        waterConsumption: +d.nyc_consumption_million_gallons_per_day || null,
      }))
      .filter(d => d.year && d.waterConsumption); // Remove invalid data points
    renderChart(parsedData);
  })
  .catch(error => console.error("Error fetching data:", error));

function renderChart(data) {
  // Chart dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  // Create SVG container
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.waterConsumption)])
    .range([height - margin.bottom, margin.top]);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .attr("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .attr("font-size", "12px");

  // Line generator
  const line = d3
    .line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.waterConsumption));

  // Append line to chart
  const path = svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Interaction: Update Data
  d3.select("#update-btn").on("click", function () {
    // Generate new random water consumption values
    const newData = data.map(d => ({
      ...d,
      waterConsumption: d.waterConsumption * (0.8 + Math.random() * 0.4),
    }));

    // Update line chart
    path
      .datum(newData)
      .transition()
      .duration(1000)
      .attr("d", line);

    // Change background color based on average water consumption
    const avgConsumption =
      newData.reduce((sum, d) => sum + d.waterConsumption, 0) / newData.length;
    const blueIntensity = Math.min(255, Math.max(100, Math.floor(avgConsumption / 5)));
    document.body.style.backgroundColor = `rgb(0, ${blueIntensity}, 255)`;
  });
}
