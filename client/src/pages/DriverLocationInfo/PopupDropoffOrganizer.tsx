import { useMutation, useQuery } from "react-query";
import { useState } from "react";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import { ProcessedDropOffOrganizer } from "../../types";
import { DataTable } from "../../components/DataTable";
import { Popup } from "../../components/Popup";
import * as Modal from "@radix-ui/react-dialog";

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
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isInvalidStart, setIsInvalidStart] = useState(false);
    const [isInvalidEnd, setIsInvalidEnd] = useState(false);

    const invalidStart = (a: boolean) => {
      setIsInvalidStart(a);
    };

    const invalidEnd = (a: boolean) => {
      setIsInvalidEnd(a);
    };

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
            ? "border-red-600 focus:outline-red-600"
            : "border-softGrayWhite focus:outline-softGrayWhite"
        } text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50`}
        type="text"
        placeholder={curLocation.startTime || "00:00 AM"}
        value={startTime}
        onChange={(e) => {
          if (e.target.value && !validTime.test(e.target.value)) {
            setDropoffValue(curLocation.id, "startTime", e.target.value, false);
            setStartTime(e.target.value);
            invalidStart(true);
            console.log("Invalid start time");
          } else {
            setDropoffValue(curLocation.id, "startTime", e.target.value, true);
            setStartTime(e.target.value);
            invalidStart(false);
          }
        }}
      ></input>,

      // EndTime Input,
      <input
        className={`h-10 w-20 border bg-softBeige p-1 ${
          isInvalidEnd ? "border-red-600" : "border-softGrayWhite"
        } text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50 ${
          isInvalidEnd ? "focus:outline-red-600" : "focus:outline-softGrayWhite"
        }`}
        type="text"
        placeholder={curLocation.endTime || "00:00 AM"}
        value={endTime}
        onChange={(e) => {
          if (e.target.value && !validTime.test(e.target.value)) {
            setEndTime(e.target.value);
            invalidEnd(true);
            console.log("Invalid end time");
          } else {
            setEndTime(e.target.value);
            invalidEnd(false);
          }
        }}
      ></input>,

      // Deliveries Needed Input
      <input
        className="h-10 w-20 border border-softGrayWhite bg-softBeige p-1 text-center text-newLeafGreen placeholder:text-center placeholder:text-newLeafGreen placeholder:text-opacity-50 focus:outline-softGrayWhite"
        type="number"
        min="0"
        placeholder={`${curLocation.deliveriesNeeded || 0}`}
      ></input>,
    ];
    output.push(curRow);
  }
  return output;
}

export const PopupDropoffOrganizer: React.FC<Props> = () => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  const validTime = /^(0?[1-9]|1[012]):([0-5]\d) ([AaPp][Mm])$/g;

  // Convert 12 hour to ISO 8601
  const toISO = function (time: string) {
    let results = [...time.matchAll(validTime)];
    //console.log(results[0]);
    let hours = results[0][1];
    let minutes = results[0][2];

    // Convert 12 hour to 24 hour format
    if (hours === "12") {
      hours = "00";
    }
    if (/^[Pp][Mm]$/.test(results[0][3])) {
      console.log("This is PM");
      hours = (parseInt(hours, 10) + 12).toString();
    }

    // Convert to UTC
    let date = "24 December 2022"; // Temporary date - change to correct
    let dateTime = new Date(date + " " + hours + ":" + minutes);
    console.log(dateTime.toISOString());
    return dateTime.toISOString();
  };

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
      const data = await resp.json();
      throw new Error(data.messsage);
    }
    return resp.json();
  });
  console.log("dropoffOrganizers", dropoffOrganizers);

  const [dropoffStore, setDropoffStore] = useState<any>({});

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
      const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dropoffStore),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.messsage);
      }
      return resp.json();
    },
  });
  /* 
    object key of id {id -> object {startTime, endTime, deliveriesNeeded}}
    Update useState somehow
  */
  console.log(dropoffStore);

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
              Cancel
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
