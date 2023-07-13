import React, { useState } from "react";
import { Popup } from "./Popup";
import alert from "../assets/alert.svg";
import * as Modal from "@radix-ui/react-dialog";

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
  participantType: VolunteerTypes;
}

export const EditVolunteerPopup: React.FC<Props> = (info: Props) => {
  const [formState, setFormState] = useState(info);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <Popup
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={alert} alt="" />
        </div>
      }
      content={
        <div>
          <Modal.Title className="m-0 flex justify-center text-xl font-bold text-newLeafGreen lg:px-16 lg:text-3xl">
            Edit Volunteer
          </Modal.Title>
          <form className={"flex flex-col"}>
            <input
              className="grow border-green-500 text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:border-green-500 focus:outline-none md:text-lg md:placeholder:text-lg"
              type="text"
              name="firstName"
              value={formState.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
            <input
              className="grow border-green-500 text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:border-green-500 focus:outline-none md:text-lg md:placeholder:text-lg"
              type="text"
              name="lastName"
              value={formState.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
            <input
              className="grow border-green-500 text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:border-green-500 focus:outline-none md:text-lg md:placeholder:text-lg"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              className="grow border-green-500 text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:border-green-500 focus:outline-none md:text-lg md:placeholder:text-lg"
              type="tel"
              name="phoneNumber"
              value={formState.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            <select
              className="grow border-green-500 text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:border-green-500 focus:outline-none md:text-lg md:placeholder:text-lg"
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
          </form>

          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
              Cancel
            </Modal.Close>
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
              Done
            </Modal.Close>
          </div>
        </div>
      }
    />
  );
};
