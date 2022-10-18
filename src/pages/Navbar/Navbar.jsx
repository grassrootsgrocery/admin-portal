import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div class="navbar">
      <div class="logo-box">
        <Link to="/">Logo</Link>
        <Link class="link" to="/">
          Event Coordinator
        </Link>
      </div>

      <div class="navbar-items">
        <Link class="link" to="/events">
          Events
        </Link>
        <Link class="link" to="/events">
          Messaging
        </Link>
        <Link class="link" to="/events">
          Forms
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
