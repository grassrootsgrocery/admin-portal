import "./Navbar.css";
import { useState } from "react";
import grgLogo from "../../assets/grassroots-logo.png";
import eventCoordinatorText from "../../assets/event-coordinator-text.png";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import chevron_up from "../../assets/chevron-up-green.svg";
import chevron_down from "../../assets/chevron-down-green.svg";

interface FormsDropdownItemProps {
  label: string;
  formURL: string;
}
const FormsDropdownItem = (props: FormsDropdownItemProps) => {
  const { label, formURL } = props;
  return (
    <a href={formURL} target="_blank">
      <DropdownMenu.Item
        className="link select-none rounded-lg border-2 border-newLeafGreen p-2 text-center text-xl text-newLeafGreen underline underline-offset-4 outline-none hover:cursor-pointer hover:bg-newLeafGreen hover:text-softGrayWhite"
        onSelect={(e) => {
          e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        }}
      >
        {label}
      </DropdownMenu.Item>
    </a>
  );
};

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

          <DropdownMenu.Root
            open={isDropdownOpen}
            onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <DropdownMenu.Trigger asChild>
              <div className="link flex w-4/5 min-w-fit items-center justify-center space-x-2 hover:cursor-pointer">
                <h2 className="link">Forms</h2>
                <img
                  className="w-5"
                  src={isDropdownOpen ? chevron_up : chevron_down}
                  alt="chevron-icon"
                />
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-20 flex h-fit w-max flex-col gap-1 overflow-auto rounded-lg border border-newLeafGreen bg-softGrayWhite"
                avoidCollisions
                align="start"
              >
                <FormsDropdownItem
                  label={"Attendance Form"}
                  formURL={"https://form.jotform.com/222106405249145"}
                />
                <FormsDropdownItem
                  label={"Driver Form"}
                  formURL={"https://form.jotform.com/222228365139153"}
                />
                <FormsDropdownItem
                  label={"Food Allocation Form"}
                  formURL={"https://submit.jotform.com/222325901439049"}
                />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
}
