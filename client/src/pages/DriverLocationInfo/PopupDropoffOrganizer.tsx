import { useMutation, useQuery } from "react-query";
import { useState } from "react";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import { ProcessedDropOffOrganizer } from "../../types";
import { DataTable } from "../../components/DataTable";
import { Popup } from "../../components/Popup";
import * as Modal from "@radix-ui/react-dialog";
import { constants } from "buffer";

interface Props {}
function processDropoffOrganizerForPopUp(
  processedDropOffOrganizer: ProcessedDropOffOrganizer[],
  dropoffStore: any,
  setDropoffValue: (
    id: string,
    fieldName: string,
    fieldValue: string,
    isValid: boolean
  ) => void
) {
  let output = [];
  const validTime = /^(0?[1-9]|1[012]):([0-5]\d) ([AaPp][Mm])$/g;

  for (let i = 0; i < processedDropOffOrganizer.length; i++) {
    const curLocation = processedDropOffOrganizer[i];
    let curRow = [
      curLocation.id, //id
      curLocation.siteName,
      curLocation.address,
      curLocation.neighborhoods.join(", "),

      // Start time input
      <input
        className={`h-10 w-20 border bg-softBeige p-1 ${
          dropoffStore[curLocation.id]?.isValid
            ? "border-softGrayWhite focus:outline-softGrayWhite"
            : "border-red-600 focus:outline-red-600"
        } text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50`}
        type="text"
        placeholder={curLocation.startTime || "00:00 AM"}
        value={dropoffStore[curLocation.id].startTime}
        onChange={(e) => {
          if (e.target.value && !validTime.test(e.target.value)) {
            setDropoffValue(curLocation.id, "startTime", e.target.value, false);
          } else {
            setDropoffValue(curLocation.id, "startTime", e.target.value, true);
          }
        }}
      ></input>,

      // EndTime Input,
      <input
        className={`h-10 w-20 border bg-softBeige p-1 ${
          dropoffStore[curLocation.id]?.isValid
            ? "border-softGrayWhite focus:outline-softGrayWhite"
            : "border-red-600 focus:outline-red-600"
        } text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50`}
        type="text"
        placeholder={curLocation.endTime || "00:00 AM"}
        value={dropoffStore[curLocation.id].endTime}
        onChange={(e) => {
          if (e.target.value && !validTime.test(e.target.value)) {
            setDropoffValue(curLocation.id, "endTime", e.target.value, false);
          } else {
            setDropoffValue(curLocation.id, "endTime", e.target.value, true);
          }
        }}
      ></input>,

      // Deliveries Needed Input
      <input
        className="h-10 w-20 border border-softGrayWhite bg-softBeige p-1 text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50 focus:outline-softGrayWhite"
        type="number"
        min="0"
        placeholder={`${curLocation.deliveriesNeeded || 0}`}
        value={dropoffStore[curLocation.id].deliveriesNeeded}
        onChange={(e) => {
          setDropoffValue(
            curLocation.id,
            "deliveriesNeeded",
            e.target.value,
            false
          );
        }}
      ></input>,
    ];
    output.push(curRow);
  }
  return output;
}

/**
 * Uses processedDropOffOrganizer from query to initialize dropoffStore values
 * @param processedDropOffOrganizer
 * @returns initialized dropoffStore
 */
function populateStoreWithFetchedData(
  processedDropOffOrganizer: ProcessedDropOffOrganizer[]
) {
  const dropoffStore: any = {};
  for (let i = 0; i < processedDropOffOrganizer.length; i++) {
    const curLocation = processedDropOffOrganizer[i];

    dropoffStore[curLocation.id] = {
      startTime: curLocation.startTime || "",
      endTime: curLocation.endTime || "",
      deliveriesNeeded: curLocation.deliveriesNeeded || 0,
      isValid: true,
    };
  }
  return dropoffStore;
}

// Convert time
const validTime = /^(0?[1-9]|1[012]):([0-5]\d) ([AaPp][Mm])$/g;

// Convert 12 hour to ISO 8601
function toISO(time: string) {
  let date = "7 January 2023"; // Temporary date - change to correct

  if (!time) {
    let defaultTime = new Date(date + " 00:00");
    return defaultTime.toISOString();
  }

  let results = [...time.matchAll(validTime)];
  let hours = results[0][1];
  let minutes = results[0][2];

  // Convert 12 hour to 24 hour format
  if (hours === "12") {
    hours = "00";
  }
  if (/^[Pp][Mm]$/.test(results[0][3])) {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  // Convert to UTC
  let dateTime = new Date(date + " " + hours + ":" + minutes);
  // console.log("ISO Return Val: ", dateTime.toISOString());
  return dateTime.toISOString();
}

export const PopupDropoffOrganizer: React.FC<Props> = () => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  const {
    data: dropoffOrganizers,
    status: dropoffOrganizersStatus,
    error: dropoffOrganizersError,
  } = useQuery(["fetchDropOffLocations"], async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/dropoff-locations/partner-organizers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!resp.ok) {
      console.log("Resp: ", resp);
      const data = await resp.json();
      throw new Error(data.messsage);
    }
    return resp.json();
  });
  // console.log("dropoffOrganizers", dropoffOrganizers);

  const [dropoffStore, setDropoffStore] = useState<any>(
    populateStoreWithFetchedData(dropoffOrganizers)
  );

  const setDropoffValue = (
    id: string,
    fieldName: string,
    fieldValue: string,
    isValid: boolean
  ) => {
    setDropoffStore((prev: any) => {
      return {
        ...prev,
        [id]: {
          ...prev[id],
          [fieldName]: fieldValue,
          isValid,
        },
      };
    });
  };

  const saveDropoffLocations = useMutation({
    mutationFn: async () => {
      const dropoffAirtableStore: any = {}; // Copied dropoffStore with converted times for airtable call
      console.log("DropoffStore: ", dropoffStore);

      // Traverses dropoffStore, converting the times toISO and copying to dropoffAirtableStore
      for (const id in dropoffStore) {
        dropoffAirtableStore[id] = {
          startTime: toISO(dropoffStore[id].startTime) || "",
          endTime: toISO(dropoffStore[id].endTime) || "",
          deliveriesNeeded: dropoffStore[id].deliveriesNeeded || 0,
          // isValid: true,
        };
      }
      console.log("DropoffAirtableStore: Before Patching", dropoffAirtableStore);

      const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dropoffAirtableStore),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.messsage);
      }
      return resp.json();
    },
  });

  return (
    <Popup
      trigger={
        <button
          className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          type="button"
        >
          + Add Dropoff Location
        </button>
      }
      content={
        <div>
          <Modal.Title className="m-0 flex justify-center px-16 text-3xl font-bold text-newLeafGreen">
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
              dataRows={processDropoffOrganizerForPopUp(
                dropoffOrganizers,
                dropoffStore,
                setDropoffValue
              )}
            />
          </div>
          <div className="h-4" />
          <div className="flex justify-evenly ">
            <Modal.Close className="rounded-full bg-pumpkinOrange px-2 py-1 text-xs font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl">
              Close
            </Modal.Close>
            <button
              className="rounded-full bg-newLeafGreen  px-2 py-1 text-xs font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl"
              type="button"
              onClick={() => saveDropoffLocations.mutate()}
            >
              Save Changes
            </button>
          </div>
        </div>
      }
    />
  );
};
