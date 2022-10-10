import './App.css';
import './index.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import Events from './Components/Events/Events';
import Login from './Components/Home/Login';

import React, { useState, useEffect } from "react";


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <div className="app">
          <Routes>
            <Route exact path="/" element={<Login/>} />
            <Route exact path="/home" element={<div> <Navbar/> <Home/> </div>} />
            <Route exact path="/events" element={<div> <Navbar/> <Events/> </div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

function DataTable() {
  const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
  const [records, setRecords] = useState([]);

  // Pull data from the Scheduled Slots table
  const fetchSchedSlotsData = () => {
    fetch(
      `https://api.airtable.com/v0/app7zige4DRGqIaL2/%F0%9F%93%85%20Scheduled%20Slots?api_key=${AIRTABLE_API_KEY}`
    )
      .then((resp) => resp.json())
      .then((data) => {
        setRecords(data.records);
        console.log("SCHEDULED SLOTS:");
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchSchedSlotsData();
  }, [AIRTABLE_API_KEY]);

  return null;
}

export default DataTable;
