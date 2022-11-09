import { useParams } from "react-router-dom";
import { AirtableResponse, ScheduledSlot } from "../../types";
import { useQuery } from "react-query";
import { useFutureEvents } from "./eventHooks";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";
import { Loading } from "../../components/Loading";

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
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
        `&fields=Email`;

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

  scheduledSlots.records.sort((a, b) =>
    a.fields["First Name"] < b.fields["First Name"] ? -1 : 1
  );

  return (
    <div className="p-6 lg:px-14 lg:py-16">
      {/* Event Info */}
      <h1 className="text-lg font-bold text-newLeafGreen lg:text-3xl">
        {event.dateDisplay}
      </h1>
      <div className="h-4" />
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
        <div className="flex flex-col ">
          <p className="text-sm lg:text-2xl">Time</p>
          <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
            {event.time}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="text-sm lg:text-2xl">Main Location</p>
          <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
            {event.mainLocation}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="text-sm lg:text-2xl"> Total Participants</p>
          <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
            {event.numtotalParticipants}
          </p>
        </div>
      </div>
      <div className="h-12 " />

      {/* Participant Breakdown */}
      <h1 className="text-lg font-bold text-newLeafGreen lg:text-3xl">
        Participant Breakdown
      </h1>
      <div className="h-4" />
      <div className="flex flex-col gap-2 lg:flex-row lg:gap-10">
        <div className="grid gap-2 lg:grid-cols-3 lg:grid-rows-2">
          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl">Total # of Drivers</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numDrivers}
            </p>
          </div>
          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl">Total # of Packers</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numPackers}
            </p>
          </div>

          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl">Both Drivers & Packers</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numBothDriversAndPackers}
            </p>
          </div>

          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl">Only Drivers</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numOnlyDrivers}
            </p>
          </div>
          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl">Only Packers</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numOnlyPackers}
            </p>
          </div>
          <div className="flex flex-col ">
            <p className="text-sm lg:text-2xl"># of Special Groups</p>
            <p className="text-sm font-semibold text-newLeafGreen lg:text-2xl">
              {event.numSpecialGroups}
            </p>
          </div>
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
      <div>
        <table className="border-4 border-softGrayWhite">
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
        </table>
      </div>
    </div>
  );
}
