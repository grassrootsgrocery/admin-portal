import * as Modal from "@radix-ui/react-dialog";
import { cn } from "../utils/ui";

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
        <Modal.Overlay
          className={cn(
            "fixed inset-0 z-20 bg-background/80 bg-gray-500 opacity-30",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0",
          )}
        />
        <Modal.Content
          className={cn(
            "z-20 shadow-lg duration-200",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95",
            "data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2",
            "data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg",
            "md:w-full",
            className,
          )}
        >
          {children}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};
