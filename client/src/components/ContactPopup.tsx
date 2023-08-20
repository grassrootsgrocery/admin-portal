import * as Modal from "@radix-ui/react-dialog";
import speech_bubble from "../assets/speech-bubble.svg";
import { cn } from "../utils/ui";
import { Popup } from "./Popup";

interface Props {
  phoneNumber: string;
  email: string;
}
export const ContactPopup: React.FC<Props> = ({ phoneNumber, email }) => {
  return (
    <Popup
      trigger={
        <div className="flex justify-center hover:cursor-pointer">
          <img className="w-8" src={speech_bubble} alt="" />
        </div>
      }
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg p-8 md:w-[40rem]"
      )}
    >
      <div>
        <Modal.Title className="text-newLeafGreen m-0 flex justify-center text-xl font-bold lg:px-16 lg:text-3xl">
          Contact Information
        </Modal.Title>
        <div className="h-4" />
        <div className="flex gap-1 lg:gap-4">
          <h2 className="text-newLeafGreen shrink-0 font-semibold lg:text-xl">
            Number:
          </h2>
          <p className="grow">
            <a href={`tel:${phoneNumber}`} className="text-blue-500 underline">
              {phoneNumber}
            </a>
          </p>
        </div>
        <div className="flex gap-1 lg:gap-4">
          <h2 className="text-newLeafGreen shrink-0 font-semibold lg:text-xl">
            Email:
          </h2>
          <p className="grow">
            <a href={`mailto:${email}`} className="text-blue-500 underline">
              {email}
            </a>
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
      </div>
    </Popup>
  );
};
