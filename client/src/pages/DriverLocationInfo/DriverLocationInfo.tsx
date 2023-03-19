import { Link, Navigate, useParams } from "react-router-dom";
import { useDriversInfo } from "./driverInfoHooks";
import { AssignLocationDropdown } from "./AssignLocationDropdown";
import { useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import { useFutureEventById } from "../eventHooks";
import { useAuth } from "../../contexts/AuthContext";
//Types
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
//Components
import { Navbar } from "../../components/Navbar";
import { DataTable } from "../../components/DataTable";
import { Loading } from "../../components/Loading";
import { DropoffOrganizerPopup } from "./DropoffOrganizerPopup";
//Assets
import car from "../../assets/car.svg";
import driving from "../../assets/driving.svg";
import back from "../../assets/back-white.svg";
import { SendTextMessageButton } from "./SendTextMesssageButton";
import { ContactPopup } from "../../components/ContactPopup";
import { CoordinatorInfoPopup } from "./CoordinatorInfoPopup";
import { LocationPopup } from "./LocationPopup";

/* 
TODO: Clean this file up. The messaging cards perhaps should be shared with the messaging cards that are being used
in the VolunteersTable.tsx file. 
*/
//Takes in ProcessedDriver array and formats data for DataTable component
function processDriversForTable(
  drivers: ProcessedDriver[],
  dropoffLocations: ProcessedDropoffLocation[],
  refetchDrivers: any
) {
  const dropoffLocationsSorted = dropoffLocations.sort((a, b) =>
    a.siteName < b.siteName ? -1 : 1
  );
  return drivers.map((curDriver, i) => {
    const dropoffLocationsForDriver = dropoffLocations.filter((location) =>
      curDriver.dropoffLocations.includes(location.id)
    );
    return [
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
        locations={dropoffLocationsSorted}
        driver={curDriver}
        refetchDrivers={refetchDrivers}
      />,
      <LocationPopup dropoffLocations={dropoffLocationsForDriver} />,
      <ContactPopup
        email={curDriver.email}
        phoneNumber={curDriver.phoneNumber}
      />,
    ];
  });
}

//TODO: Make this code cleaner
function processDropoffLocationsForTable(
  drivers: ProcessedDriver[],
  processedDropOffLocations: ProcessedDropoffLocation[]
) {
  return processedDropOffLocations.map((curLocation, i) => {
    return [
      curLocation.id, //id
      i + 1, //#
      <CoordinatorInfoPopup
        coordinatorPOCNames={curLocation.pocNameList}
        coordinatorPOCPhoneNumbers={curLocation.pocPhoneNumberList}
        locationEmail={curLocation.locationEmail}
      />,
      curLocation.siteName,
      curLocation.address,
      curLocation.neighborhoods.join(", "),
      typeof curLocation.startTime === "string" ? curLocation.startTime : "N/A",
      typeof curLocation.endTime === "string" ? curLocation.endTime : "N/A",
      `${curLocation.deliveriesAssigned}/${curLocation.deliveriesNeeded}`,
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
  });
}

const getDropoffLocationsForEvent = (
  dropoffLocations: ProcessedDropoffLocation[]
) => {
  //Currently, the way it works is that any location that has non-empty start and end times considered to be registered for the most recent upcoming event
  return dropoffLocations.filter(
    (location) => location.startTime && location.endTime
  );
};
//Tailwind classes
const label = "text-sm md:text-base lg:text-xl ";
const text = "text-sm font-bold text-newLeafGreen md:text-base lg:text-xl";
const sectionHeader =
  "flex items-start gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
const sectionHeaderIcon = "w-6 lg:w-10";

export function DriverLocationInfo() {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  const { eventId } = useParams();

  const locationsToDriversTextQuery = useQuery(
    ["fetchLocationsToDriversText"],
    async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/messaging/locations-to-drivers-text`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json() as Promise<string>;
    },
    { staleTime: 20000 }
  );

  const driverInfoToCoordinatorsTextQuery = useQuery(
    ["fetchDriverInfoToCoordinatorsText"],
    async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/messaging/driver-info-to-coordinators-text`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json() as Promise<string>;
    },
    { staleTime: 20000 }
  );

  const locationsToDriversTextLoading =
    locationsToDriversTextQuery.status === "loading" ||
    locationsToDriversTextQuery.status === "idle";

  const driverInfoToCoordinatorsLoading =
    driverInfoToCoordinatorsTextQuery.status === "loading" ||
    driverInfoToCoordinatorsTextQuery.status === "idle";

  const eventQuery = useFutureEventById(eventId);
  const driversInfoQuery = useDriversInfo();

  const dropoffLocationsQuery = useQuery(
    ["fetchEventDropOffLocations"],
    async () => {
      const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.messsage);
      }
      return resp.json();
    }
  );

  if (
    driversInfoQuery.isLoading ||
    eventQuery.status === "loading" ||
    eventQuery.status === "idle" ||
    dropoffLocationsQuery.status === "loading" ||
    dropoffLocationsQuery.status === "idle"
  ) {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (
    driversInfoQuery.isError ||
    dropoffLocationsQuery.status === "error" ||
    eventQuery.status === "error"
  ) {
    const error =
      driversInfoQuery.error || dropoffLocationsQuery.error || eventQuery.error;
    console.error(error);
    return <div>Error...</div>;
  }

  const event = eventQuery.data;
  if (event === undefined) {
    console.error(
      `Something went wrong. Event with id ${eventId} not found in futureEvents list.`
    );
    return <div>Error...</div>;
  }
  const dropoffLocationsForEvent = getDropoffLocationsForEvent(
    dropoffLocationsQuery.data
  );
  return (
    <>
      <Navbar />
      <div className="p-6 lg:px-14 lg:py-10">
        {/* Not sure why inline-block on the Link is necessary */}
        <Link className="inline-block" to={`/events/${eventId}`}>
          <button
            className="flex w-fit shrink-0 items-center gap-3 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white lg:px-4 lg:py-2 lg:text-lg lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
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
          {/* Drivers table */}
          <DataTable
            borderColor="softGrayWhite"
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
              "Location Information",
              "Contact",
            ]}
            dataRows={processDriversForTable(
              driversInfoQuery.data,
              dropoffLocationsForEvent,
              driversInfoQuery.refetch
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
              defaultValue={locationsToDriversTextQuery.data}
            />
          )}
          <SendTextMessageButton
            label="Send Locations to Drivers"
            loading={locationsToDriversTextLoading}
            url={`${API_BASE_URL}/api/messaging/locations-to-drivers-text`}
            successMessage="Location information to drivers Make automation started"
            errorMessage="Unable to start Make automation"
          />
        </div>
        <div className="h-16" />
        <div className={sectionHeader}>
          <img className={sectionHeaderIcon} src={driving} />
          <h1>Location Information</h1>
        </div>
        <div className="h-8" />
        <div className="h-screen">
          {/* Locations Table */}
          <DataTable
            borderColor="softGrayWhite"
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
              driversInfoQuery.data,
              dropoffLocationsForEvent
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
                defaultValue={driverInfoToCoordinatorsTextQuery.data}
              />
            )}
            <SendTextMessageButton
              label="Send Driver Info to Coordinators"
              loading={driverInfoToCoordinatorsLoading}
              url={`${API_BASE_URL}/api/messaging/driver-info-to-coordinators-text`}
              successMessage="Driver information to coordinators Make automation started"
              errorMessage="Unable to start Make automation"
            />
          </div>
          <DropoffOrganizerPopup
            date={event.date}
            dropoffLocations={dropoffLocationsQuery.data}
            refetchDropoffLocations={dropoffLocationsQuery.refetch}
          />
        </div>
        <div className="h-16" />
      </div>
    </>
  );
}
