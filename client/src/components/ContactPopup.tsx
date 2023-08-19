import * as Modal from "@radix-ui/react-dialog";
import speech_bubble from "../assets/speech-bubble.svg";
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
      className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-3 px-5 drop-shadow-lg lg:px-8 lg:py-6"
    >
      <div>
        <Modal.Title className="m-0 flex justify-center text-xl font-bold text-newLeafGreen lg:px-16 lg:text-3xl">
          Contact Information
        </Modal.Title>
        <div className="h-4" />
        <div className="flex gap-1 lg:gap-4">
          <h2 className="shrink-0 font-semibold text-newLeafGreen lg:text-xl">
            Number:
          </h2>
          <p className="grow">
            <a href={`tel:${phoneNumber}`} className="text-blue-500 underline">
              {phoneNumber}
            </a>
          </p>
        </div>
        <div className="flex gap-1 lg:gap-4">
          <h2 className="shrink-0 font-semibold text-newLeafGreen lg:text-xl">
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
          <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
            Done
          </Modal.Close>
        </div>
      </div>
    </Popup>
  );
};
