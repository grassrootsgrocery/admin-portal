import location from "../../assets/location.svg";
import roundX from "../../assets/roundX.svg";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import { ProcessedDropoffLocation } from "../../types";
import { cn } from "../../utils/ui";
import { useState } from "react";

interface Props {
  dropoffLocations: ProcessedDropoffLocation[];
}

const labelClasses =
  "col-span-2 lg:col-span-1 font-semibold text-newLeafGreen text-xs";
const valueClasses = "break-words text-wrap col-span-4 lg:text-xl text-sm";

export const LocationPopup: React.FC<Props> = ({ dropoffLocations }) => {
  const [isOpen, setIsOpen] = useState(false);

  //Disable modals with no dropoff locations
  const disabled = dropoffLocations.length === 0;

  return (
    <Popup
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg p-8 h-[30rem] lg:w-[40rem] lg:h-[40rem]"
      )}
      open={isOpen}
      onOpenChange={() => {
        if (!disabled) {
          setIsOpen((prev) => !prev);
        }
      }}
      trigger={
        <div className="flex justify-center">
          <img
            className={cn(
              "w-8",
              disabled ? "opacity-50" : "hover:cursor-pointer"
            )}
            src={location}
            alt=""
          />
        </div>
      }
    >
      <div className="relative">
        <Modal.Close className="absolute right-0 w-4 md:w-6 lg:w-8" asChild>
          <button className="hover:brightness-150">
            <img src={roundX} alt="Hello" />
          </button>
        </Modal.Close>
        <Modal.Title className="m-0 flex h-[10%] justify-center font-bold text-newLeafGreen md:text-2xl lg:px-16">
          Location Information
        </Modal.Title>
        <div className="h-4" />
        <ul className="flex flex-col gap-4 pr-2overflow-scroll h-[90%]">
          {dropoffLocations.map((location, i) => {
            return (
              <li className="grid grid-cols-6 gap-1 rounded-lg border-2 border-newLeafGreen p-4 lg:grid-cols-5">
                <h2 className={labelClasses}>Site {i + 1} Name:</h2>
                <p className={valueClasses}>{location.siteName}</p>
                <h2 className={labelClasses}>Name(s):</h2>
                <p className={valueClasses}>
                  {location.pocNameList.join(", ")}
                </p>
                <h2 className={labelClasses}>Number(s):</h2>
                <p className={valueClasses}>
                  {location.pocPhoneNumberList.join(", ")}
                </p>
                <h2 className={labelClasses}>Email:</h2>
                <p className={valueClasses}>{location.locationEmail}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Popup>
  );
};
