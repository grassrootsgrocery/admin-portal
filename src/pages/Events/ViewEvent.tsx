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
    <div className="px-14 py-16">
      {/* Event Info */}
      <h1 className=" text-3xl font-bold text-newLeafGreen">
        {event.dateDisplay}
      </h1>
      <div className="h-4" />
      <div className="flex gap-10">
        <div className="flex flex-col ">
          <p className="text-2xl">Time</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.time}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="text-2xl">Main Location</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.mainLocation}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="text-2xl"> Total Participants</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numtotalParticipants}
          </p>
        </div>
      </div>
      <div className="h-12 " />

      {/* Participant Breakdown */}
      <div className="grid grid-cols-4 grid-rows-3 gap-3">
        <h1 className="col-span-4 flex items-end rounded border text-3xl font-bold text-newLeafGreen">
          Participant Breakdown
        </h1>
        <div className="flex flex-col rounded border">
          <p className="text-2xl">Total # of Drivers</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numDrivers}
          </p>
        </div>
        <div className="flex flex-col rounded border">
          <p className="text-2xl">Total # of Packers</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numPackers}
          </p>
        </div>

        <div className="col-span-2 flex flex-col rounded border md:col-span-1">
          <p className="text-2xl">Both Drivers & Packers</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numBothDriversAndPackers}
          </p>
        </div>

        <div className="flex flex-col rounded border">
          <p className="text-2xl">Only Drivers</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numOnlyDrivers}
          </p>
        </div>
        <div className="flex flex-col rounded border">
          <p className="text-2xl">Only Packers</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numOnlyPackers}
          </p>
        </div>
        <div className="col-span-2 flex flex-col rounded border md:col-span-1">
          <p className="text-2xl"># of Special Groups</p>
          <p className="text-2xl font-semibold text-newLeafGreen">
            {event.numSpecialGroups}
          </p>
        </div>

        <div className="row-span-1 flex flex-col items-center justify-around rounded border md:row-span-2">
          <button
            className="rounded-full bg-pumpkinOrange px-5 py-3 font-extrabold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen"
            type="button"
          >
            View Special Groups
          </button>
          <button
            className="rounded-full bg-pumpkinOrange px-5 py-3 font-extrabold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen"
            type="button"
          >
            + Add Special Group
          </button>
        </div>
        <div className="flex justify-center rounded border"></div>
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
