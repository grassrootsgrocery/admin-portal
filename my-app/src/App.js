import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <div className="app">
        <Navbar/>
        <Home/>
        <Routes>
          <Route exact path="/" component={Home}/>
          <Route exact path="/event-coordinator" component={Home}/>
          <Route exact path="/events" component={Home}/>
          <Route exact path="/volunteers" component={Home}/>
          <Route exact path="/cleaning" component={Home}/>
          <Route exact path="/contact" component={Home}/>
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
