import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";

import React, { useEffect, useState } from "react";
//Types
import { AirtableResponse, ProcessedEvent, ScheduledSlot } from "../../types";
//Components
import { Loading } from "../../components/Loading";
import { VolunteersTable } from "./VolunteersTable";
//Assets
import alert from "../../assets/alert.svg";
import check from "../../assets/check.svg";
import calendar from "../../assets/calendar.svg";
import people from "../../assets/people.svg";
import roster from "../../assets/roster.svg";
import ex from "../../assets/ex.svg";
import { Messaging } from "./Messaging";
import { API_BASE_URL } from "../../httpUtils";

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

const HeaderValueDisplay: React.FC<{
  header: string;
  value: string | number;
}> = (props: { header: string; value: string | number }) => {
  return (
    <div className="flex flex-col">
      <p className="lg:text-xl">{props.header}</p>
      <p className="font-semibold text-newLeafGreen lg:text-xl">
        {props.value}
      </p>
    </div>
  );
};

export const ViewEvent = () => {
  const { eventId } = useParams();
  const { event, eventStatus, eventError } = useFutureEventById(eventId);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");

  const handleChange = (e: any) => {
    setName(e.target.value);
  };

  useEffect(() => {
    setShow(show);
  }, []);

  const {
    data: scheduledSlots,
    refetch: refetchScheduledSlots,
    status: scheduledSlotsStatus,
    error: scheduledSlotsError,
  } = useQuery(
    ["fetchScheduledSlotsForEvent", eventId],
    async () => {
      if (typeof event === "undefined") {
        return Promise.reject(new Error("Undefined event"));
      }
      const scheduledSlotsIds = event.scheduledSlots.join(",");
      const response = await fetch(
        `${API_BASE_URL}/api/volunteers/?scheduledSlotsIds=${scheduledSlotsIds}`
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json() as Promise<AirtableResponse<ScheduledSlot>>;
    },
    { enabled: eventStatus === "success" }
  );

  if (scheduledSlotsStatus === "loading" || scheduledSlotsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (scheduledSlotsStatus === "error") {
    const error = eventError || scheduledSlotsError;
    console.error(error);
    return <div>Error...</div>;
  }

  if (event === undefined) {
    console.error(
      `Something went wrong. Event ${event} not found in futureEvents list.`
    );
    return <div>Error...</div>;
  }

  scheduledSlots.records.sort((a, b) =>
    a.fields["First Name"] < b.fields["First Name"] ? -1 : 1
  );

  console.log("scheduledSlots", scheduledSlots);

  //Tailwind classes
  const sectionHeader =
    "flex items-center gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
  const sectionHeaderIcon = "w-6 lg:w-10";

  return (
    <div className="p-6 lg:px-14 lg:py-10">
      <div
        className="p-10 flex flex-col gap-10 absolute bg-softBeige w-3/5 h-2/3
        shadow-2xl shadow-slate-700 rounded-3xl"
        style={{
          zIndex: 2,
          visibility: show ? "visible" : "hidden",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <button
          onClick={() => setShow(false)}
          className="flex top-7 right-7 absolute"
        >
          <img src={ex} className="w-4 lg:w-8" />
        </button>
        <div className="flex justify-center">
          <h1 className={sectionHeader}>Add Special Group to Event</h1>
        </div>

        <div className="flex justify-center gap-10">
          <p className="font-bold text-newLeafGreen lg:text-2xl">Group Name:</p>
          <input
            className="py-1 px-3 mb-24 bg-softBeige border-2 border-softGrayWhite 
            rounded-xl text-lg w-1/2"
            onChange={(e) => handleChange(e)}
            placeholder="Search through groups..."
            type="text"
            defaultValue={name}
          ></input>
        </div>
        <div className="flex justify-center gap-10">
          <button
            onClick={() => setShow(false)}
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-newLeafGreen px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            Add Group and Generate Link
          </button>
        </div>
      </div>

      <div
        style={{
          opacity: show ? "0.3" : "1",
        }}
      >
        {/* Event Info */}
        <h1 className={sectionHeader}>
          <img className={sectionHeaderIcon} src={calendar} alt="calendar" />
          {event.dateDisplay}
        </h1>
        <div className="h-4" />
        <div className="flex flex-col gap-3 md:flex-row md:gap-10">
          <HeaderValueDisplay header="Time" value={event.time} />
          <HeaderValueDisplay
            header="Main Location"
            value={event.mainLocation}
          />
          <HeaderValueDisplay
            header="Total Participants"
            value={event.numtotalParticipants}
          />
        </div>
        <div className="h-12" />
        {/* Participant Breakdown */}
        <h1 className={sectionHeader}>
          <img className={sectionHeaderIcon} src={people} alt="people" />
          Participant Breakdown
        </h1>
        <div className="h-4" />
        <div className="flex flex-col gap-2 md:flex-row md:gap-10">
          <div className="grid gap-2 md:grid-cols-3 md:grid-rows-2">
            <div className="flex flex-col ">
              <p className="lg:text-xl">Total # of Drivers</p>
              <p className="flex gap-4 font-semibold text-newLeafGreen lg:text-xl">
                {event.numDrivers}/30
                <img
                  className="mt-1 w-4 md:w-6 lg:w-7"
                  src={event.numDrivers >= 30 ? check : alert}
                  alt="wut"
                />
              </p>
            </div>
            <HeaderValueDisplay
              header="Total # of Packers"
              value={event.numPackers}
            />
            <HeaderValueDisplay
              header="Both Drivers & Packers"
              value={event.numBothDriversAndPackers}
            />
            <HeaderValueDisplay
              header="Only Drivers"
              value={event.numOnlyDrivers}
            />
            <HeaderValueDisplay
              header="Only Packers"
              value={event.numOnlyPackers}
            />
            <HeaderValueDisplay
              header="# of Special Groups"
              value={event.numSpecialGroups}
            />
          </div>

          <div className="flex flex-col items-start justify-around gap-2 ">
            <div>
              <button
                onClick={() => setShow(true)}
                className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
                type="button"
              >
                + Add Special Group
              </button>
            </div>

            <button
              className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
              type="button"
            >
              View Special Groups
            </button>
          </div>
        </div>
        <div className="h-12" />
        <h1 className={sectionHeader}>
          <img className={sectionHeaderIcon} src={roster} alt="roster" />
          Participant Roster
        </h1>
        {/* Volunteer Table */}
        <VolunteersTable
          scheduledSlots={scheduledSlots.records}
          refetchVolunteers={refetchScheduledSlots}
        />
        <div className="h-4" />
        <Link to={`/events/driver-location-info/${eventId}`}>
          <button
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            Delivery and Location Info
          </button>
        </Link>
        <div className="h-12" />
        <Messaging />
        <div className="h-12" />
      </div>
    </div>
  );
};
