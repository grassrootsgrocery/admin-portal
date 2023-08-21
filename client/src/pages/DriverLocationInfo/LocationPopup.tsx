import location from "../../assets/location.svg";
import roundX from "../../assets/roundX.svg";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import { ProcessedDropoffLocation } from "../../types";
import { cn } from "../../utils/ui";

interface Props {
  dropoffLocations: ProcessedDropoffLocation[];
}

const labelClasses =
  "col-span-2 lg:col-span-1 font-semibold text-newLeafGreen text-xs";
const valueClasses = "break-words text-wrap col-span-4 lg:text-xl text-sm";

export const LocationPopup: React.FC<Props> = ({ dropoffLocations }) => {
  return (
    <Popup
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg p-8 md:w-[40rem]"
      )}
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={location} alt="" />
        </div>
      }
    >
      <div className="relative">
        <Modal.Close
          className="absolute right-0 w-4 hover:cursor-pointer md:w-6 lg:w-8"
          asChild
        >
          <img src={roundX} alt="Hello" />
        </Modal.Close>
        <Modal.Title className="m-0 flex justify-center font-bold text-newLeafGreen md:text-2xl lg:px-16">
          Location Information
        </Modal.Title>
        <div className="h-4" />
        <div className="flex h-[350px] w-[325px] overflow-scroll md:w-[600px] lg:h-[400px] lg:w-[1000px]">
          <ul className="flex h-0 grow flex-col gap-4 pr-2">
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
      </div>
    </Popup>
  );
};
