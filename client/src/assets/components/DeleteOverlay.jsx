import React, { useState, useEffect } from "react";
import "../styles/index.css";
import axios from "axios";

function DeleteOverlay(props) {
  const [textContent, setTextContent] = useState("");
  const [buttonEnabled, setButtonEnabled] = useState(false);


  return (
    <div className="delete-overlay">
      <div className="delete-container">
        <div className="delete-header">
          <h1>Delete {props.teamName}?</h1>
          <a onClick={props.handlePopExit} className="close-button">
            <img src="/icons/close.svg" />
          </a>
        </div>
        <button onClick={()=>{props.handleConfirm(props.teamName)}}>
          Yes
        </button>
      </div>
    </div>
  );
}

export default DeleteOverlay;
