import * as Modal from "@radix-ui/react-dialog";
import "./Popup.css";

interface Props {
  trigger: JSX.Element;
  onOpenChange?: () => void;
  shouldDodgeKeyboard?: boolean;
  content: JSX.Element;
}
export const Popup = ({
  trigger,
  content,
  onOpenChange,
  shouldDodgeKeyboard,
}: Props) => {
  return (
    <Modal.Root onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay className="modal-overlay z-20 bg-gray-500" />
        <Modal.Content
          className="
          modal-open-animation 
          fixed 
          top-1/2
          left-1/2 
          z-20 
          flex max-w-full 
          -translate-x-1/2 -translate-y-1/2 flex-col 
          rounded-lg bg-softBeige 
          py-3 px-5 drop-shadow-lg 
          lg:px-8 lg:py-6
          "
        >
          {content}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};
