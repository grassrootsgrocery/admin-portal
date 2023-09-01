import { DataTable } from "../../components/DataTable";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import {
  ProcessedEvent,
  ProcessedSpecialEvent,
  ProcessedSpecialGroup,
} from "../../types";
import { useQuery } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { useSpecialGroups } from "./specialGroupsHooks";
import { cn } from "../../utils/ui";

interface Props {
  event: ProcessedEvent;
}

function processSpecialGroups(
  specialEvents: ProcessedSpecialEvent[],
  specialGroups: ProcessedSpecialGroup[]
) {
  return specialEvents.map((se) => {
    const specialGroupsFiltered = specialGroups.filter(
      (sg) => sg.id === se.specialGroupId
    );
    if (specialGroupsFiltered.length === 0) {
      console.log(
        `No special group found with matching id for special event with id ${se.specialGroupId}`
      );
      return [se.id, "NO NAME", se.eventSignUpLink];
    }
    if (specialGroupsFiltered.length > 1) {
      //This should not happen...
      console.log(
        `Multiple special groups found with matching ids for special event with id ${se.specialGroupId}`,
        specialGroupsFiltered
      );
    }
    const groupName = specialGroupsFiltered[0].name;

    /* example of array
      0 "recmIJYvF6wK71RnJ"
      1 "St. Augustine's"
      2 "https://bit.ly/3HohS3x"
    */
    return [se.id, groupName, <a href={se.eventSignUpLink} target="_blank" className="text-blue-500 underline">se.eventSignUpLink</a>];
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
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full w-full -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-4",
        "md:w-[40rem] md:py-6 md:px-8"
      )}
      onOpenChange={() => refetchSpecialEvents()}
      trigger={
        <button
          className={
            "bg-pumpkinOrange lg:shadow-newLeafGreen rounded-full px-3 py-2 text-sm font-semibold text-white outline-none lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:transition-all " +
            (disabled
              ? "opacity-50"
              : "lg:hover:shadow-newLeafGreen lg:hover:-translate-y-1 lg:hover:shadow-lg")
          }
          disabled={disabled}
          type="button"
        >
          View Special Groups
        </button>
      }
    >
      <>
        <Modal.Title className="text-newLeafGreen m-0 flex justify-center text-xl font-bold lg:px-16 lg:text-3xl">
          View Event Special Groups
        </Modal.Title>
        <div className="h-3 md:h-6" />
        {!disabled && specialEvents && specialGroups && (
          <div className="h-96">
            <DataTable
              borderColor="newLeafGreen"
              columnHeaders={["Name", "Sign-up Link"]}
              dataRows={processSpecialGroups(specialEvents, specialGroups)}
            />
          </div>
        )}
        <div className="h-4" />
        <div className="flex justify-center">
          <Modal.Close
            className={cn(
              "bg-newLeafGreen rounded-full px-3 py-2 text-xs font-semibold text-white hover:brightness-150 focus:brightness-150",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            )}
          >
            Done
          </Modal.Close>
        </div>
      </>
    </Popup>
  );
};
