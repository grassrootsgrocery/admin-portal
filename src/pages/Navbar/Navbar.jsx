import "./Navbar.css";
import grgLogo from "../../assets/grassroots-logo.png";
import eventCoordinatorText from "../../assets/event-coordinator-text.png";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div class="navbar">
      <div class="logo-box">
        <Link to="/">
          <img alt="Grassroots Grocery Logo" className="logo" src={grgLogo} />
        </Link>
        <Link class="link" to="/">
          <img
            alt="Event Coordinator"
            className="event-coordinator-text"
            src={eventCoordinatorText}
          />
        </Link>
      </div>

      <div class="navbar-items-wrap">
        <div class="navbar-items">
          <Link class="link" to="/events">
            Events
          </Link>
          <Link class="link" to="/events">
            Forms
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
