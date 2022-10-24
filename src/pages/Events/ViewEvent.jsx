import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useFutureEvents } from "./eventHooks";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
function useFutureEventById(eventId) {
  const { futureEvents, futureEventsLoading, futureEventsError } =
    useFutureEvents();

  let event = {};
  if (!futureEventsLoading) {
    event = futureEvents.filter((fe) => eventId === fe.id)[0];
  }

  return {
    event,
    eventIsLoading: futureEventsLoading,
    eventError: futureEventsError,
  };
}

export function ViewEvent() {
  const { eventId } = useParams();
  const { event, eventIsLoading, eventError } = useFutureEventById(eventId);

  const {
    data: scheduledSlotsForEvent,
    isLoading: scheduledSlotsForEventLoading,
    error: scheduledSlotsForEventError,
  } = useQuery(
    ["fetchScheduledSlotsForEvent", eventId],
    async () => {
      const scheduledSlotsIds = event.scheduledSlots.join(",");
      const formulaToSearchForScheduledSlotsForEvent = `SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""`;
      const url = `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?filterByFormula=${formulaToSearchForScheduledSlotsForEvent}`;
      return fetchAirtableData(url);
    },
    { enabled: !eventIsLoading }
  );

  if (eventIsLoading || scheduledSlotsForEventLoading) {
    return <div>Loading...</div>;
  }

  const error = eventError || scheduledSlotsForEventError;
  if (error) {
    console.log(error);
    return <div>Error...</div>;
  }

  //RENDER LOGIC

  return (
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
        {scheduledSlotsForEvent.records.map((scheduledSlot, idx) => {
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
  );
}
