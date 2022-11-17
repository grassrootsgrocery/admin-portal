import { Link } from "react-router-dom";

//Assets
import alert from "../../assets/alert.svg";
import check from "../../assets/check.svg";

interface Props {
  eventId: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  drivers: number;
  packers: number;
}

export const EventCard: React.FC<Props> = ({
  date,
  time,
  location,
  participants,
  eventId,
  drivers,
  packers,
}) => {
  // Tailwind classes
  const label = "text-sm md:text-base lg:text-xl";
  const labelBold =
    "text-sm font-semibold text-newLeafGreen md:text-base lg:text-xl";

  return (
    <li className="mb-4 rounded-xl border-2 border-softGrayWhite bg-softBeige px-4 py-3 lg:border-4 lg:px-8 lg:py-7">
      {/* Date */}
      <h2 className="text-base font-bold text-newLeafGreen md:text-xl lg:text-2xl">
        {date}
      </h2>
      <div className="h-4"></div>
      {/* Time & Main locations & Total participants & View Event Button */}
      <div className="flex lg:gap-8">
        <div className="grid grow auto-rows-min grid-cols-6 md:grid-cols-5 md:gap-1 lg:grow-0 lg:gap-y-2">
          {/* Time */}
          <div className="col-span-2 md:col-span-1">
            <p className={label}>Time</p>
            <h3 className={labelBold}>{time}</h3>
          </div>
          {/* Main Location */}
          <div className="dev-border col-span-4 md:col-span-4">
            <p className={label}>Main Location</p>
            <h3 className={`${labelBold} line-clamp-2`}>{location}</h3>
          </div>
          {/* Drivers */}
          <div className="col-span-2 grow-0 md:col-span-1">
            <p className={label}>Drivers:</p>
          </div>
          {/* Drivers Count */}
          <div className="col-span-4 md:col-span-4 lg:col-span-2">
            <h3 className={`${labelBold} flex gap-4`}>
              {drivers}/30{" "}
              <img
                className="mt-1 w-4 md:w-6 lg:w-7"
                src={drivers >= 30 ? check : alert}
                alt="wut"
              />
            </h3>
          </div>
          {/* Packers */}
          <div className="col-span-2 md:col-span-1">
            <p className={label}>Packers:</p>
          </div>
          {/* Packers Count */}
          <div className="col-span-4 md:col-span-4 lg:col-span-1">
            <h3 className={labelBold}>{packers}</h3>
          </div>
        </div>

        {/* Total Participants & View Event Button */}
        <div className="flex flex-col lg:grow lg:flex-row lg:items-start lg:justify-between ">
          <div>
            <p className="text-sm md:text-base lg:text-xl">
              Total Participants
            </p>
            <h3 className={labelBold}>{participants}</h3>
          </div>
          <div className="flex grow items-center lg:justify-end">
            <Link to={`/events/${eventId}`}>
              <button className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-medium text-softGrayWhite shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl">
                View Event
              </button>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};
