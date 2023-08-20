import * as Modal from "@radix-ui/react-dialog";
import { cn } from "../utils/ui";
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
        <Modal.Overlay
          className={cn(
            `fixed 
inset-0 
z-20 
bg-background/80 
backdrop-blur-sm 
bg-gray-500 
opacity-40 
data-[state=closed]:fade-out-0 
data-[state=open]:fade-in-0"`,
          )}
        //className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Modal.Content
          //className="fixed left-[50%] top-[50%] z-20 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full"
          className={cn(
            `fixed 
            left-[50%] 
            top-[50%] 
            z-20 
            grid 
            w-full 
            max-w-lg 
            translate-x-[-50%] 
            translate-y-[-50%] 
            gap-4 
            border 
            bg-background 
            p-6 
            shadow-lg 
            duration-200 
            data-[state=closed]:fade-out-0 
            data-[state=open]:fade-in-0 
            sm:rounded-lg 
            md:w-full`,
            className
          )}
        >
          {children}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};

/*
 *
      "fixed 
      inset-0 
      z-50 
      bg-background/80 
      backdrop-blur-sm 
      data-[state=open]:animate-in 
      data-[state=closed]:animate-out 
      data-[state=closed]:fade-out-0 
      data-[state=open]:fade-in-0",

      "
fixed 
left-[50%] 
top-[50%] 
z-50 
grid 
w-full 
max-w-lg 
translate-x-[-50%] 
translate-y-[-50%] 
gap-4 
border 
bg-background 
p-6 
shadow-lg 
duration-200 
data-[state=open]:animate-in 
data-[state=closed]:animate-out 
data-[state=closed]:fade-out-0 
data-[state=open]:fade-in-0 
data-[state=closed]:zoom-out-95 
data-[state=open]:zoom-in-95 
data-[state=closed]:slide-out-to-left-1/2 
data-[state=closed]:slide-out-to-top-[48%] 
data-[state=open]:slide-in-from-left-1/2 
data-[state=open]:slide-in-from-top-[48%] 
sm:rounded-lg 
md:w-full",

*/
