import { useParams } from "react-router-dom";
import { AirtableResponse, ScheduledSlot } from "../../types";
import { useQuery } from "react-query";
import { useFutureEvents } from "./eventHooks";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
function useFutureEventById(eventId : string | undefined) {
  const { futureEvents, futureEventsLoading, futureEventsError } =
    useFutureEvents();

  let event = undefined;
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
      if (typeof event === "undefined") {
        return Promise.reject(new Error("Undefined event"));
      }

      const scheduledSlotsIds = event.scheduledSlots.join(",");
      const scheduledSlotsForEventUrl = `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` + 
      `filterByFormula=SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""` +
      `&fields=First Name` + 
      `&fields=Last Name` + 
      `&fields=Correct slot time` + 
      `&fields=Type` +
      `&fields=Confirmed?` +
      `&fields=Volunteer Status` +
      `&fields=Email`;

      return fetchAirtableData<AirtableResponse<ScheduledSlot>>(scheduledSlotsForEventUrl);
    },
    { enabled: !eventIsLoading  }
  );

  if (eventIsLoading || scheduledSlotsForEventLoading || !scheduledSlotsForEvent) {
    return <div>Loading...</div>;
  }

  const error = eventError || scheduledSlotsForEventError;
  if (error) {
    console.log(error);
    return <div>Error...</div>;
  }

  //RENDER LOGIC
  
  //console.log("Logging scheduledSlotsForEvent", scheduledSlotsForEvent);
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
