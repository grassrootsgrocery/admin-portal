import { useQuery } from "react-query";
import { API_BASE_URL } from "../httpUtils";
//Types
import { ProcessedEvent } from "../types";

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
export function useFutureEventById(eventId: string | undefined) {
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
