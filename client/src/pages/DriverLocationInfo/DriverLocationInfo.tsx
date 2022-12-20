import { Link, useParams } from "react-router-dom";
import { useDriversInfo } from "./driverInfoHooks";
import { AssignLocationDropdown } from "./AssignLocationDropdown";
import { useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import { useFutureEventById } from "../eventHook";
//Types
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
//Components
import { Navbar } from "../../components/Navbar/Navbar";
import { DataTable } from "../../components/DataTable";
import { Loading } from "../../components/Loading";
//Assets
import car from "../../assets/car.svg";
import driving from "../../assets/driving.svg";
import back from "../../assets/back-white.svg";

/* 
TODO: Clean this file up. The messaging cards perhaps should be shared with the messaging cards that are being used
in the VolunteersTable.tsx file. 
*/
//Takes in ProcessedDriver array and formats data for DataTable component
function processDriversForTable(
  drivers: ProcessedDriver[],
  processedDropOffLocations: ProcessedDropoffLocation[],
  refetchDrivers: any
) {
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
      <AssignLocationDropdown
        locations={processedDropOffLocations.sort((a, b) =>
          a.dropOffLocation < b.dropOffLocation ? -1 : 1
        )}
        driver={curDriver}
        refetchDrivers={refetchDrivers}
      />,
    ];
    output.push(curRow);
  }
  return output;
}

//TODO: Make this code cleaner
function processDropoffLocationsForTable(
  drivers: ProcessedDriver[],
  processedDropOffLocations: ProcessedDropoffLocation[]
) {
  let output = [];
  for (let i = 0; i < processedDropOffLocations.length; i++) {
    const curLocation = processedDropOffLocations[i];
    let curRow = [
      curLocation.id, //id
      i + 1, //#
      "Coordinator Information", //TODO: coordinator information
      curLocation.dropOffLocation,
      curLocation.address,
      curLocation.neighborhood,
      curLocation.startTime,
      curLocation.endTime,
      curLocation.deliveriesAssigned,
      <ul className="scrollbar-thin flex w-[600px] gap-4 overflow-x-auto pb-2">
        {drivers
          .filter((d) => d.dropoffLocations.some((l) => l === curLocation.id))
          .map((d, i) => {
            return (
              <li
                key={i}
                className="flex min-w-fit shrink-0 items-center gap-1 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen sm:text-sm md:text-base"
              >
                {d.firstName + " " + d.lastName}
              </li>
            );
          })}
      </ul>,
    ];
    output.push(curRow);
  }
  return output;
}
//Tailwind classes
const label = "text-sm md:text-base lg:text-xl ";
const text = "text-sm font-bold text-newLeafGreen md:text-base lg:text-xl";
const sectionHeader =
  "flex items-start gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
const sectionHeaderIcon = "w-6 lg:w-10";

