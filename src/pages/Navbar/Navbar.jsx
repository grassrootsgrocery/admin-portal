import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div class="navbar">
      <div>
        <Link to="/">Home</Link>
      </div>

      <div class="navbar-items">
        <Link to="/events">Events</Link>
        <Link to="/events">Messaging</Link>
        <Link to="/events">Forms</Link>
      </div>
    </div>
  );
}

export default Navbar;
