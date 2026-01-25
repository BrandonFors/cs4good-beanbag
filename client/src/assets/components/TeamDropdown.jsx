import React, { useState, useEffect } from "react";

const TeamDropdown = (props) => {
  const [currentTeam, setCurrentTeam] = useState(props.selectedTeam ?? "invalid");

  const handleChange = (event) => {
    props.setSelectedTeam(event.target.value);
  };

  useEffect(() => {
    setCurrentTeam(props.selectedTeam ?? "invalid");
  }, [props.selectedTeam]);

  const getTeamTone = (teamName) => {
    const normalized = (teamName ?? "").toString().trim().toLowerCase();
    if (!normalized || normalized === "invalid") return "invalid";
    if (normalized === "blue" || normalized.includes("blue")) return "blue";
    if (normalized === "green" || normalized.includes("green")) return "green";
    return "neutral";
  };

  const teamTone = getTeamTone(currentTeam);
  const dropdownClass = `team-dropdown ${
    teamTone === "green" ? "team-green" : teamTone === "blue" ? "team-blue" : ""
  }`;

  return (
    <div className="team-dropdown-container">
      <select
        className={dropdownClass}
        onChange={handleChange}
        value={currentTeam}
      >
        <option value="invalid" disabled>
          Choose a team...
        </option>
        {props.teamList.map((name, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamDropdown;
