import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import "../styles/index.css";
import axios from "axios";
import DeleteOverlay from "./DeleteOverlay";

function TeamPage() {
  const [teamName, setTeamName] = useState("");
  const [teamNameDelete, setTeamNameDelete] = useState("");
  const [message, setMessage] = useState(""); // Feedback message
  const [teamList, setTeamList] = useState([]); // List of registered teams
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch existing teams on load
  useEffect(() => {
    const fetchTeamNames = async () => {
      const response = await axios.get("https://cs4good-beanbag-codt.onrender.com/get_teams");
      setTeamList(response.data);
    };
    fetchTeamNames();
  }, []);

  const handleDelete = (target) => {
    setTeamNameDelete(target.name);
    setIsConfirming(true);
  };

  const handlePopExit = () => {
    setIsConfirming(false);
  };

  const handleDeleteConfirm = async (name) => {
    let newTeamList = [];
    const data = {
      name: name,
    };
    const response = await axios.post(
      "https://cs4good-beanbag-codt.onrender.com/delete_team",
      data
    );
    setTeamList((prevValue) => prevValue.filter((team) => team !== name));
    handlePopExit();
  };

  const handleRegisterTeam = async () => {
    if (!teamName.trim()) {
      setMessage("Team name cannot be empty.");
      return;
    }
    if (teamList.includes(teamName)) {
      setMessage("Team name already registered.");
      return;
    }
    const data = {
      name: teamName,
    };
    const response = await axios.post(
      "https://cs4good-beanbag-codt.onrender.com/register_team",
      data
    );
    setTeamList((prevValue) => {
      return [...prevValue, teamName];
    });
    setTeamName(""); // Clear input
  };

  return (
    <div>
      <NavBar />
      <div className="registerContainer">
        <h1>Register a Team</h1>
        <div>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
          />
          <button onClick={handleRegisterTeam}>Register</button>
        </div>

        <div className="teamList">
          <h2>Registered Teams</h2>

          {teamList.map((team, index) => (
            <div key={index} className="delete-element">
              <button
                onClick={(event) => {
                  handleDelete(event.target);
                }}
                name={team}
                value={team}
              >
                Delete
              </button>
              <h2>{team}</h2>
            </div>
          ))}
        </div>
      </div>
      {isConfirming && (
        <DeleteOverlay
          teamName={teamNameDelete}
          handlePopExit={handlePopExit}
          handleConfirm={handleDeleteConfirm}
        />
      )}
      <p className="message">{message}</p>
    </div>
    
  );
}

export default TeamPage;
