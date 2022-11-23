import { useParams } from "react-router-dom";
import { AirtableResponse, Record, ScheduledSlot } from "../../types";
import { useQuery } from "react-query";
import { useFutureEvents } from "./eventHooks";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";
import { Loading } from "../../components/Loading";
import { Table } from "../Roster/Table";
import { VolunteersTable } from "../../components/VolunteersTable";
//Assets
import alert from "../../assets/alert.svg";
import check from "../../assets/check.svg";
import { JasonTable } from "./JasonTable";

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */

const HeaderValueDisplay: React.FC<{
  header: string;
  value: string | number;
}> = (props: { header: string; value: string | number }) => {
  return (
    <div className="flex flex-col ">
      <p className="lg:text-xl">{props.header}</p>
      <p className="font-semibold text-newLeafGreen lg:text-xl">
        {props.value}
      </p>
    </div>
  );
};
function useFutureEventById(eventId: string | undefined) {
  const { futureEvents, futureEventsStatus, futureEventsError } =
    useFutureEvents();

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

export function ViewEvent() {
  const { eventId } = useParams();
  const { event, eventStatus, eventError } = useFutureEventById(eventId);

  const {
    data: scheduledSlots,
    status: scheduledSlotsStatus,
    error: scheduledSlotsError,
  } = useQuery(
    ["fetchScheduledSlotsForEvent", eventId],
    async () => {
      if (typeof event === "undefined") {
        return Promise.reject(new Error("Undefined event"));
      }

      const scheduledSlotsIds = event.scheduledSlots.join(",");
      const scheduledSlotsForEventUrl =
        `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
        `filterByFormula=SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""` +
        `&fields=First Name` +
        `&fields=Last Name` +
        `&fields=Correct slot time` +
        `&fields=Type` +
        `&fields=Confirmed?` +
        `&fields=Volunteer Status` +
        `&fields=Email` +
        `&fields=Volunteer Group (for MAKE)`;

      return fetchAirtableData<AirtableResponse<ScheduledSlot>>(
        scheduledSlotsForEventUrl
      );
    },
    { enabled: eventStatus === "success" }
  );

  if (scheduledSlotsStatus === "loading" || scheduledSlotsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading />
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

  // Filters for filter dropdown
  let filters = [
    {
      label: "Confirmed",
      filter: (e: Record<ScheduledSlot>) => e.fields["Confirmed?"],
    },
    {
      label: "Not Confirmed",
      filter: (e: Record<ScheduledSlot>) => !e.fields["Confirmed?"],
    },
    {
      label: "Only Packers",
      filter: (e: Record<ScheduledSlot>) =>
        e.fields.Type.includes("Distributor") &&
        !e.fields.Type.includes("Driver"),
    },
    {
      label: "Only Drivers",
      filter: (e: Record<ScheduledSlot>) =>
        e.fields.Type.includes("Driver") &&
        !e.fields.Type.includes("Distributor"),
    },
    {
      label: "Packers & Drivers",
      filter: (e: Record<ScheduledSlot>) =>
        e.fields.Type.includes("Distributor") &&
        e.fields.Type.includes("Driver"),
    },
  ];

  // Create list of unique special groups and add special group filters
  let specialGroupsList: string[] = [];
  scheduledSlots.records.forEach(function (ss) {
    let specialGroup = ss.fields["Volunteer Group (for MAKE)"];

    // Check for a unique special group
    if (specialGroup && !specialGroupsList.includes(specialGroup)) {
      specialGroupsList.push(specialGroup);

      // Add special group as a filter
      let groupFilter = {
        label: specialGroup,
        filter: (e: Record<ScheduledSlot>) =>
          e.fields["Volunteer Group (for MAKE)"] === specialGroup,
      };
      filters.push(groupFilter);
    }
  });
  // console.log("specialGroupsList:", specialGroupsList);

  scheduledSlots.records.sort((a, b) =>
    a.fields["First Name"] < b.fields["First Name"] ? -1 : 1
  );

  return (
    <div className="p-6 lg:px-14 lg:py-10">
      {/* Event Info */}
      <h1 className="text-lg font-bold text-newLeafGreen lg:text-3xl">
        {event.dateDisplay}
      </h1>
      <div className="h-4" />
      <div className="flex flex-col gap-3 md:flex-row md:gap-10">
        <HeaderValueDisplay header="Time" value={event.time} />
        <HeaderValueDisplay header="Main Location" value={event.mainLocation} />
        <HeaderValueDisplay
          header="Total Participants"
          value={event.numtotalParticipants}
        />
      </div>
      <div className="h-12 " />
      {/* Participant Breakdown */}
      <h1 className="text-lg font-bold text-newLeafGreen lg:text-3xl">
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
          <button
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            View Special Groups
          </button>
          <button
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            + Add Special Group
          </button>
        </div>
      </div>
      <br />
      {/* <Table
        body={scheduledSlots.records.map((scheduledSlot, idx) => {
          return (
            <tr key={scheduledSlot.id}>
              <td>{idx + 1}</td>
              <td>{scheduledSlot.fields["First Name"]}</td>
              <td>{scheduledSlot.fields["Last Name"]}</td>
              <td>
                {scheduledSlot.fields["Correct slot time"]["error"]
                  ? "None"
                  : scheduledSlot.fields["Correct slot time"]}
              </td>
              <td>{scheduledSlot.fields["Type"].length}</td>
              <td>{scheduledSlot.fields["Confirmed?"] ? "Yes" : "No"}</td>
              <td>{scheduledSlot.fields["Volunteer Status"]}</td>
              <td>IDK</td>
              <td>{scheduledSlot.fields["Email"]}</td>
            </tr>
          );
        })}
      /> */}
      <JasonTable
        headings={[
          "#",
          "First Name",
          "Last Name",
          "Time Slot",
          "Participant Type",
          "Confirmed",
          "Special Group",
          "Delivery Type",
          "Email",
        ]}
        scheduledSlots={scheduledSlots}
      />
      {/* <table>
        <thead>
          <tr>
            <th>#</th>
            <th>First</th>
            <th>Last</th>
            <th>Time</th>
            <th>Participant Type</th>
            <th>Confirmed</th>
            <th>Special Group</th>
            <th>Delivery Type</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {scheduledSlots.records.map((scheduledSlot, idx) => {
            return (
              <tr key={scheduledSlot.id}>
                <td>{idx + 1}</td>
                <td>{scheduledSlot.fields["First Name"]}</td>
                <td>{scheduledSlot.fields["Last Name"]}</td>
                <td>
                  {scheduledSlot.fields["Correct slot time"]["error"]
                    ? "None"
                    : scheduledSlot.fields["Correct slot time"]}
                </td>
                <td>{scheduledSlot.fields["Type"].length}</td>
                <td>{scheduledSlot.fields["Confirmed?"] ? "Yes" : "No"}</td>
                <td>{scheduledSlot.fields["Volunteer Status"]}</td>
                <td>IDK</td>
                <td>{scheduledSlot.fields["Email"]}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot></tfoot>
      </table>  */}
      <VolunteersTable
        filters={filters}
        scheduledSlots={scheduledSlots.records}
      />
    </div>
  );
}
