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

const columnHelper = createColumnHelper<ProcessedScheduledSlot>();

interface Props {
  scheduledSlots: ProcessedScheduledSlot[];
  refetchVolunteers: () => void;
}

export const VolunteersTable: React.FC<Props> = ({
  scheduledSlots,
  refetchVolunteers,
}: Props) => {
  const { token } = useAuth();

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
        return (
          <>
            <HttpCheckbox
              checked={info.cell.getValue() as boolean}
              mutationFn={applyPatch(
                `/api/volunteers/confirm/${info.row.original.id}`,
                { newConfirmationStatus: !info.row.original.confirmed },
                token as string
              )}
              onSuccess={() => {
                const toastMessage = `${info.row.original.firstName} ${
                  info.row.original.lastName
                } ${info.row.original.confirmed ? "unconfirmed" : "confirmed"}`;
                refetchVolunteers();
                toastNotify(toastMessage, "success");
              }}
              onError={() =>
                toastNotify("Unable to confirm volunteer", "failure")
              }
            />
          </>
        );
      },
      header: () => "Confirmed",
      footer: (props) => props.column.id,
    }),
    columnHelper.accessor("cantCome", {
      cell: (info) => {
        return (
          <>
            <HttpCheckbox
              checked={info.cell.getValue() as boolean}
              mutationFn={applyPatch(
                `/api/volunteers/going/${info.row.original.id}`,
                { newGoingStatus: !info.row.original.cantCome },
                token as string
              )}
              onSuccess={() => {
                const toastMessage = `${info.row.original.firstName} ${
                  info.row.original.lastName
                } ${
                  info.row.original.cantCome
                    ? "is able to volunteer"
                    : "is unable to volunteer"
                }`;
                refetchVolunteers();
                toastNotify(toastMessage, "success");
              }}
              onError={() =>
                toastNotify("Unable to modify availability", "failure")
              }
            />
          </>
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
          refetch={refetchVolunteers}
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
