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
  // title: string;
  title: any;
  content: JSX.Element | string | number;
  next: any;
}
const Popup = ({
  trigger,
  onOpenChange,
  renderLittleXCloseButton,
  title,
  content,
  next,
}: Props) => {
  return (
    <div>
      <Modal.Root onOpenChange={onOpenChange}>
        <Modal.Trigger asChild>{trigger}</Modal.Trigger>
        <Modal.Portal>
          <Modal.Overlay className="modal-overlay z-20 bg-slate-300" />
          <Modal.Content className="modal-content z-20 flex flex-col rounded-2xl bg-softBeige p-12 drop-shadow-lg">
            <Modal.Title asChild>
              <div className="b m-0 flex justify-center text-3xl font-bold text-newLeafGreen">
                {title}
              </div>
            </Modal.Title>
            <Modal.Description asChild>
              <div className="g flex justify-center">{content}</div>
            </Modal.Description>
            <div
              style={
                {
                  // display: props.noCancel ? "none" : "flex",
                }
              }
              className="r my-5 flex justify-center gap-8"
            >
              <Modal.Close asChild>
                <button
                  // onClick={() => (!!props.close ? props.close() : {})}
                  className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
                  type="button"
                >
                  Cancel
                </button>
              </Modal.Close>

              {next}
            </div>

            <Modal.Close asChild>
              {renderLittleXCloseButton && (
                <button
                  // onClick={() => (!!props.close ? props.close() : {})}
                  className="absolute top-7 right-7 flex"
                >
                  <img src={x} className="w-4 lg:w-8" />
                </button>
              )}
            </Modal.Close>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
};

export default Popup;
