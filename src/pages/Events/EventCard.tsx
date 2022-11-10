import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

//Assets
import alert from "../../assets/alert.svg";
import check from "../../assets/check.svg";

import "./EventCard.css";

//Custom hook to watch the dimensions of the screen
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

interface Props {
  eventId: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  drivers: number;
  packers: number;
}

const EventCardDesktop: React.FC<Props> = ({
  date,
  time,
  location,
  participants,
  eventId,
  drivers,
  packers,
}) => {
  // return (
  //   // <li className="rounded-xl border-4 border-softGrayWhite p-8">
  //   <li className="event-card desktop">
  //     {/* Date */}
  //     <h2 className="header">{date}</h2>
  //     <div style={{ height: "0.875rem" }} />
  //     {/* Time & Main locations & Total participants & View Event Button */}
  //     <div className="mid">
  //       <div>
  //         <p className="label">Time</p>
  //         <h3 className="label bold-green">{time}</h3>
  //       </div>
  //       <div>
  //         <p className="label">Main Location</p>
  //         <h3 className="label bold-green line-clamp">{location}</h3>
  //       </div>
  //       <div>
  //         <p className="label">Total Participants</p>
  //         <h3 className="label bold-green">{participants}</h3>
  //       </div>
  //       <div className="view-event-btn-wrapper">
  //         <Link to={`/events/${eventId}`}>
  //           <button className="view-event-btn">View Event</button>
  //         </Link>
  //       </div>
  //     </div>
  //     <div style={{ height: "0.875rem" }} />
  //     {/* Drivers & Packers */}
  //     <div className="bottom">
  //       <div className="wrapper">
  //         <p className="label" style={{ border: "1px solid green" }}>
  //           Drivers:
  //         </p>
  //         <h3 className="driver-fraction bold-green">
  //           {drivers}/30{" "}
  //           <img
  //             style={{ padding: "0 0.125rem" }}
  //             src={drivers >= 30 ? check : alert}
  //             alt="wut"
  //           />
  //         </h3>
  //       </div>
  //       <div className="wrapper">
  //         <p className="label">Packers:</p>
  //         <h3 className="label bold-green">{packers}</h3>
  //       </div>
  //     </div>
  //   </li>
  // );

  return (
    <li className="event-card">
      {/* Date */}
      <h2 className="header">{date}</h2>
      <div className="h-4"></div>
      {/* Time & Main locations & Total participants & View Event Button */}
      <div className="details">
        <div className="left">
          <div className="col-span-1">
            <p className="label">Time</p>
            <h3 className="label bold-green">{time}</h3>
          </div>
          <div className="col-span-3">
            <p className="label">Main Location</p>
            <h3 className="label bold-green line-clamp">{location}</h3>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <p className="label flex items-start">Drivers:</p>
            <h3 className="driver-fraction label bold-green flex items-start gap-2 lg:gap-2">
              {drivers}/30{" "}
              <img
                style={{ padding: "0.35rem 0.125rem" }}
                src={drivers >= 30 ? check : alert}
                alt="wut"
              />
            </h3>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
            <p className="label">Packers:</p>
            <h3 className="label bold-green">{packers}</h3>
          </div>
        </div>

        <div className="flex grow flex-col items-start border lg:flex-row lg:justify-between ">
          <div>
            <p className="label">Total Participants</p>
            <h3 className="label bold-green">{participants}</h3>
          </div>
          <div className="view-event-btn-wrapper">
            <Link to={`/events/${eventId}`}>
              <button className="view-event-btn">View Event</button>
            </Link>
          </div>
        </div>
        {/* Drivers & Packers */}
        <div className="bottom"></div>
      </div>
    </li>
  );
};

const EventCardMobile: React.FC<Props> = ({
  date,
  time,
  location,
  participants,
  eventId,
  drivers,
  packers,
}) => {
  return (
    // <li className="rounded-xl border-4 border-softGrayWhite p-4">
    <li className="event-card mobile">
      {/* Date */}
      <h2 className="header">{date}</h2>
      <div style={{ height: "0.875rem" }} />
      <div className="flex justify-between gap-2">
        {/* Time & Drivers & Packers */}
        <div className="flex flex-col gap-1">
          <div className="grow">
            <p className="label">Time</p>
            <h3 className="label-bold-green">{time}</h3>
          </div>
          <h3 className="label">Drivers:</h3>
          <h3 className="label">Packers:</h3>
        </div>
        {/* Location & Drivers count & Packers count */}
        <div className="flex flex-col gap-1">
          <div className="grow">
            <p className="label">Main Location</p>
            <h3 className="h-10 overflow-hidden text-ellipsis text-sm font-semibold text-newLeafGreen line-clamp-2">
              {location}
            </h3>
          </div>
          <h3 className="driver-fraction">
            {drivers}/30{" "}
            <img
              style={{ padding: "0 0.125rem" }}
              src={drivers >= 30 ? check : alert}
              alt="wut"
            />
          </h3>
          <h3 className="label bold-green">{packers}</h3>
        </div>
        {/* Total participants & Total participants count & View event */}
        <div className="flex flex-col">
          <div className="grow">
            <p className="label">Total Participants</p>
            <h3 className="label bold-green">{participants}</h3>
          </div>
          <Link to={`/events/${eventId}`}>
            <button className="rounded-full bg-newLeafGreen px-3 py-2 text-xs font-semibold text-softGrayWhite shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen">
              View Event
            </button>
          </Link>
          <div className="h-2" />
        </div>
      </div>
    </li>
  );
};

//Because the mobile card is kinda different from the desktop card in its layout, I've created two separate components for each.
export const EventCard: React.FC<Props> = (props) => {
  const { width } = useWindowDimensions();

  //I hate this magic number. It corrosponds to the `sm` breakpoint in Tailwind, which is 640 pixels
  // if (width <= 640) {
  //   return <EventCardMobile {...props} />;
  // } else {
  return <EventCardDesktop {...props} />;
  // }
};
