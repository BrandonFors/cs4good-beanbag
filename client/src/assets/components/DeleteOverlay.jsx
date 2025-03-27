import React, { useState, useEffect } from "react";
import "../styles/index.css";
import axios from "axios";

function DeleteOverlay(props) {
  const [textContent, setTextContent] = useState("");
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    textContent == props.teamName
      ? setButtonEnabled(true)
      : setButtonEnabled(false);
  }, [textContent]);


  return (
    <div className="delete-overlay">
      <div className="delete-container">
        <div className="delete-header">
          <h1>Enter the Team's Name to Confirm Delete</h1>
          <a onClick={props.handlePopExit} className="close-button">
            <img src="/icons/close.svg" />
          </a>
        </div>
        <h3>Case Sensitive</h3>
        <input
          type="text"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Enter team name"
        />
        <button onClick={()=>{props.handleConfirm(textContent)}} disabled={!buttonEnabled}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default DeleteOverlay;
