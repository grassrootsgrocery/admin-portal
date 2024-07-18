import React, { useState } from "react";
import { Popup } from "./Popup";
import pencil from "../assets/pencil.svg";
import * as Modal from "@radix-ui/react-dialog";
import { useMutation } from "react-query";
import { cn, toastNotify } from "../utils/ui";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface EditFieldProps {
  label: string;
  fieldType: string;
  fieldName: string;
  value: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  autoFocus?: boolean;
}

const EditFieldInput = ({
  label,
  fieldType,
  fieldName,
  handleChange,
  value,
  autoFocus = false,
}: EditFieldProps) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-8">
      <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">{label}</p>
      <div className="relative grow">
        <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
          <div className="flex w-full flex-col space-y-1">
            <input
              autoFocus={autoFocus}
              className="w-full border-0 outline-none"
              type={fieldType}
              name={fieldName}
              value={value}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const participantTypes: string[] = ["Driver", "Packer", "Driver & Packer"];
const timeSlotCategories: string[] = ["9:00","10:30"];

const EditFieldSelect = ({
  label,
  handleChange,
  value,
  name,
}: Pick<EditFieldProps, "label" | "handleChange" | "value"> & { name: string }) => {
  const options = name === "participantType" ? participantTypes : timeSlotCategories;
  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-8">
      <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">{label}</p>
      <div className="relative w-64 grow md:w-80">
        <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
          <div className="flex w-full flex-col space-y-1">
            <select
              className="w-full border-0 outline-none"
              name={name}
              value={value}
              onChange={handleChange}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  participantType: string;
  onEditSuccess: () => void;
}
export const EditVolunteerPopup = (info: Props) => {
  const [formState, setFormState] = useState({
    ...info,
    timeSlot: "",
  });

  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveUpdatedVolunteer = useMutation({
    mutationFn: async (payload: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      participantType: string[];
      timeSlot: string;
    }) => {
      const resp = await fetch(`/api/volunteers/update/${payload.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json();
    },
    onSuccess(data, variables, context) {
      toastNotify("Volunteer updated successfully", "success");
      info.onEditSuccess();
    },
    onError(error, variables, context) {
      // @ts-ignore
      toastNotify(error.message, "failure");
    },
  });

  return (
    <Popup
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={pencil} alt="" />
        </div>
      }
      className={cn(
        "fixed left-[50%] top-0 h-[24rem] w-full -translate-x-1/2",
        "bg-softBeige p-4 md:top-[50%] md:w-[40rem] md:-translate-y-1/2 md:rounded-lg",
        "lg:h-[22rem]"
      )}
    >
      {/* title */}
      <Modal.Title className="flex h-[10%] justify-center">
        <h1 className="text-2xl font-bold text-newLeafGreen">Edit Volunteer</h1>
      </Modal.Title>
      <div className="h-0 lg:h-[5%]" />
      <form
        className={
          "flex h-[80%] w-full flex-col space-y-3 overflow-scroll lg:h-[75%]"
        }
      >
        <EditFieldInput
          fieldType={"text"}
          autoFocus={true}
          fieldName={"firstName"}
          label={"First Name:"}
          value={formState.firstName}
          handleChange={handleChange}
        />
        <EditFieldInput
          fieldType={"text"}
          fieldName={"lastName"}
          label={"Last Name:"}
          value={formState.lastName}
          handleChange={handleChange}
        />
        <EditFieldInput
          fieldType={"email"}
          fieldName={"email"}
          label={"Email:"}
          value={formState.email}
          handleChange={handleChange}
        />
        <EditFieldInput
          fieldType={"tel"}
          fieldName={"phoneNumber"}
          label={"Phone Number:"}
          value={formState.phoneNumber}
          handleChange={handleChange}
        />
        <EditFieldSelect
          label={"Volunteer Type:"}
          value={formState.participantType}
          handleChange={handleChange}
          name="participantType"
        />
        {(formState.participantType === "Driver" || formState.participantType === "Driver & Packer") && (
          <EditFieldSelect
            label={"time slot:"}
            value={formState.timeSlot}
            handleChange={handleChange}
            name="timeSlot"
          />
        )}
      </form>
      <div className="h-[5%] lg:h-0" />
      <div className="flex h-[5%] items-center justify-center gap-5 lg:h-[10%]">
        <Modal.Close className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 focus:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold">
          Cancel
        </Modal.Close>
        <Modal.Close
          className={cn(
            "rounded-full bg-newLeafGreen px-3 py-2 text-xs font-semibold text-white",
            "lg:px-5 lg:py-3 lg:text-base lg:font-bold",
            "hover:cursor-pointer hover:brightness-150 focus:brightness-200"
          )}
          onClick={() => {
            saveUpdatedVolunteer.mutate({
              id: info.id,
              firstName: formState.firstName,
              lastName: formState.lastName,
              email: formState.email,
              phoneNumber: formState.phoneNumber,
              participantType:
                formState.participantType === "Driver & Packer"
                  ? ["Driver", "Packer"]
                  : [formState.participantType],
              timeSlot: formState.timeSlot,
            });
          }}
        >
          Save
        </Modal.Close>
      </div>
    </Popup>
  );
};
