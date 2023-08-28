import { useMutation, useQuery } from "react-query";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { Popup } from "../../components/Popup";
import * as Modal from "@radix-ui/react-dialog";
import { ProcessedDropoffLocation } from "../../types";
import { cn, toastNotify } from "../../utils/ui";
import { Loading } from "../../components/Loading";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import { applyPatch } from "../../utils/http";


interface DropoffLocationsStore {
  [id: string]: DropoffLocationForm;
}

interface DropoffLocationForm {
  startTime: [value: string, isValidStartTime: boolean];
  endTime: [value: string, isValidEndTime: boolean];
  deliveriesNeeded: number | null;
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
      .map((curLocation, idx) => {
        //console.log(curLocation)
        const [startTime, isStartTimeValid] = dropoffStore[curLocation.id]
          ? dropoffStore[curLocation.id].startTime
          : [null, true];
        const [endTime, isEndTimeValid] = dropoffStore[curLocation.id]
          ? dropoffStore[curLocation.id].endTime
          : [null, true];
        const deliveriesNeeded = dropoffStore[curLocation.id]
          ? dropoffStore[curLocation.id].deliveriesNeeded
          : null;
        const { token } = useAuth();

        return [
          curLocation.id,
          curLocation.siteName,
          curLocation.address,
          curLocation.neighborhoods.join(", "),
          // Start time input
          <input
            className={`h-10 w-20 rounded border bg-softBeige p-1 ${isStartTimeValid
              ? "border-softGrayWhite focus:outline-softGrayWhite"
              : "border-red-600 focus:outline-red-600"
              } text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-50`}
            type="text"
            autoFocus={idx === 0}
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
            className={`h-10 w-20 rounded border bg-softBeige p-1 ${isEndTimeValid
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
            className="border-softGrayWhite bg-softBeige text-newLeafGreen placeholder:text-newLeafGreen focus:outline-softGrayWhite h-10 w-20 rounded border p-1 text-center placeholder:text-opacity-50"
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
          <HttpCheckbox
            checked={curLocation.notavailable}
            mutationFn={applyPatch(
              `/api/dropoff-locations/notavailable/${curLocation.id}`,
              { newNotAvailable: !curLocation.notavailable },
              token as string
            )}
            onSuccess={() => {
              const toastMessage = `${curLocation.siteName} is now ${curLocation.notavailable ? "Available" : "Not Available"
                }`;
              refetchDropoffLocations();
              toastNotify(toastMessage, "success");
            }}
            onError={() => toastNotify("Unable to change availability", "failure")}
          />,
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

      const resp = await fetch(`/api/dropoff-locations/`, {
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
      className={cn(
        "bg-softBeige fixed left-[50%] top-0 h-[27rem] w-full -translate-x-1/2 p-4",
        "md:top-[50%] md:w-[40rem] md:-translate-y-1/2 md:rounded-lg md:py-2 md:px-8",
        "lg:h-[40rem] lg:w-[80rem]"
      )}
      trigger={
        <button
          className="bg-pumpkinOrange lg:shadow-newLeafGreen lg:hover:shadow-newLeafGreen rounded-full px-3 py-2 text-sm font-semibold text-white outline-none lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg"
          type="button"
        >
          + Add Dropoff Location
        </button>
      }
    >
      <>
        <Modal.Title className="text-newLeafGreen flex h-[10%] items-center justify-center text-lg font-bold lg:text-3xl">
          Drop-off Location Organizer
        </Modal.Title>
        <div className="h-[80%]">
          <DataTable
            borderColor="newLeafGreen"
            columnHeaders={[
              "Site Location",
              "Address",
              "Neighborhood",
              "Start Time",
              "End Time",
              "Deliveries Needed",
              "Not Available"
            ]}
            dataRows={processDropoffLocationsForTable(
              dropoffLocations,
              dropoffStore,
              setDropoffStore
            )}
          />
        </div>
        <div className="flex h-[10%] items-center justify-center gap-10">
          <Modal.Close
            className={cn(
              "rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white",
              "hover:brightness-110 focus:brightness-110",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            )}
            type="button"
          >
            Close
          </Modal.Close>
          <button
            disabled={
              !isValidInput(dropoffStore) ||
              saveDropoffLocations.status === "loading"
            }
            className={cn(
              "bg-newLeafGreen rounded-full px-3 py-2 text-xs font-semibold text-white",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold",
              isValidInput(dropoffStore) &&
                saveDropoffLocations.status !== "loading" ? "hover:cursor-pointer hover:brightness-150 focus:brightness-200" : "opacity-50"
            )}
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
      </>
    </Popup>
  );
};
