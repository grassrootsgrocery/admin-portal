import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useFutureEventById } from "../eventHooks";

//Types
import { 
    ProcessedSpecialEvent, 
    ProcessedSpecialGroup 
} from "../../types";
//Components

//Assets
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";

export const ViewEventSpecialGroups = () => {
    const { token } = useAuth();
    if (!token) {
      return <Navigate to="/" />;
    }

    const { eventId } = useParams();
    const { event, eventStatus, eventError } = useFutureEventById(eventId);

    const eventIds = event?.allEventIds.join(",");
    const {
      data: specialEvents,
      status: specialEventsStatus,
      error: specialEventsError,
    } = useQuery(
      ["fetchViewEventSpecialEvents", eventIds], 
      async () => {
        const response = await fetch(`${API_BASE_URL}/api/events/view-event-special-groups?eventIds=${eventIds}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message);
        }
        return response.json() as Promise<ProcessedSpecialEvent[]>;
      },
      { enabled: eventStatus === "success" }
    );
  
    const {
      data: specialGroups,
      status: specialGroupsStatus,
      error: specialGroupsError,
    } = useQuery(["fetchSpecialGroups"], async () => {
      const response = await fetch(`${API_BASE_URL}/api/special-groups`, {
        headers: {
          Authorization: `Bearer ${token as string}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json() as Promise<ProcessedSpecialGroup[]>;
    });
  
    let specialGroupsById: Map<string, string> = new Map();
    specialGroups?.forEach(function(specialGroup) {
      specialGroupsById.set(specialGroup.id, specialGroup.name);
    });
  
    specialEvents?.forEach(function(specialEvent) {
      let specialGroupName = specialGroupsById.get(specialEvent.specialGroupName);
      if (typeof specialGroupName === "string") {
        specialEvent.specialGroupName = specialGroupName;
      }
    });
    console.log("specialEvents", specialEvents);

    if (specialEventsStatus === "loading" || specialEventsStatus === "idle"
    || specialGroupsStatus === "loading" || specialGroupsStatus === "idle") {
        return (
          <div>
          </div>
        );
      }
    
      if (specialEventsStatus === "error") {
        const error = eventError || specialEventsError || specialGroupsError;
        console.error(error);
        return <div>Error...</div>;
      }
    
      if (event === undefined) {
        console.error(
          `Something went wrong. Event ${event} not found in futureEvents list.`
        );
        return <div>Error...</div>;
      }

    return (
        <>
        </>
    )
};