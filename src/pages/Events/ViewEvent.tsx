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
      `Something went wrong. Event ${event} not found in futureEvents list`
    );
    return <div>Error...</div>;
  }

  //RENDER LOGIC

  //console.log("Logging scheduledSlotsForEvent", scheduledSlotsForEvent);
  scheduledSlots.records.sort((a, b) =>
    a.fields["First Name"] < b.fields["First Name"] ? -1 : 1
  );
  return (
    <div>
      <p>Day: {event.dateDisplay}</p>
      <p>Time: {event.time}</p>
      <p>Main Location: {event.mainLocation}</p>
      <p>Total Participants: {event.numtotalParticipants}</p>
      <p>Total # of Drivers: {event.numDrivers}</p>
      <p>Total # of Packers: {event.numPackers}</p>
      <p>Only Drivers: {event.numOnlyDrivers} </p>
      <p>Only Packers: {event.numOnlyPackers} </p>
      <p>Both Drivers & Packers: {event.numBothDriversAndPackers} </p>
      <p># of Special Groups: {event.numSpecialGroups} </p>
      <br />
      <table>
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
  );
}
