import { useQuery } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { ProcessedSpecialEvent, ProcessedSpecialGroup } from "../../types";

// Retrieve Special Groups

//Query keys
const SPECIAL_GROUPS = "specialGroups" as const;
export const SPECIAL_GROUPS_QUERY_KEYS = {
  fetchSpecialGroups: [SPECIAL_GROUPS] as const,
};

export function useSpecialGroups() {
  const { token } = useAuth();
  return useQuery(SPECIAL_GROUPS_QUERY_KEYS.fetchSpecialGroups, async () => {
    const response = await fetch(`/api/special-groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialGroup[]>;
  });
}

// Retrieve Special Events for event. The naming is confusing
//Query keys
const SPECIAL_EVENTS = "fetchViewEventSpecialEvents" as const;
export const SPECIAL_EVENTS_QUERY_KEYS = {
  fetchSpecialEventsForEvent: (eventId: string) =>
    [SPECIAL_EVENTS, eventId] as const,
};
export function useSpecialEventsForEvent({
  eventId,
  allEventIds,
}: {
  eventId: string;
  allEventIds: string[];
}) {
  const { token } = useAuth();
  return useQuery(
    SPECIAL_EVENTS_QUERY_KEYS.fetchSpecialEventsForEvent(eventId),
    async () => {
      const eventIds = allEventIds.join(",");
      const response = await fetch(
        `/api/events/view-event-special-groups?eventIds=${eventIds}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json() as Promise<ProcessedSpecialEvent[]>;
    }
  );
}
