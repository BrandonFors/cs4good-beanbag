import React, { useState, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import Chart from "chart.js/auto";
import axios from "axios";

function ChartPage() {
  const [data, setData] = useState([]);
  const chartRefs = useRef([]);
  const colors = ["#0C2340", "#0A2355", "#06268A", "#042B96"];

  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get("https://cs4good-beanbag.onrender.com/get_scores");
        if (response.data) {
          console.log(response.data);
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getData();
    const interval = setInterval(getData, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    Chart.defaults.font.size = 14;
    Chart.defaults.color = "black";

    // Destroy existing charts before recreating
    chartRefs.current.forEach((chart) => {
      if (chart) chart.destroy();
    });

    // Find the maximum Y-axis value across all datasets
    const maxY = Math.max(
      ...data.flatMap((team) => team.freq),
      10 // Ensure a reasonable minimum
    );

    // Chart plugin to draw the red arrow at the mean position
    const meanArrowPlugin = {
      id: "meanArrow",
      afterDatasetsDraw(chart) {
        const { ctx, scales } = chart;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const mean = data[datasetIndex]?.mean;
          if (mean === undefined) return;

          // Find X position for mean
          const xPosition = scales.x.getPixelForValue(mean);
          const yPosition = scales.y.bottom + 10; // Below the X-axis

          // Draw red arrow
          ctx.save();
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.moveTo(xPosition, yPosition);
          ctx.lineTo(xPosition - 5, yPosition + 10);
          ctx.lineTo(xPosition + 5, yPosition + 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      },
    };

    // Register the plugin globally
    Chart.register(meanArrowPlugin);

    // Create new charts
    chartRefs.current = data.map((el, index) => {
      const ctx = document.getElementById(`chart-${index}`);
      if (!ctx) return null;

      return new Chart(ctx, {
        type: "bar",
        options: {
          animation: false,
          maintainAspectRatio: false, // Allow manual control over size
          responsive: true,

          scales: {
            y: {
              min: 0,
              max: maxY, // Apply the same max value to all graphs
              ticks: {
                stepSize: Math.ceil(maxY / 5), // Ensure readable steps
              },
              grid: { color: "black" },
            },
            x: {
              grid: { color: "black" },
            },
          },
        },
        data: {
          labels: ["Ring 0", "Ring 1", "Ring 2", "Ring 3", "Ring 4"],
          datasets: [
            {
              label: "Frequency",
              data: el.freq,
              backgroundColor: colors,
              borderColor: "black",
              borderWidth: 2,
            },
          ],
        },
        plugins: [meanArrowPlugin], // Attach the arrow plugin
      });
    });

    return () => {
      chartRefs.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
    };
  }, [data]);

  return (
    <div className="chart-page-container">
      <NavBar />
      <div className="chart-container">
        {data.map((el, index) => (
          <div key={index}>
            <h2>{el.team}</h2>
            <div className="barChart">
              <canvas id={`chart-${index}`} />
            </div>
            <h2>Spread: {el.stdv.toFixed(2)}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartPage;
