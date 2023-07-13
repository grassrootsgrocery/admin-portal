import React, { useState } from "react";
import { Popup } from "./Popup";
import alert from "../assets/alert.svg";

enum VolunteerTypes {
  DRIVER = "Driver",
  DISTRIBUTOR = "Distributor",
  BOTH = "Both",
}

interface Props {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  [key: string]: string | VolunteerTypes;
}

interface EditFieldProps {
  label: string;
  fieldType: string;
  fieldName: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  placeHolder: string;
  formState: Props;
}

const EditFieldSelect = ({
  label,
  handleChange,
  formState,
}: Pick<EditFieldProps, "label" | "handleChange" | "formState">) => {
  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:gap-8">
        <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">
          {label}
        </p>
        <div className="relative w-64 grow md:w-80">
          <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
            <form className={"flex flex-col space-y-3"}>
              <div className="flex flex-col space-y-1">
                <select
                  className="border-0 outline-none"
                  name="participantType"
                  value={formState.participantType}
                  onChange={handleChange}
                >
                  {Object.values(VolunteerTypes).map((type) => (
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

const EditFieldInput = ({
  label,
  fieldType,
  fieldName,
  handleChange,
  placeHolder,
  formState,
}: EditFieldProps) => {
  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:gap-8">
        <p className="shrink-0 font-bold text-newLeafGreen lg:text-xl">
          {label}
        </p>
        <div className="relative w-64 grow md:w-80">
          <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
            <form className={"flex flex-col space-y-3"}>
              <div className="flex flex-col space-y-1">
                <input
                  type={fieldType}
                  name={fieldName}
                  value={formState[fieldName]}
                  onChange={handleChange}
                  placeholder={placeHolder}
                />
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  return (
    <>
      <Popup
        trigger={
          <div className="flex justify-center hover:cursor-pointer">
            <img className="w-8" src={alert} alt="" />
          </div>
        }
        content={
          <div className={"flex flex-col space-y-2"}>
            <EditFieldInput
              fieldType={"text"}
              fieldName={"firstName"}
              label={"First Name:"}
              formState={formState}
              handleChange={handleChange}
              placeHolder={info.firstName}
            />
            <EditFieldInput
              fieldType={"text"}
              fieldName={"lastName"}
              label={"Last Name:"}
              formState={formState}
              handleChange={handleChange}
              placeHolder={info.lastName}
            />
            <EditFieldInput
              fieldType={"email"}
              fieldName={"email"}
              label={"Email:"}
              formState={formState}
              handleChange={handleChange}
              placeHolder={info.email}
            />
            <EditFieldInput
              fieldType={"tel"}
              fieldName={"phoneNumber"}
              label={"Phone Number:"}
              formState={formState}
              handleChange={handleChange}
              placeHolder={info.phoneNumber}
            />
            <EditFieldSelect
              label={"Volunteer Type:"}
              formState={formState}
              handleChange={handleChange}
            />
          </div>
        }
      />
    </>
  );
};
