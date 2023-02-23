import { useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../httpUtils";
//Types
import { ProcessedEvent, ProcessedSpecialEvent } from "../types";

//Query all upcoming events
export function useFutureEvents() {
  //I'm not sure if this is a good pattern honestly
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useFutureEvents hook");
  }

  return useQuery(["fetchFutureEvents"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedEvent[]>;
  });
}

/* Get a future event by the event id.
 * Uses useFuturePickupEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 * */
export function useFutureEventById(eventId: string | undefined) {
  const futureEventsQuery = useFutureEvents();

  let event = undefined;
  if (futureEventsQuery.status === "success") {
    event = futureEventsQuery.data.filter((fe) => eventId === fe.id)[0];
  }

  return {
    data: event,
    refetch: futureEventsQuery.refetch,
    status: futureEventsQuery.status,
    error: futureEventsQuery.error,
  };
}
