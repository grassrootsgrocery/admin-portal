import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import coordinator_icon from "../../assets/coordinator.svg";

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
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={coordinator_icon} alt="" />
        </div>
      }
      content={
        <div className="w-80 lg:w-96">
          <Modal.Title className="m-0 flex justify-center whitespace-nowrap text-xl font-bold text-newLeafGreen lg:px-16 lg:text-2xl">
            Coordinator Information
          </Modal.Title>
          <div className="h-4" />
          <div className="flex flex-col gap-1">
            <h2 className={labelClasses}>Name(s):</h2>
            <p className={valueClasses}>{coordinatorPOCNames.join(", ")}</p>
            <h2 className={labelClasses}>Number(s):</h2>
            <p className={valueClasses}>
              {coordinatorPOCPhoneNumbers
                .map((phoneNumber) => (
                  <a
                    key={phoneNumber}
                    href={`tel:${phoneNumber}`}
                    className="hover:underline"
                  >
                    {phoneNumber}
                  </a>
                ))
                .join(", ")}
            </p>
            <h2 className={labelClasses}>Email:</h2>
            <p className={valueClasses}>
              <a href={`mailto:${locationEmail}`} className="hover:underline">
                {locationEmail}
              </a>
            </p>
          </div>
          <div className="h-4" />
          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
              Done
            </Modal.Close>
          </div>
        </div>
      }
    />
  );
};
