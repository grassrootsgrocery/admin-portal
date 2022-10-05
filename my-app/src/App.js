import "./App.css";
import "./index.css";
import DataTable from "./Components/DataTable";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Components/Home/Home";
import Events from "./Components/Events/Events";
import Login from "./Components/Home/Login";

function App() {
  return (
    <div className="App">
      <DataTable />
      <BrowserRouter>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <div className="app">
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route
              exact
              path="/home"
              element={
                <div>
                  {" "}
                  <Navbar /> <Home />{" "}
                </div>
              }
            />
            <Route
              exact
              path="/events"
              element={
                <div>
                  {" "}
                  <Navbar /> <Events />{" "}
                </div>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
