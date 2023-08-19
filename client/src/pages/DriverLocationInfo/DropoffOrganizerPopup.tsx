import { useMutation, useQuery } from "react-query";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { Popup } from "../../components/Popup";
import * as Modal from "@radix-ui/react-dialog";
import { ProcessedDropoffLocation } from "../../types";
import { toastNotify } from "../../uiUtils";
import { Loading } from "../../components/Loading";

interface DropoffLocationsStore {
  [id: string]: DropoffLocationForm;
}

interface DropoffLocationForm {
  startTime: [value: string, isValidStartTime: boolean];
  endTime: [value: string, isValidEndTime: boolean];
  deliveriesNeeded: number | null;
}

//Regex for validating time
const validTime = /^(0?[1-9]|1[012]):([0-5]\d)\s?([AaPp][Mm])$/;

function processDropoffLocationsForTable(
  dropoffLocations: ProcessedDropoffLocation[] | undefined,
  dropoffStore: DropoffLocationsStore,
  setDropoffStore: (
    setter: (prev: DropoffLocationsStore) => DropoffLocationsStore
  ) => void
) {
  if (!dropoffLocations) {
    return [];
  }
  const setDropoffValue = (
    id: string,
    fieldName: keyof DropoffLocationForm,
    fieldValue: [string, boolean] | number | null
  ) => {
    setDropoffStore((prev: DropoffLocationsStore) => {
      return {
        ...prev,
        [id]: {
          ...prev[id],
          [fieldName]: fieldValue,
        },
      };
    });
  };

  return dropoffLocations
    .sort((a, b) => (a.siteName < b.siteName ? -1 : 1))
    .map((curLocation) => {
      const [startTime, isStartTimeValid] = dropoffStore[curLocation.id]
        ? dropoffStore[curLocation.id].startTime
        : [null, true];
      const [endTime, isEndTimeValid] = dropoffStore[curLocation.id]
        ? dropoffStore[curLocation.id].endTime
        : [null, true];
      const deliveriesNeeded = dropoffStore[curLocation.id]
        ? dropoffStore[curLocation.id].deliveriesNeeded
        : null;

      return [
        curLocation.id,
        curLocation.siteName,
        curLocation.address,
        curLocation.neighborhoods.join(", "),
        // Start time input
        <input
          className={`h-10 w-20 rounded border bg-softBeige p-1 ${
            isStartTimeValid
              ? "border-softGrayWhite focus:outline-softGrayWhite"
              : "border-red-600 focus:outline-red-600"
          } text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-50`}
          type="text"
          value={startTime || ""}
          placeholder="00:00 AM"
          onChange={(e) => {
            const isTimeValid =
              e.target.value === "" || validTime.test(e.target.value);
            setDropoffValue(curLocation.id, "startTime", [
              e.target.value,
              isTimeValid,
            ]);
          }}
        ></input>,

        // End time input,
        <input
          className={`h-10 w-20 rounded border bg-softBeige p-1 ${
            isEndTimeValid
              ? "border-softGrayWhite focus:outline-softGrayWhite"
              : "border-red-600 focus:outline-red-600"
          }  text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-50`}
          type="text"
          placeholder="00:00 AM"
          value={endTime || ""}
          onChange={(e) => {
            const isTimeValid =
              e.target.value === "" || validTime.test(e.target.value);
            setDropoffValue(curLocation.id, "endTime", [
              e.target.value,
              isTimeValid,
            ]);
          }}
        ></input>,

        // Deliveries Needed Input
        <input
          className="h-10 w-20 rounded border border-softGrayWhite bg-softBeige p-1 text-center text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-50 focus:outline-softGrayWhite"
          type="number"
          min="0"
          placeholder="0"
          value={deliveriesNeeded ?? ""}
          onChange={(e) => {
            setDropoffValue(
              curLocation.id,
              "deliveriesNeeded",
              e.target.value ? parseInt(e.target.value, 10) : null
            );
          }}
        ></input>,
      ];
    });
}

function populateStoreWithFetchedData(
  dropoffLocations: ProcessedDropoffLocation[] | undefined
) {
  if (!dropoffLocations) {
    return {};
  }
  const dropoffStore: DropoffLocationsStore = {};
  dropoffLocations.forEach((location) => {
    dropoffStore[location.id] = {
      startTime: [location.startTime || "", true],
      endTime: [location.endTime || "", true],
      deliveriesNeeded: location.deliveriesNeeded || 0,
    };
  });
  return dropoffStore;
}

