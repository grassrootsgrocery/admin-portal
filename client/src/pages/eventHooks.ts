import { useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import { ProcessedEvent, ProcessedScheduledSlot } from "../types";
import { processVolunteerCount } from "./ViewEvent/VolunteersTable";

// Query key management
const EVENTS = "events" as const;
const VOLUNTEERS = "volunteers" as const;

export const EVENT_QUERY_KEYS = {
  getAllFutureEvents: [EVENTS] as const,
};

export const VOLUNTEERS_FOR_EVENT_QUERY_KEYS = {
  fetchVolunteersForEvent: (eventId: string) => [VOLUNTEERS, eventId],
};

// Query all upcoming events
export function useFutureEvents() {
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
 * Uses useFutureEvents under the hood, and then returns the future event whose id matches the eventId parameter.
 */
export function useFutureEventById(eventId: string | undefined) {
  const futureEventsQuery = useFutureEvents();

  let event: ProcessedEvent | undefined = undefined;
  if (futureEventsQuery.status === "success") {
    event = futureEventsQuery.data.find((fe) => eventId === fe.id);
  }

  return {
    data: event,
    status: futureEventsQuery.status,
    error: futureEventsQuery.error,
  };
}

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

// Custom hook to fetch future events with volunteers
export function useFutureEventsWithVolunteers() {
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useFutureEventsWithVolunteers hook");
  }

  return useQuery(EVENT_QUERY_KEYS.getAllFutureEvents, async () => {
    const response = await fetch(`/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    const futureEvents: ProcessedEvent[] = await response.json();

    const eventsWithVolunteers = await Promise.all(
      futureEvents.map(async (event: ProcessedEvent) => {
        const scheduledSlotsIds = event.scheduledSlots.join(",");
        const volunteerResponse = await fetch(
          `/api/volunteers/?scheduledSlotsIds=${scheduledSlotsIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!volunteerResponse.ok) {
          const data = await volunteerResponse.json();
          throw new Error(data.message);
        }
        const scheduledSlots: ProcessedScheduledSlot[] =
          await volunteerResponse.json();
        const totalVolunteerCount = processVolunteerCount(scheduledSlots);
        return { ...event, scheduledSlots, totalVolunteerCount };
      })
    );

    return eventsWithVolunteers;
  });
}
