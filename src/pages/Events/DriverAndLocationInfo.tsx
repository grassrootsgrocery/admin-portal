import { Link, useParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { Loading } from "../../components/Loading";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import { useDriversInfo } from "./driverInfoHooks";
import { useDropOffLocations } from "./dropoffLocationHooks";
import { Dropdown } from "../../components/AssignDropdown";

const filters = [
  {
    label: "Test",
    filter: (e: ProcessedDropoffLocation) => true,
  },
  {
    label: "Co-op City Fridge",
    filter: (e: ProcessedDropoffLocation) => true,
  },
  {
    label: "ABC Street",
    filter: (e: ProcessedDropoffLocation) => true,
  },
  {
    label: "New Settlement Community Center",
    filter: (e: ProcessedDropoffLocation) => true,
  },
];

//Takes in ProcessedDriver array and formats data for DataTable component
function processDriversForTable(drivers: ProcessedDriver[], processedDropOffLocations: ProcessedDropoffLocation[]) {
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
      <Dropdown filters={filters} locations={processedDropOffLocations} />,
    ];
    output.push(curRow);
  }
  return output;
}

export function DriverAndLocationInfo() {
  const { eventId } = useParams();

  const {
    driversInfo,
    driversInfoIsLoading,
    driversInfoIsError,
    driversInfoError,
  } = useDriversInfo();
  console.log(driversInfo);

  const { processedDropOffLocations, processedDropOffLocationsStatus, processedDropOffLocationsError } =
  useDropOffLocations();

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

  if (processedDropOffLocationsStatus === "loading" || processedDropOffLocationsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (processedDropOffLocationsStatus === "error") {
    console.error(processedDropOffLocationsError);
    return <div>Error...</div>;
  }

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
          "Assign Location",
        ]}
        dataRows={processDriversForTable(driversInfo, processedDropOffLocations)}
      />
    </div>
  );
}
