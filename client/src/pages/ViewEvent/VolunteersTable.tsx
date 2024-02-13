import { createColumnHelper } from "@tanstack/react-table";
import { ProcessedScheduledSlot } from "../../types";
import React, { useState } from "react";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import { applyPatch } from "../../utils/http";
import { useAuth } from "../../contexts/AuthContext";
import { toastNotify } from "../../utils/ui";
import { ContactPopup } from "../../components/ContactPopup";
import { EditVolunteerPopup } from "../../components/EditVolunteerPopup";
import { NewDataTable } from "../../components/NewDataTable";
import { useQueryClient } from "react-query";
import { VOLUNTEERS_FOR_EVENT_QUERY_KEYS } from "../eventHooks";

const columnHelper = createColumnHelper<ProcessedScheduledSlot>();

interface Props {
  scheduledSlots: ProcessedScheduledSlot[];
  eventId: string;
}

export const VolunteersTable: React.FC<Props> = ({
  scheduledSlots,
  eventId,
}: Props) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const columns = [
    // Display Column
    columnHelper.display({
      id: "id",
      header: () => <span>ID</span>,
      cell: (props) => props.cell.row.id,
    }),
    columnHelper.accessor("firstName", {
      cell: (info) => info.getValue(),
      header: () => <span>First Name</span>,
      footer: (props) => props.column.id,
    }),
    // Accessor Column
    columnHelper.accessor((row) => row.lastName, {
      id: "lastName",
      cell: (info) => info.getValue(),
      header: () => <span>Last Name</span>,
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("timeSlot", {
      cell: (info) => info.getValue(),
      header: () => <span>Time Slot</span>,
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("participantType", {
      cell: (info) => info.getValue(),
      header: () => <span>Participant Type</span>,
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("confirmed", {
      cell: (info) => {
        const confirmed = info.cell.getValue() as boolean;
        const slot = info.row.getValue(
          info.column.id
        ) as ProcessedScheduledSlot;
        return (
          <HttpCheckbox
            key={slot.id}
            checked={confirmed}
            mutationFn={applyPatch(
              `/api/volunteers/confirm/${slot.id}`,
              { newConfirmationStatus: !confirmed },
              token as string
            )}
            onSuccess={() => {
              const toastMessage = `${slot.firstName} ${slot.lastName} ${
                confirmed ? "unconfirmed" : "confirmed"
              }`;

              queryClient.invalidateQueries(
                VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
              );
              toastNotify(toastMessage, "success");
            }}
            onError={() =>
              toastNotify("Unable to confirm volunteer", "failure")
            }
          />
        );
      },
      header: () => "Confirmed",
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("cantCome", {
      cell: (info) => {
        const cantCome = info.cell.getValue() as boolean;
        const slot = info.row.getValue(
          info.column.id
        ) as ProcessedScheduledSlot;
        return (
          <HttpCheckbox
            key={slot.id}
            checked={cantCome}
            mutationFn={applyPatch(
              `/api/volunteers/going/${slot.id}`,
              { newGoingStatus: !cantCome },
              token as string
            )}
            onSuccess={() => {
              const toastMessage = `${slot.firstName} ${slot.lastName} ${
                slot.cantCome
                  ? "is able to volunteer"
                  : "is unable to volunteer"
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
        );
      },
      header: () => "Can't Come",
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("specialGroup", {
      cell: (info) => info.getValue(),
      header: () => <span>Special Group</span>,
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("totalDeliveries", {
      cell: (info) => info.getValue(),
      header: () => <span>Delivery Count</span>,
      footer: (props) => props.column.id,
    }),
    columnHelper.display({
      id: "contact",
      header: () => <span>Contact</span>,
      cell: (props) => (
        <ContactPopup
          phoneNumber={props.cell.row.original.phoneNumber}
          email={props.cell.row.original.email}
        />
      ),
    }),
    columnHelper.display({
      id: "edit",
      header: () => <span>Edit</span>,
      cell: (props) => (
        <EditVolunteerPopup
          id={props.cell.row.original.id}
          email={props.cell.row.original.email}
          phoneNumber={props.cell.row.original.phoneNumber}
          firstName={props.cell.row.original.firstName}
          lastName={props.cell.row.original.lastName}
          participantType={props.cell.row.original.participantType}
          onEditSuccess={() => {
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
          }}
        />
      ),
    }),
  ];

  const filterList: {
    name: string;
    filterFn: (e: ProcessedScheduledSlot) => boolean;
  }[] = [
    {
      name: "Drivers",
      filterFn: (e: ProcessedScheduledSlot) =>
        e.participantType.includes("Driver"),
    },
    {
      name: "Packers",
      filterFn: (e: ProcessedScheduledSlot) =>
        e.participantType.includes("Packer"),
    },
    {
      name: "Only Drivers",
      filterFn: (e: ProcessedScheduledSlot) =>
        e.participantType.includes("Driver") &&
        !e.participantType.includes("Packer"),
    },
    {
      name: "Only Packers",
      filterFn: (e: ProcessedScheduledSlot) =>
        e.participantType.includes("Packer") &&
        !e.participantType.includes("Driver"),
    },
    {
      name: "Signed Up",
      filterFn: (e) => !e.cantCome,
    },
    {
      name: "Can't Come",
      filterFn: (e) => e.cantCome,
    },
    {
      name: "Confirmed",
      filterFn: (e) => e.confirmed,
    },
    {
      name: "Not Confirmed",
      filterFn: (e) => !e.confirmed,
    },
  ];

  let specialGroupsList: string[] = [];
  scheduledSlots.forEach((slot) => {
    let curSpecialGroup = slot.specialGroup;

    // Check for a unique special group
    if (curSpecialGroup && !specialGroupsList.includes(curSpecialGroup)) {
      specialGroupsList.push(curSpecialGroup);

      // Add special group as a filter
      let groupFilter = {
        name: curSpecialGroup,
        filterFn: (e: ProcessedScheduledSlot) =>
          e.specialGroup === curSpecialGroup,
      };
      filterList.push(groupFilter);
    }
  });

  return (
    <NewDataTable
      columns={columns}
      data={scheduledSlots}
      filters={filterList.sort((a, b) => {
        return a.name < b.name ? -1 : 1;
      })}
    />
  );
};
