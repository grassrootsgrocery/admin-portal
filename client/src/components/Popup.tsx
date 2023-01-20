import * as Modal from "@radix-ui/react-dialog";
import "./Popup.css";

interface Props {
  trigger: JSX.Element;
  onOpenChange?: () => void;
  content: JSX.Element;
}
export const Popup = ({ trigger, content, onOpenChange }: Props) => {
  return (
    <Modal.Root onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay className="modal-overlay z-20 bg-gray-500" />
        <Modal.Content className="modal-content z-20 flex flex-col rounded-2xl bg-softBeige drop-shadow-lg lg:p-12">
          {content}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};
