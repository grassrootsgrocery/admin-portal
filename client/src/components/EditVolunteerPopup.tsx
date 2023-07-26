import React, { useState } from "react";
import { Popup } from "./Popup";
import pencil from "../assets/pencil.svg";
import * as Modal from "@radix-ui/react-dialog";
import { useMutation } from "react-query";
import { API_BASE_URL, applyPatch } from "../httpUtils";
import { toastNotify } from "../uiUtils";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface Props {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  participantType: string;
  refetch: () => void;
}

interface EditFieldProps {
  label: string;
  fieldType: string;
  fieldName: string;
  value: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
}

const EditFieldInput = ({
  label,
  fieldType,
  fieldName,
  handleChange,
  value,
}: EditFieldProps) => {
  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:gap-8">
        <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">
          {label}
        </p>
        <div className="relative w-64 grow md:w-80">
          <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
            <form className={"flex w-full flex-col space-y-3"}>
              <div className="flex flex-col space-y-1">
                <input
                  className="w-full border-0 outline-none" // Add "w-full" class for full width
                  type={fieldType}
                  name={fieldName}
                  value={value}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const participantTypes: string[] = ["Driver", "Packer", "Driver & Packer"];

const EditFieldSelect = ({
  label,
  handleChange,
  value,
}: Pick<EditFieldProps, "label" | "handleChange" | "value">) => {
  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:gap-8">
        <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">
          {label}
        </p>
        <div className="relative w-64 grow md:w-80">
          <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
            <form className={"flex w-full flex-col space-y-3"}>
              <div className="flex flex-col space-y-1">
                <select
                  className="w-full border-0 outline-none"
                  name="participantType"
                  value={value}
                  onChange={handleChange}
                >
                  {participantTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export const EditVolunteerPopup = (info: Props) => {
  const [formState, setFormState] = useState(info);

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
    }) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/volunteers/update/${payload.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.messsage);
      }
      return resp.json();
    },
    onSuccess(data, variables, context) {
      toastNotify("Volunteer updated successfully", "success");

      // refetch table
      info.refetch();
    },
    onError(error, variables, context) {
      console.error(error);
      toastNotify("There was a problem updating the volunteer", "failure");
    },
  });

  return (
    <>
      <Popup
        trigger={
          <div className="flex justify-center hover:cursor-pointer">
            <img className="w-8" src={pencil} alt="" />
          </div>
        }
        content={
          <div className={"flex flex-col space-y-2"}>
            {/* title */}
            <div className="flex justify-center">
              <h1 className="text-2xl font-bold text-newLeafGreen">
                Edit Volunteer
              </h1>
            </div>

            <EditFieldInput
              fieldType={"text"}
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
            {/*            <EditFieldSelect
              label={"Volunteer Type:"}
              value={formState.participantType}
              handleChange={handleChange}
            />*/}

            <div className="row-auto flex justify-center space-x-2">
              <Modal.Close className="rounded-full bg-red-700 px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
                Cancel
              </Modal.Close>
              <Modal.Close
                className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base"
                onClick={() => {
                  saveUpdatedVolunteer.mutate({
                    id: info.id,
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    email: formState.email,
                    phoneNumber: formState.phoneNumber,
                    participantType:
                      formState.participantType == "Driver & Packer"
                        ? ["Driver", "Packer"]
                        : [formState.participantType],
                  });
                }}
              >
                Save
              </Modal.Close>
            </div>
          </div>
        }
      />
    </>
  );
};
