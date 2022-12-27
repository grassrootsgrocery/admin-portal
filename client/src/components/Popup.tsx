import React from "react";
import * as Modal from "@radix-ui/react-dialog";
import "./Popup.css";
import x from "../assets/ex.svg";

const itemWrap = "flex gap-4";
const itemLabel = "b text-lg text-newLeafGreen font-bold flex justify-end";
const itemValue = "b text-lg grow flex justify-end";
interface Props {
  trigger: JSX.Element;
  onOpenChange?: () => void;
  renderLittleXCloseButton?: boolean;
  content: JSX.Element;
}
const Popup = ({ trigger, content, onOpenChange }: Props) => {
  return (
    <Modal.Root onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay className="modal-overlay z-20 bg-gray-500" />
        <Modal.Content className="modal-content z-20 flex flex-col rounded-2xl bg-softBeige p-12 drop-shadow-lg">
          {content}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};

export default Popup;
