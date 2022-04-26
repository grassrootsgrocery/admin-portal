import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as Navigation, Nav, Container } from 'react-bootstrap';
import { FaTimes, FaBars} from 'react-icons/fa';
import './Navbar.css'

function Navbar() {
    const [navActive, setNavActive] = useState(false)

    const toggleNav = () => {
        if (window.innerWidth < 992) {
            setNavActive(!navActive)
        }
    }

    const links = [
        { name: 'Events', path: '/events'}, 
        { name: 'Volunteers', path: '/volunteers'}, 
        { name: 'Contact', path: '/contact'},
    ];

    return (
        <div className="navbar-page">
            <Navigation expand="lg" expanded={navActive}>
                <Container>
                    <Navigation.Brand>
                        <Link className="nav-brand" to="/">
                            <img src="./Jicama White_Logo_SquareLockup.png" alt="Mott Haven Logo"></img>
                        </Link>
                    </Navigation.Brand>
                    <Link className="coordinator" to="/event-coordinator">
                        <div>Event Coordinator</div>
                    </Link>
                    <div className={navActive ? "menu-toggle active" : "menu-toggle"} onClick={toggleNav}>
                      <div className="toggle" onClick={toggleNav}>
                        {navActive ? <FaTimes/> : <FaBars/>}
                      </div>
                    </div>
                    <Navigation.Collapse id="basic-navbar-nav" className="justify-content-end" onClick={toggleNav}>
                        <Nav>
                            {links.map(link =>
                                <Link key={link.name} to={link.path} className="nav-link">{link.name}</Link>
                            )}
                        </Nav>
                    </Navigation.Collapse>
                </Container>
            </Navigation>
        </div>
    )
}

export default Navbar;