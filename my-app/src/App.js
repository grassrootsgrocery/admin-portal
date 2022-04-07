import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import Events from './Components/Events/Events';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <div className="app">
        <Navbar/>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/event-coordinator" element={<Home/>} />
          <Route exact path="/events" element={<Events/>} />
          <Route exact path="/volunteers" element={<Home/>} />
          <Route exact path="/cleaning" element={<Home/>} />
          <Route exact path="/contact" element={<Home/>} />
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
