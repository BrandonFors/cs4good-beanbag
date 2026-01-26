import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";

function CalculationsPage() {
  const { teamIndex } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get("https://cs4good-beanbag-codt.onrender.com/get_scores");
        if (response.data && response.data[teamIndex]) {
          setTeamData(response.data[teamIndex]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    getData();
  }, [teamIndex]);

  const handleBackToCharts = () => {
    navigate("/charts");
  };

  if (loading) {
    return (
      <div className="calculations-page-container">
        <NavBar />
        <div className="calculations-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="calculations-page-container">
        <NavBar />
        <div className="calculations-content">
          <p>Team data not found.</p>
          <button className="back-to-charts-button" onClick={handleBackToCharts}>
            Back to Charts
          </button>
        </div>
      </div>
    );
  }

  // Calculate total throws
  const totalThrows = teamData.freq.reduce((sum, count) => sum + count, 0);

  // Calculate weighted sum for the mean
  const ringLabels = [0, 1, 2, 3, 4, 5];
  const weightedValues = teamData.freq.map((count, index) => count * ringLabels[index]);
  const weightedSum = weightedValues.reduce((sum, val) => sum + val, 0);

  return (
    <div className="calculations-page-container">
      <NavBar />
      <div className="calculations-content">
        <h1 className="calculations-title">{teamData.team} - Average Calculation</h1>
        
        <div className="calculation-section">
          <h2>Step 1: Count Throws per Ring</h2>
          <div className="calculation-table">
            <div className="table-header">
              <span>Ring</span>
              <span>Number of Throws</span>
            </div>
            {teamData.freq.map((count, index) => (
              <div className="table-row" key={index}>
                <span>Ring {index}</span>
                <span>{count}</span>
              </div>
            ))}
            <div className="table-row total-row">
              <span>Total Throws</span>
              <span>{totalThrows}</span>
            </div>
          </div>
        </div>

        <div className="calculation-section">
          <h2>Step 2: Calculate Weighted Sum</h2>
          <p className="calculation-explanation">
            Multiply each ring number by the number of throws that landed on that ring:
          </p>
          <div className="calculation-table">
            <div className="table-header">
              <span>Ring</span>
              <span>Throws</span>
              <span>Ring × Throws</span>
            </div>
            {teamData.freq.map((count, index) => (
              <div className="table-row" key={index}>
                <span>Ring {index}</span>
                <span>{count}</span>
                <span>{index} × {count} = {weightedValues[index]}</span>
              </div>
            ))}
            <div className="table-row total-row">
              <span colSpan="2">Weighted Sum</span>
              <span>{weightedSum}</span>
            </div>
          </div>
        </div>

        <div className="calculation-section">
          <h2>Step 3: Calculate the Average</h2>
          <p className="calculation-explanation">
            Divide the weighted sum by the total number of throws:
          </p>
          <div className="calculation-formula">
            <div className="formula">
              Average = Weighted Sum ÷ Total Throws
            </div>
            <div className="formula">
              Average = {weightedSum} ÷ {totalThrows} = <strong>{totalThrows > 0 ? (weightedSum / totalThrows).toFixed(2) : 0}</strong>
            </div>
          </div>
        </div>

        <div className="calculation-section">
          <h2>Final Result</h2>
          <div className="final-result">
            <span>Average Ring Score: </span>
            <span className="result-value">{teamData.mean.toFixed(2)}</span>
          </div>
        </div>

        <button className="back-to-charts-button" onClick={handleBackToCharts}>
          Back to Charts
        </button>
      </div>
    </div>
  );
}

export default CalculationsPage;
