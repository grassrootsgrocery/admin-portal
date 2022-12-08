import React from "react";
import * as Modal from "@radix-ui/react-dialog";
//import {Cross2Icon} from '@radix-ui/react-icons';
import "./styles.css";
import x from "../assets/ex.svg";

const itemWrap = "flex gap-4";
const itemLabel = "b text-lg text-newLeafGreen font-bold flex justify-end";
const itemValue = "b text-lg grow flex justify-end";
const Popup = (props: any) => {
  return (
    <Modal.Root>
      <Modal.Trigger asChild>{props.trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay className="modal-overlay bg-softBeige" />
        <Modal.Content className="modal-content flex flex-col drop-shadow-lg bg-softBeige rounded-2xl">
          <Modal.Title className="m-0 flex justify-center text-3xl font-bold text-newLeafGreen">
            {props.title}
          </Modal.Title>
          <Modal.Description className="">{props.content}</Modal.Description>
          <div className="my-5 flex justify-center gap-8">
            <Modal.Close asChild>
              <button
                className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
                type="button"
              >
                Cancel
              </button>
            </Modal.Close>
            {props.next}
          </div>
          <Modal.Close asChild>
            <button className="flex top-7 right-7 absolute">
              <img src={x} className="w-4 lg:w-8" />
            </button>
          </Modal.Close>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};

export default Popup;