export function DriverLocationInfo() {
  const { eventId } = useParams();

  const {
    data: locationsToDriversText,
    status: locationsToDriversTextStatus,
    error: locationsToDriversTextError,
  } = useQuery(
    ["fetchLocationsToDriversText"],
    async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/messaging/locations-to-drivers-text`
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json();
    },
    { staleTime: 20000 }
  );
  const {
    data: driverInfoToCoordinatorsText,
    status: driverInfoToCoordinatorsTextStatus,
    error: driverInfoToCoordinatorsTextError,
  } = useQuery(
    ["fetchDriverInfoToCoordinatorsText"],
    async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/messaging/driver-info-to-coordinators-text`
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json();
    },
    { staleTime: 20000 }
  );

  const locationsToDriversTextLoading =
    locationsToDriversTextStatus === "loading" ||
    locationsToDriversTextStatus === "idle";

  const driverInfoToCoordinatorsLoading =
    driverInfoToCoordinatorsTextStatus === "loading" ||
    driverInfoToCoordinatorsTextStatus === "idle";

  const { event, eventStatus, eventError } = useFutureEventById(eventId);
  const {
    driversInfo,
    refetchDrivers,
    driversInfoIsLoading,
    driversInfoIsError,
    driversInfoError,
  } = useDriversInfo();
  console.log("driversInfo", driversInfo);

  const {
    data: dropoffLocations,
    status: dropoffLocationsStatus,
    error: dropoffLocationsError,
  } = useQuery(["fetchDropOffLocations"], async () => {
    const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations`);
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.messsage);
    }
    return resp.json();
  });
  console.log("dropoffLocations", dropoffLocations);

  if (
    driversInfoIsLoading ||
    dropoffLocationsStatus === "loading" ||
    dropoffLocationsStatus === "idle"
  ) {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (driversInfoIsError || dropoffLocationsStatus === "error") {
    const error = driversInfoError || dropoffLocationsError;
    console.error(error);
    return <div>Error...</div>;
  }
  //This shouldn't be necessary but TypeScript isn't smart enough to know that this can't be undefined
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
  return (
    <>
      <Navbar />
      <div className="p-6 lg:px-14 lg:py-10">
        {/* Not sure why inline-block on the Link is necessary */}
        <Link className="inline-block" to={`/events/${eventId}`}>
          <button
            className="flex w-fit shrink-0 items-center gap-3 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen lg:px-4 lg:py-2 lg:text-lg"
            type="button"
          >
            <img className="w-2 lg:w-4" src={back} alt="Go back" />
            Go back
          </button>
        </Link>
        <div className="h-4" />
        <div className="mb-16 mt-5 space-y-5">
          <div className={sectionHeader}>
            <img className={sectionHeaderIcon} src={car}></img>
            <h1>Delivery and Location Information</h1>
          </div>

          <div className="flex flex-wrap items-center gap-8">
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

        <div className="h-screen">
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
              "Assign Location",
            ]}
            dataRows={processDriversForTable(
              driversInfo,
              dropoffLocations,
              refetchDrivers
            )}
          />
        </div>
        <div className="h-12" />
        {/* Send locations info to drivers */}
        <div className="flex h-1/6 w-full flex-col items-start gap-4 lg:w-1/2">
          {locationsToDriversTextLoading ? (
            <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
              <Loading size="medium" thickness="thicc" />
            </div>
          ) : (
            <textarea
              className="w-full grow resize-none overflow-scroll rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl"
              readOnly
              defaultValue={locationsToDriversText}
            />
          )}
          <button className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold">
            Send Locations to Drivers
          </button>
        </div>

        <div className="h-16" />
        <div className={sectionHeader}>
          <img className={sectionHeaderIcon} src={driving}></img>
          <h1>Location Information</h1>
        </div>
        <div className="h-8" />
        <div className="h-screen">
          <DataTable
            columnHeaders={[
              "#",
              "Coordinator Information",
              "Site Name",
              "Address",
              "Neighborhood",
              "Start Time",
              "End Time",
              "Deliveries Assigned",
              "Matched Drivers",
            ]}
            dataRows={processDropoffLocationsForTable(
              driversInfo,
              dropoffLocations
            )}
          />
        </div>
        <div className="h-12" />
        <div className="flex h-1/6 flex-col-reverse items-start justify-between gap-6 lg:flex-row lg:justify-between">
          {/* Send driver info to coordinators */}
          <div className="flex h-full w-full flex-col items-start gap-4 lg:w-1/2">
            {driverInfoToCoordinatorsLoading ? (
              <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
                <Loading size="medium" thickness="thicc" />
              </div>
            ) : (
              <textarea
                className="w-full grow resize-none overflow-scroll rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl"
                readOnly
                defaultValue={driverInfoToCoordinatorsText}
              />
            )}
            <button className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold">
              Send Driver Info to Coordinators
            </button>
          </div>
          <button className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold">
            + Add Dropoff Location
          </button>
        </div>
        <div className="h-16" />
      </div>
    </>
  );
}
