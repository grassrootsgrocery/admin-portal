import { Link } from "react-router-dom";
import "./EventCard.css";
interface Props {
  eventId: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  drivers: string;
  packers: number;
}

export const EventCard: React.FC<Props> = (props) => {
  const { date, time, location, participants, eventId, drivers, packers } =
    props;

  return (
    <li className="event-card">
      <div className="date">{date}</div>

      <div className="middle-row">
        <div className="left">
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
          <div className="info">{drivers}</div>
        </div>

        <div className="section">
          <div className="text-label">Packers:</div>
          <div className="info">{packers}</div>
        </div>
      </div>
    </li>
  );
};

export default EventCard;
