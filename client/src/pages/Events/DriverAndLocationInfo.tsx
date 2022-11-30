import { Link, useParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { Loading } from "../../components/Loading";
import { ProcessedDriver } from "../../types";
import { useDriversInfo } from "./driverInfoHooks";

import { useQuery } from "react-query";

//Types
import { ProcessedEvent } from "../../types";
//Assets
import car from "../../assets/car.svg";
import driving from "../../assets/driving.svg";
import { API_BASE_URL } from "../../httpUtils";

//Takes in ProcessedDriver array and formats data for DataTable component
function processDriversForTable(drivers: ProcessedDriver[]) {
  let output = [];
  for (let i = 0; i < drivers.length; i++) {
    const curDriver = drivers[i];
    let curRow = [
      curDriver.id, //id
      i + 1, //#
      curDriver.firstName,
      curDriver.lastName,
      curDriver.timeSlot,
      curDriver.deliveryCount,
      curDriver.zipCode,
      curDriver.vehicle,
      curDriver.restrictedLocations.join(", "),
    ];
    output.push(curRow);
  }
  return output;
}

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
function useFutureEventById(eventId: string | undefined) {
  const {
    data: futureEvents,
    status: futureEventsStatus,
    error: futureEventsError,
  } = useQuery(["fetchFutureEvents"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedEvent[]>;
  });

  let event = undefined;
  if (futureEventsStatus === "success") {
    event = futureEvents.filter((fe) => eventId === fe.id)[0];
  }

  return {
    event,
    eventStatus: futureEventsStatus,
    eventError: futureEventsError,
  };
}

export function DriverAndLocationInfo() {
  const { eventId } = useParams();
  const { event, eventStatus, eventError } = useFutureEventById(eventId);

  const {
    driversInfo,
    driversInfoIsLoading,
    driversInfoIsError,
    driversInfoError,
  } = useDriversInfo();
  console.log("driversInfo", driversInfo);

  if (driversInfoIsLoading) {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (driversInfoIsError) {
    console.error(driversInfoError);
    return <div>Error...</div>;
  }
  if (driversInfo === undefined) {
    console.error("driversInfo is undefined");
    return <div>Error...</div>;
  }

  if (event === undefined) {
    console.error(
      `Something went wrong. Event ${event} not found in futureEvents list.`
    );
    return <div>Error...</div>;
  }

  //css
  const label = "text-sm md:text-base lg:text-xl ";
  const text = "text-sm font-bold text-newLeafGreen md:text-base lg:text-xl";
  const sectionHeader =
    "flex items-center gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
  const sectionHeaderIcon = "w-6 lg:w-10";

  return (
    <div className="p-6 lg:px-14 lg:py-10">
      <Link to={`/events/${eventId}`}>
        <button
          className="flex items-center rounded-full bg-pumpkinOrange p-2 hover:brightness-110"
          type="button"
        >
          <svg
            className="text-3xl text-white"
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </Link>
      <div className="space-y-5 mb-16 mt-5">
        <div className={sectionHeader}>
          <img className={sectionHeaderIcon} src={car}></img>
          <h1>Delivery and Location Information</h1>
        </div>

        <div className="flex items-center gap-8 md:gap-16 lg:gap-32">
          <div>
            <p className={label}>Event Date</p>
            <p className={text}>{event.dateDisplay}</p>
          </div>
          <div>
            <p className={label}>Event Time</p>
            <p className={text}>{event.time}</p>
          </div>
          <div>
            <p className={label}>Main Location</p>
            <p className={text}>{event.mainLocation}</p>
          </div>
        </div>
      </div>
      <div className={sectionHeader}>
        <img className={sectionHeaderIcon} src={driving}></img>
        <h1>Driver Information</h1>
      </div>

      <div className="h-8" />
      <DataTable
        columnHeaders={[
          "#",
          "First Name",
          "Last Name",
          "Time Slot",
          "Delivery Count",
          "Zip Code",
          "Vehicle",
          "Restricted Locations",
        ]}
        dataRows={processDriversForTable(driversInfo)}
      />
    </div>
  );
}
