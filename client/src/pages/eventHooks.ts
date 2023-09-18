import { useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
//Types
import { ProcessedEvent, ProcessedScheduledSlot } from "../types";

//Query key management
const EVENTS = "events" as const;
export const EVENT_QUERY_KEYS = {
  getAllFutureEvents: EVENTS,
};

//Query all upcoming events
export function useFutureEvents() {
  //I'm not sure if this is a good pattern honestly
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useFutureEvents hook");
  }

  return useQuery(EVENT_QUERY_KEYS.getAllFutureEvents, async () => {
    const response = await fetch(`/api/events`, {
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
    status: futureEventsQuery.status,
    error: futureEventsQuery.error,
  };
}

const VOLUNTEERS = "volunteers" as const;
export const VOLUNTEERS_FOR_EVENT_QUERY_KEYS = {
  fetchVolunteersForEvent: (eventId: string) => [VOLUNTEERS, eventId],
};

export function useVolunteersForEvent({
  enabled,
  eventId,
  scheduledSlotIds,
}: {
  enabled: boolean;
  eventId: string;
  scheduledSlotIds: string[];
}) {
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useFutureEvents hook");
  }
  return useQuery(
    VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId),
    async () => {
      const scheduledSlotsIds = scheduledSlotIds.join(",");
      const response = await fetch(
        `/api/volunteers/?scheduledSlotsIds=${scheduledSlotsIds}`,
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
    { enabled: enabled }
  );
}
