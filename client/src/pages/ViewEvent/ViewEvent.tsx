import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useFutureEventById } from "../eventHook";

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
import { Messaging } from "./Messaging";
import { API_BASE_URL } from "../../httpUtils";
import { Navbar } from "../../components/Navbar/Navbar";
import { Dropdown } from "../../components/SpecialGroupDropdown";
import Popup from "../../components/Popup";

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

  const [group, setGroup] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegistered = (value: boolean) => {
    setRegistered(value);
  };

  const close = () => {
    setGroup("");
    setRegistered(false);
    console.log(registered);
  };

  const handleQuery = (query: string) => {
    setGroup(query);
  };

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

  // Special group link popup
  const linkTitle = "Special Group Link";
  const linkTrigger = (
    <div>
      <button
        disabled={group ? false : true}
        className="rounded-full bg-newLeafGreen px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
        type="button"
      >
        Add Group and Generate Link
      </button>
    </div>
  );

  const linkContent = (
    <div>
      <p>{group}</p>
    </div>
  );

  // Add special group popup content
  const addTitle = "Add Special Group to Event";
  const addTrigger = (
    <button
      className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
      type="button"
    >
      + Add Special Group
    </button>
  );
  const addNext = !registered ? (
    <div>
      <Popup
        title={linkTitle}
        trigger={linkTrigger}
        content={linkContent}
        noCancel
      />
    </div>
  ) : (
    <div>
      <Popup
        title="Cannot generate link because group is already registered!"
        trigger={linkTrigger}
        noCancel
      />
    </div>
  );

  const addContent = (
    <div>
      <div className="flex justify-center gap-5 h-72">
        <p className="font-bold text-newLeafGreen lg:text-2xl">Group Name:</p>
        <Dropdown
          handleQuery={handleQuery}
          handleRegistered={handleRegistered}
        />
      </div>
      <div className="flex justify-center gap-10"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="p-6 lg:px-14 lg:py-10">
        <div>
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
              <Popup
                title={addTitle}
                trigger={addTrigger}
                content={addContent}
                next={addNext}
                close={close}
              />

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
    </>
  );
};