// Convert 12 hour to ISO 8601
function toISO(time: string, date: Date): string {
  if (time === "") {
    return "";
  }

  let results = time.match(validTime);
  if (!results) {
    throw new Error("'time' string does not match 'validTime' regex.");
  }
  let [hours, minutes, amOrPm] = results.slice(1);
  // Convert 12 hour to 24 hour format
  if (hours === "12") {
    hours = "00";
  }
  const isPm = /^[Pp][Mm]$/.test(amOrPm);
  if (isPm) {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  let newDate = new Date(date);
  newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

  // see airtable docs:https://airtable.com/appzrHPKHoq93uirT/api/docs#javascript/table:📍%20drop%20off%20locations:update
  /*
   * When updating date time values in Starts accepting at, Stops accepting at and Interview Date, ambiguous string
   * inputs like "2020-09-05T07:00:00" and "2020-09-08" will be interpreted according to the time zone of the field
   * if specified, and nonambiguous string inputs with zone offset like "2020-09-05T07:00:00.000Z" and
   * "2020-09-08T00:00:00-07:00" will be interpreted as the underlying timestamp.
   */

  return newDate.toISOString();
}

//Check if there exists any invalid inputs amongst all of the dropoff locations in the popup.
function isValidInput(dropoffStore: DropoffLocationsStore) {
  for (const id in dropoffStore) {
    const isStartTimeValid = dropoffStore[id].startTime[1];
    const isEndTimeValid = dropoffStore[id].endTime[1];
    if (!isStartTimeValid || !isEndTimeValid) {
      return false;
    }
  }
  return true;
}

export const DropoffOrganizerPopup: React.FC<{
  date: Date;
  dropoffLocations: ProcessedDropoffLocation[];
  refetchDropoffLocations: () => void;
}> = ({ date, dropoffLocations, refetchDropoffLocations }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  const saveDropoffLocations = useMutation({
    mutationFn: async () => {
      const payload: {
        [id: string]: {
          startTime: string;
          endTime: string;
          deliveriesNeeded: number;
        };
      } = {};

      for (const id in dropoffStore) {
        payload[id] = {
          startTime: toISO(dropoffStore[id].startTime[0], date),
          endTime: toISO(dropoffStore[id].endTime[0], date),
          deliveriesNeeded: dropoffStore[id].deliveriesNeeded || 0,
        };
      }

      const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.messsage);
      }
      return resp.json();
    },
    onSuccess(data, variables, context) {
      toastNotify("Drop-off locations saved successfully", "success");
      refetchDropoffLocations();
    },
    onError(error, variables, context) {
      console.error(error);
      toastNotify("There was a problem saving dropoff-locations", "failure");
    },
  });

  const [dropoffStore, setDropoffStore] = useState<DropoffLocationsStore>({});
  useEffect(() => {
    setDropoffStore(populateStoreWithFetchedData(dropoffLocations));
  }, [dropoffLocations]);

  return (
    <Popup
      className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-3 px-5 drop-shadow-lg lg:px-8 lg:py-6"
      trigger={
        <button
          className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white outline-none lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
          type="button"
        >
          + Add Dropoff Location
        </button>
      }
    >
      <div>
        <Modal.Title className="m-0 flex justify-center text-xl font-bold text-newLeafGreen lg:px-16 lg:text-3xl">
          Drop-off Location Organizer
        </Modal.Title>
        <div className="h-6" />
        <div className="h-96">
          <DataTable
            borderColor="newLeafGreen"
            columnHeaders={[
              "Site Location",
              "Address",
              "Neighborhood",
              "Start Time",
              "End Time",
              "Deliveries Needed",
            ]}
            dataRows={processDropoffLocationsForTable(
              dropoffLocations,
              dropoffStore,
              setDropoffStore
            )}
          />
        </div>
        <div className="h-4" />
        <div className="flex justify-evenly">
          <Modal.Close className="rounded-full bg-pumpkinOrange px-2 py-1 text-xs font-semibold text-white outline-none md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen">
            Close
          </Modal.Close>
          <button
            disabled={
              !isValidInput(dropoffStore) ||
              saveDropoffLocations.status === "loading"
            }
            className={
              "rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white outline-none md:px-4 md:py-2  lg:px-8 lg:py-4 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:hover:shadow-newLeafGreen " +
              (isValidInput(dropoffStore) &&
              saveDropoffLocations.status !== "loading"
                ? "lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg"
                : "opacity-50")
            }
            type="button"
            onClick={() => saveDropoffLocations.mutate()}
          >
            {saveDropoffLocations.status === "loading" ? (
              <div className="relative min-h-full w-24 lg:w-40">
                <Loading size="xsmall" thickness="thin" />
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </Popup>
  );
};
