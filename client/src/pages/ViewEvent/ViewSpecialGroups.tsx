import { DataTable } from "../../components/DataTable";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import {
  ProcessedEvent,
  ProcessedSpecialEvent,
  ProcessedSpecialGroup,
} from "../../types";
import { useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useSpecialGroups } from "./specialGroupsHooks";

interface Props {
  event: ProcessedEvent;
}

function processSpecialGroups(
  specialEvents: ProcessedSpecialEvent[],
  specialGroups: ProcessedSpecialGroup[]
) {
  return specialEvents.map((se) => {
    const groupName = specialGroups.filter(
      (sg) => sg.id === se.specialGroupId
    )[0].name;
    return [se.id, groupName, se.eventSignUpLink];
  });
}

export const ViewSpecialGroups: React.FC<Props> = ({ event }: Props) => {
  const { token } = useAuth();
  const {
    data: specialEvents,
    refetch: refetchSpecialEvents,
    status: specialEventsStatus,
    error: specialEventsError,
  } = useQuery(["fetchViewEventSpecialEvents", event.id], async () => {
    const eventIds = event.allEventIds.join(",");
    const response = await fetch(
      `${API_BASE_URL}/api/events/view-event-special-groups?eventIds=${eventIds}`,
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
  });

  const {
    data: specialGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useSpecialGroups();

  const disabled =
    specialEventsStatus === "loading" ||
    specialEventsStatus === "idle" ||
    specialEventsStatus === "error" ||
    specialGroupsStatus === "loading" ||
    specialGroupsStatus === "idle" ||
    specialGroupsStatus === "error";

  return (
    <Popup
      onOpenChange={() => refetchSpecialEvents()}
      trigger={
        <button
          className={
            "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all lg:px-5 lg:py-3 lg:text-base lg:font-bold " +
            (disabled
              ? "opacity-50"
              : "hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen")
          }
          type="button"
        >
          View Special Groups
        </button>
      }
      content={
        <div>
          <Modal.Title className="m-0 flex justify-center px-16 text-3xl font-bold text-newLeafGreen">
            View Event Special Groups
          </Modal.Title>
          <div className="h-6" />
          {!disabled && specialEvents && specialGroups && (
            <div className="h-96">
              <DataTable
                borderColor="newLeafGreen"
                columnHeaders={["Name", "Sign-up Link"]}
                dataRows={processSpecialGroups(specialEvents, specialGroups)} // dataRows={[
              />
            </div>
          )}
          <div className="h-4" />
          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl">
              Done
            </Modal.Close>
          </div>
        </div>
      }
    />
  );
};
