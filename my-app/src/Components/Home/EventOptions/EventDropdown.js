import React from 'react';
import { Dropdown } from 'react-bootstrap';
import './EventDropdown.css'

function EventDropdown(props) {
    const title = props.title;
    const items = props.items

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div className="options-menu">
            <p className="menu-title">{children}</p>
            <a
                href="/#"
                ref={ref}
                onClick={(e) => {
                e.preventDefault();
                onClick(e);
                }}
                className="dropdown-btn"
            >
                &#x2304;
            </a>
        </div>
    ));

    const dropdownStyle = {
        color: 'blue',
        width: '280px',
        border: 'none',
        borderRadius: '0px 0px 22px 22px',
    };

    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      
          return (
            <div
            ref={ref}
            style={dropdownStyle}
            className={className}
            aria-labelledby={labeledBy}
            >
                <ul className="list-unstyled">
                    {React.Children.toArray(children)}
                </ul>
            </div>
          );
        },
      );
    
    return (
        <div>
            <Dropdown>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                    {title}
                </Dropdown.Toggle>

                <Dropdown.Menu as={CustomMenu}>
                    {items.map((item, index) => (
                        <Dropdown.Item eventKey={index}>{item}</Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
}

export default EventDropdown;