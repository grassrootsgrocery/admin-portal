import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import coordinator_icon from "../../assets/coordinator.svg";
import { cn } from "../../utils/ui";

interface Props {
  coordinatorPOCNames: string[];
  coordinatorPOCPhoneNumbers: string[];
  locationEmail: string;
}

const labelClasses = "col-span-1 font-semibold text-newLeafGreen";
const valueClasses = "col-span-4 lg:text-xl";

export const CoordinatorInfoPopup: React.FC<Props> = ({
  coordinatorPOCNames,
  coordinatorPOCPhoneNumbers,
  locationEmail,
}) => {
  return (
    <Popup
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg p-8 md:w-[40rem]"
      )}
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={coordinator_icon} alt="" />
        </div>
      }
    >
      <>
        <Modal.Title className="m-0 flex justify-center whitespace-nowrap text-xl font-bold text-newLeafGreen lg:px-16 lg:text-2xl">
          Coordinator Information
        </Modal.Title>
        <div className="h-4" />
        <div className="flex flex-col gap-1">
          <h2 className={labelClasses}>Name(s):</h2>
          <p className={valueClasses}>{coordinatorPOCNames.join(", ")}</p>
          <h2 className={labelClasses}>Number(s):</h2>
          <p className={valueClasses}>
            {coordinatorPOCPhoneNumbers.map((phoneNumber, index) => (
              <a
                key={phoneNumber}
                href={`tel:${phoneNumber}`}
                className="text-blue-500 underline"
              >
                {phoneNumber}
                {index !== coordinatorPOCPhoneNumbers.length - 1 ? ", " : ""}
              </a>
            ))}
          </p>
          <h2 className={labelClasses}>Email:</h2>
          <p className={valueClasses}>
            {locationEmail != "None" ? (
              <a
                href={`mailto:${locationEmail}`}
                className="text-blue-500 underline"
              >
                {locationEmail}
              </a>
            ) : (
              "None"
            )}
          </p>
        </div>
        <div className="h-4" />
        <div className="flex justify-center">
          <Modal.Close className={cn(
            "bg-newLeafGreen rounded-full px-3 py-2 text-xs font-semibold text-white hover:brightness-150 focus:brightness-150", 
            "lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          )}>
            Done
          </Modal.Close>
        </div>
      </>
    </Popup>
  );
};
