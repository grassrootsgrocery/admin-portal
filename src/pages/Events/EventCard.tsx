import { Link } from "react-router-dom";
import alert from "../../assets/alert.png";
import check from "../../assets/check.png";
import "./EventCard.css";
interface Props {
  eventId: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  drivers: number;
  packers: number;
}
import { useState, useEffect } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
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

function getDesktopCard(props: Props) {
  const { date, time, location, participants, eventId, drivers, packers } =
    props;
  return (
    <li className="border rounded-xl border-softGrayWhite border-4 p-8">
      {/* Date */}
      <h2 className="text-3xl font-bold text-newLeafGreen ">{date}</h2>
      <div className="h-7" />
      {/* Time & Main locations & Total participants & View Event Button */}
      <div className="flex gap-8">
        <div>
          <p className="text-2xl">Time</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">{time}</h3>
        </div>
        <div>
          <p className="text-2xl">Main Location</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {location}
          </h3>
        </div>
        <div>
          <p className="text-2xl">Total Participants</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {participants}
          </h3>
        </div>
        <div className="grow flex items-center justify-end">
          <button className="text-softGrayWhite rounded-full font-semibold px-8 bg-newLeafGreen rounded p-4 hover:brightness-110">
            View Event
          </button>
        </div>
      </div>
      <div className="h-7" />
      {/* Drivers & Packers */}
      <div className="flex gap-4">
        <div className="flex gap-8">
          <p className="text-2xl">Drivers:</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen flex items-center">
            {drivers} / 30{" "}
            <img
              className="px-4"
              src={drivers === 30 ? check : alert}
              alt="wut"
            />
          </h3>
        </div>
        <div className="flex gap-8">
          <p className="text-2xl">Packers:</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {packers}
          </h3>
        </div>
      </div>
    </li>
  );
}

function getMobileCard(props: Props) {
  const { date, time, location, participants, eventId, drivers, packers } =
    props;
  return (
    <li className="border rounded-xl border-softGrayWhite border-4 p-8">
      {/* Date */}
      <h2 className="text-3xl font-bold text-newLeafGreen border rounded border-red-500">
        {date}
      </h2>
      <div className="h-3" />
      {/* Time & Main locations */}
      <div className="flex gap-8">
        <div>
          <p className="text-2xl">Time</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">{time}</h3>
        </div>
        <div>
          <p className="text-2xl">Main Location</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {location}
          </h3>
        </div>
      </div>
      {/* Total participants & View Event Button */}
      <div>
        <div>
          <p>Total Participants</p>
          <h3>{participants}</h3>
        </div>
        <div>
          <button>View Event</button>
        </div>
      </div>
      <div>
        <div>
          <p>Drivers</p>
          <h3>{drivers}</h3>
        </div>
        <div>
          <p>Packers</p>
          <h3>{packers}</h3>
        </div>
      </div>
    </li>
  );
}
export const EventCard: React.FC<Props> = (props) => {
  const { date, time, location, participants, eventId, drivers, packers } =
    props;
  const { height, width } = useWindowDimensions();
  if (width <= 768) {
    return getMobileCard(props);
  } else {
    return getDesktopCard(props);
  }

  return (
    <li className="border rounded-xl border-softGrayWhite border-4 p-8">
      {/* Date */}
      <h2 className="text-3xl font-bold text-newLeafGreen border rounded border-red-500">
        {date} {height} {width}
      </h2>
      <div className="h-3" />
      {/* Time & Main locations */}
      <div className="flex gap-8">
        <div>
          <p className="text-2xl">Time</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">{time}</h3>
        </div>
        <div>
          <p className="text-2xl">Main Location</p>
          <h3 className="text-2xl font-semibold text-newLeafGreen">
            {location}
          </h3>
        </div>
      </div>
      {/* Total participants & View Event Button */}
      <div>
        <div>
          <p>Total Participants</p>
          <h3>{participants}</h3>
        </div>
        <div>
          <button>View Event</button>
        </div>
      </div>
      <div>
        <div>
          <p>Drivers</p>
          <h3>{drivers}</h3>
        </div>
        <div>
          <p>Packers</p>
          <h3>{packers}</h3>
        </div>
      </div>
      <div className="border h-4 rounded border-red-500"></div>
      <div className="">
        <div className="">
          <div className="mid-section">
            <div className="text-label">Time</div>
            <div className="info">{time}</div>
          </div>
          <div className="mid-section">
            <div className="text-label">Main Location</div>
            <div className="info">{location}</div>
          </div>
          <div className="mid-section">
            <div className="text-label">Total Participants:</div>
            <div className="info">{participants}</div>
          </div>
        </div>

        <Link to={`/events/${eventId}`}>
          <button className="view-event-button">View Event</button>
        </Link>
      </div>

      <div className="bottom-row">
        <div className="section">
          <div className="text-label">Drivers:</div>
          <div className="info">{drivers}/30</div>
        </div>

        <div className="section">
          <div className="text-label">Packers:</div>
          <div className="info">{packers}</div>
        </div>
      </div>
    </li>
  );
};
