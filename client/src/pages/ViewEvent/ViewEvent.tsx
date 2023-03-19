import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useFutureEventById } from "../eventHooks";
import React from "react";
//Types
import { ProcessedScheduledSlot } from "../../types";
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
import { Navbar } from "../../components/Navbar";
import { AddSpecialGroup } from "./AddSpecialGroup";
import { useAuth } from "../../contexts/AuthContext";
import { ViewSpecialGroups } from "./ViewSpecialGroups";

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
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  const { eventId } = useParams();
  const eventQuery = useFutureEventById(eventId);

  const scheduledSlotsQuery = useQuery(
    ["fetchVolunteersForEvent", eventId],
    async () => {
      if (typeof eventQuery.data === "undefined") {
        return Promise.reject(new Error("Undefined event"));
      }
      const scheduledSlotsIds = eventQuery.data.scheduledSlots.join(",");
      const response = await fetch(
        `${API_BASE_URL}/api/volunteers/?scheduledSlotsIds=${scheduledSlotsIds}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json() as Promise<ProcessedScheduledSlot[]>;
    },
    { enabled: eventQuery.status === "success" }
  );

  if (eventQuery.status === "error" || scheduledSlotsQuery.status === "error") {
    const error = eventQuery.error || scheduledSlotsQuery.error;
    console.error(error);
    return <div>Error...</div>;
  }

  if (
    scheduledSlotsQuery.status === "loading" ||
    scheduledSlotsQuery.status === "idle"
  ) {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (eventQuery.data === undefined) {
    console.error(
      `Something went wrong. Event with id ${eventId} not found in futureEvents list.`
    );
    return <div>Error...</div>;
  }

  const event = eventQuery.data;
  const scheduledSlots = scheduledSlotsQuery.data;
  scheduledSlots.sort((a, b) => (a.firstName < b.firstName ? -1 : 1));

  //Tailwind classes
  const sectionHeader =
    "flex items-center gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
  const sectionHeaderIcon = "w-6 lg:w-10";

  return (
    <>
      <Navbar />
      <div className="p-6 lg:px-14 lg:py-10">
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
            <AddSpecialGroup event={event} refetchEvent={eventQuery.refetch} />
            <ViewSpecialGroups event={event} />
          </div>
        </div>
        <div className="h-12" />
        <h1 className={sectionHeader}>
          <img className={sectionHeaderIcon} src={roster} alt="roster" />
          Participant Roster
        </h1>
        {/* Volunteer Table */}
        <VolunteersTable
          scheduledSlots={scheduledSlots}
          refetchVolunteers={scheduledSlotsQuery.refetch}
        />
        <div className="h-4" />
        <Link to={`/events/driver-location-info/${eventId}`}>
          <button
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
            type="button"
          >
            Delivery and Location Info
          </button>
        </Link>
        <div className="h-12" />
        <Messaging />
        <div className="h-12" />
      </div>
    </>
  );
};
