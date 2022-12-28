import { DataTable } from "../../components/DataTable";
import * as Modal from "@radix-ui/react-dialog";
import Popup from "../../components/Popup";

interface Props {}
function tempViewSpecialGroupsFunct() {
  return [
    [1, "Blackrock", "www.grassrootsgrocery.org/blackrock-delivers"],
    [2, "Blackrock", "www.grassrootsgrocery.org/blackrock-delivers"],
    [3, "Blackrock", "www.grassrootsgrocery.org/blackrock-delivers"],
    [4, "Blackrock", "www.grassrootsgrocery.org/blackrock-delivers"],
    [5, "Blackrock", "www.grassrootsgrocery.org/blackrock-delivers"],
  ];
}
export const ViewSpecialGroups: React.FC<Props> = () => {
  return (
    <Popup
      trigger={
        <button
          className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          type="button"
        >
          View Special Groups
        </button>
      }
      content={
        <div>
          <Modal.Title className="m-0 flex justify-center px-16 text-3xl font-bold text-newLeafGreen">
            View Event Special Groups
          </Modal.Title>
          <div className="h-6" />
          <DataTable
            borderColor="newLeafGreen"
            columnHeaders={["Name", "Sign-up Link"]}
            dataRows={tempViewSpecialGroupsFunct()}
          />
          <div className="h-4" />
          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl">
              Done
            </Modal.Close>
          </div>
        </div>
      }
    />
  );
};
