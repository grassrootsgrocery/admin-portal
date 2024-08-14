import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { applyPatch } from "../../utils/http";
import { toastNotify } from "../../utils/ui";
import { DataTable } from "../../components/DataTable";
import { ProcessedScheduledSlot } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { ContactPopup } from "../../components/ContactPopup";
import { EditVolunteerPopup } from "../../components/EditVolunteerPopup";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import { VOLUNTEERS_FOR_EVENT_QUERY_KEYS } from "../eventHooks";
import Tooltip from "../../components/ToolTip";

export const VolunteersTable: React.FC<{
  scheduledSlots: ProcessedScheduledSlot[];
  eventId: string;
}> = ({ scheduledSlots, eventId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  function processScheduledSlotsForTable(
    scheduledSlots: ProcessedScheduledSlot[],
    eventId: string
  ): (string | number | JSX.Element)[][] {
    const rows = scheduledSlots.map((ss, i) => [
      ss.id ?? "",
      i + 1,
      ss.firstName ?? "",
      ss.lastName ?? "",
      ss.timeSlot ?? "",
      ss.participantType ?? "",
      <Tooltip content="The participant has replied that they will be in attendance">
        <HttpCheckbox
          checked={ss.confirmed}
          mutationFn={applyPatch(
            `/api/volunteers/confirm/${ss.id}`,
            { newConfirmationStatus: !ss.confirmed },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${ss.firstName} ${ss.lastName} ${
              ss.confirmed ? "unconfirmed" : "confirmed"
            }`;
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
            toastNotify(toastMessage, "success");
          }}
          onError={() => toastNotify("Unable to confirm volunteer", "failure")}
        />
      </Tooltip>,
      <Tooltip content="The participant has replied that they can no longer attend">
        <HttpCheckbox
          checked={ss.cantCome}
          mutationFn={applyPatch(
            `/api/volunteers/going/${ss.id}`,
            { newGoingStatus: !ss.cantCome },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${ss.firstName} ${ss.lastName} ${
              ss.cantCome ? "is able to volunteer" : "is unable to volunteer"
            }`;
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
            toastNotify(toastMessage, "success");
          }}
          onError={() =>
            toastNotify("Unable to modify availability", "failure")
          }
        />
      </Tooltip>,
      ss.countOfEventsCompleted ?? 0,
      ss.specialGroup ?? "N/A",
      ss.totalDeliveries ?? "N/A",
      <ContactPopup phoneNumber={ss.phoneNumber} email={ss.email} />,
      <EditVolunteerPopup
        id={ss.id}
        email={ss.email}
        phoneNumber={ss.phoneNumber}
        firstName={ss.firstName}
        lastName={ss.lastName}
        participantType={ss.participantType}
        onEditSuccess={() => {
          queryClient.invalidateQueries(
            VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
          );
        }}
      />,
    ]);

    return rows;
  }

  const getColumnHeader = (header: string) => {
    const tooltips: { [key: string]: string } = {
      Confirmed: "The participant has replied that they will be in attendance",
      "Can't Come":
        "The participant has replied that they can no longer attend",
      "Delivery Count":
        "The number of delivery units (each unit may contain multiple items)",
    };

    if (tooltips[header]) {
      return (
        <Tooltip content={tooltips[header]}>
          <span>{header}</span>
        </Tooltip>
      );
    }
    return header;
  };

  const columnHeaders = [
    "#",
    "First",
    "Last",
    "Time Slot",
    "Participant Type",
    getColumnHeader("Confirmed"),
    getColumnHeader("Can't Come"),
    "Past Events",
    "Special Group",
    getColumnHeader("Delivery Count"),
    "Contact",
    "Edit",
  ];

  const dataRows = processScheduledSlotsForTable(scheduledSlots, eventId);

  return (
    <div className="flex h-screen flex-col pt-6">
      <DataTable
        borderColor="softGrayWhite"
        columnHeaders={columnHeaders}
        dataRows={dataRows}
      />
    </div>
  );
};
