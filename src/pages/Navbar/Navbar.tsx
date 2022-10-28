import "./Navbar.css";
import grgLogo from "../../assets/grassroots-logo.png";
import eventCoordinatorText from "../../assets/event-coordinator-text.png";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <div className="navbar">
      <div className="logo-box">
        <Link to="/">
          <img alt="Grassroots Grocery Logo" className="logo" src={grgLogo} />
        </Link>
        <Link to="/">
          <img
            alt="Event Coordinator"
            className="event-coordinator-text"
            src={eventCoordinatorText}
          />
        </Link>
      </div>

      <div className="navbar-items-wrap">
        <div className="navbar-items">
          <Link className="link" to="/events">
            Events
          </Link>
          <Link className="link" to="/events">
            Forms
          </Link>
        </div>
      </div>
    </div>
  );
}
