import { useState } from "react";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import grgLogo from "../assets/grassroots-logo.png";
import eventCoordinatorText from "../assets/event-coordinator-text.png";
import chevron_up from "../assets/chevron-up-green.svg";
import chevron_down from "../assets/chevron-down-green.svg";
import { useAuth } from "../contexts/AuthContext";

interface FormsDropdownItemProps {
  label: string;
  formURL: string;
}
const FormsDropdownItem = (props: FormsDropdownItemProps) => {
  const { label, formURL } = props;
  return (
    <a href={formURL} target="_blank">
      <DropdownMenu.Item
        className="select-none rounded-lg border-2 border-newLeafGreen p-2 text-center text-sm text-newLeafGreen underline underline-offset-4 outline-none hover:cursor-pointer hover:bg-newLeafGreen hover:text-softGrayWhite md:text-lg md:text-lg lg:text-2xl lg:text-xl"
        onSelect={(e) => {
          e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        }}
      >
        {label}
      </DropdownMenu.Item>
    </a>
  );
};

const navBarItemClassNames = "text-sm md:text-lg lg:text-2xl";

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <nav className="flex items-center bg-softGrayWhite py-2 md:py-0 md:px-3">
      <div className="hidden gap-2 md:flex md:flex-col md:items-center">
        <Link to="/">
          <img
            alt="Grassroots Grocery Logo"
            className="m-0 w-48"
            src={grgLogo}
          />
        </Link>
        <Link to="/">
          <img
            alt="Event Coordinator"
            className="m-0 w-28 -translate-y-2 p-0"
            src={eventCoordinatorText}
          />
        </Link>
      </div>

      <div className="flex grow justify-center md:justify-end md:pr-4">
        <div className="flex min-w-[12em] items-center justify-between gap-12">
          <Link className={navBarItemClassNames} to="/events">
            Events
          </Link>

          <DropdownMenu.Root
            open={isDropdownOpen}
            onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
            modal={false}
          >
            <DropdownMenu.Trigger asChild>
              <div className="flex w-4/5 min-w-fit items-center justify-center space-x-2 hover:cursor-pointer">
                <h2 className={navBarItemClassNames}>Forms</h2>
                <img
                  className="w-2 md:w-4"
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
                  label="All Saturday Forms"
                  formURL="https://www.grassrootsgrocery.org/saturday"
                />
                <FormsDropdownItem
                  label="Attendance Form"
                  formURL="https://www.grassrootsgrocery.org/attendance-form"
                />
                <FormsDropdownItem
                  label="Driver Dispatch Form"
                  formURL="https://www.grassrootsgrocery.org/driver-dispatch-form"
                />
                <FormsDropdownItem
                  label="Food Allocation Form"
                  formURL="https://www.grassrootsgrocery.org/food-allocation-form"
                />
                <FormsDropdownItem
                  label="Main Volunteer Signup Form"
                  formURL="https://www.grassrootsgrocery.org/saturday-form"
                />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Link className={navBarItemClassNames} to="/" onClick={handleLogout}>
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}
