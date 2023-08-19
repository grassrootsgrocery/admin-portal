import * as Modal from "@radix-ui/react-dialog";
import "./Popup.css";

interface Props {
  trigger: JSX.Element;
  open?: boolean;
  onOpenChange?: () => void;
  className?: string;
  children?: React.ReactNode;
}
export const Popup: React.FC<Props> = ({
  trigger,
  open,
  onOpenChange,
  className = "",
  children,
}) => {
  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay className="modal-overlay z-20 bg-gray-500" />
        <Modal.Content
          className={`modal-open-animation fixed z-20 flex max-w-full rounded-lg bg-softBeige drop-shadow-lg ${className}`}
        >
          {children}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};
