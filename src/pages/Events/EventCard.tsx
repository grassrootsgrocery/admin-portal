import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

//Assets
import alert from "../../assets/alert.png";
import check from "../../assets/check.png";

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
  return (
    <li className="rounded-xl border-4 border-softGrayWhite p-8">
      {/* Date */}
      <h2 className="text-3xl font-bold text-newLeafGreen">{date}</h2>
      <div className="h-7" />
      {/* Time & Main locations & Total participants & View Event Button */}
      <div className="flex gap-8">
        <div>
          <p className="text-2xl">Time</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">{time}</h3>
        </div>
        <div>
          <p className="text-2xl">Main Location</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen line-clamp-2">
            {location}
          </h3>
        </div>
        <div>
          <p className="text-2xl">Total Participants</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {participants}
          </h3>
        </div>
        <div className="flex grow items-center justify-end">
          <Link to={`/events/${eventId}`}>
            <button className="rounded-full bg-newLeafGreen p-4 px-8 font-semibold text-softGrayWhite shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen">
              View Event
            </button>
          </Link>
        </div>
      </div>
      <div className="h-7" />
      {/* Drivers & Packers */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <p className="text-2xl">Drivers:</p>
          <h3 className="flex items-center text-2xl font-semibold text-newLeafGreen">
            {drivers}/30{" "}
            <img
              className="px-4"
              src={drivers >= 30 ? check : alert}
              alt="wut"
            />
          </h3>
        </div>
        <div className="flex gap-2">
          <p className="text-2xl">Packers:</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {packers}
          </h3>
        </div>
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
    <li className="rounded-xl border-4 border-softGrayWhite p-4">
      {/* Date */}
      <h2 className="text-md font-bold text-newLeafGreen">{date}</h2>
      <div className="h-1" />
      <div className="flex justify-between gap-2">
        {/* Time & Drivers & Packers */}
        <div className="flex flex-col gap-1">
          <div className="grow">
            <p className="text-sm">Time</p>
            <h3 className="text-sm font-semibold text-newLeafGreen">{time}</h3>
          </div>
          <h3 className="text-sm">Drivers:</h3>
          <h3 className="text-sm">Packers:</h3>
        </div>
        {/* Location & Drivers count & Packers count */}
        <div className="flex flex-col gap-1">
          <div className="grow">
            <p className="text-sm">Main Location</p>
            <h3 className="h-10 overflow-hidden text-ellipsis text-sm font-semibold text-newLeafGreen line-clamp-2">
              {location}
            </h3>
          </div>
          <h3 className="text-sm font-semibold text-newLeafGreen">
            {drivers}/30{" "}
            <img
              className="inline w-3"
              src={drivers >= 30 ? check : alert}
              alt="wut"
            />
          </h3>
          <h3 className="text-sm font-semibold text-newLeafGreen">{packers}</h3>
        </div>
        {/* Total participants & Total participants count & View event */}
        <div className="flex flex-col">
          <div className="grow">
            <p className="text-sm">Total Participants</p>
            <h3 className="text-sm font-semibold text-newLeafGreen">
              {participants}
            </h3>
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
  if (width <= 640) {
    return <EventCardMobile {...props} />;
  } else {
    return <EventCardDesktop {...props} />;
  }
};
