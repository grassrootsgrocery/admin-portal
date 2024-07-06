import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  RowModel,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";
import { Root, Trigger, Content, Item } from "@radix-ui/react-dropdown-menu";

import React, { useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import check_icon from "../assets/checkbox-icon.svg";
import x from "../assets/x.svg";

export interface Props<T> {
  data: T[];
  filters?: { name: string; filterFn: (e: T) => boolean }[];
  columns: any[]; //  have to use any here, column type is very complex bc of all the different options
}

interface FilterItemProps {
  onSelect: () => void;
  filterLabel: string;
  selected: boolean;
}

interface FilterButtonProps {
  onSelect: () => void;
  filterLabel: string;
}

const FilterButton = ({ filterLabel, onSelect }: FilterButtonProps) => {
  return (
    <button
      className="flex min-w-fit shrink-0 items-center gap-1 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white lg:text-base lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
      onClick={onSelect}
    >
      <p className="text-sm">{filterLabel}</p>
      <img className="w-3 sm:w-4" src={x} alt="x" />
    </button>
  );
};

const FilterItem = ({ filterLabel, selected, onSelect }: FilterItemProps) => {
  return (
    <DropdownMenu.Item
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border px-2 font-semibold shadow-md outline-none hover:cursor-pointer hover:brightness-110 data-[highlighted]:-m-[1px] data-[selected]:cursor-pointer data-[highlighted]:cursor-pointer data-[highlighted]:border-2 data-[highlighted]:brightness-110 ${
        selected
          ? "bg-pumpkinOrange text-white data-[highlighted]:border-white"
          : "border-pumpkinOrange bg-white text-pumpkinOrange"
      }`}
      onSelect={(e) => {
        e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        onSelect();
      }}
    >
      <div className="w-10/12">{filterLabel}</div>
      <RadixCheckbox.Root
        className={`ml-auto flex h-4 w-4 items-end justify-end rounded border border-pumpkinOrange ${
          selected ? "bg-white" : "bg-softGrayWhite"
        }`}
        checked={selected}
        id="c1"
      >
        <RadixCheckbox.Indicator className="CheckboxIndicator">
          <img src={check_icon} alt="check" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    </DropdownMenu.Item>
  );
};

const HeaderMoveLabel = ({ label }: { label: string }) => {};

export const NewDataTable = <T,>({
  data: initialData,
  columns,
  filters: filterProps,
}: Props<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState(
    filterProps && filterProps.length > 0
      ? filterProps.map((filter) => ({ ...filter, isSelected: false }))
      : []
  );
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [isColumnSelectionDropDownOpen, setColumnSelectionDropDownOpen] =
    useState(false);

  const applyFilters = (
    data: T[],
    filters: {
      isSelected: boolean;
      name: string;
      filterFn: (e: T) => boolean;
    }[]
  ) => {
    return data.filter((row) => {
      for (const filter of filters) {
        if (filter.isSelected && !filter.filterFn(row)) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredData = useMemo(() => {
    return applyFilters(initialData, filters);
  }, [initialData, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    enableFilters: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const onFilterSelect = (index: number) => {
    let newFilters = [...filters];
    newFilters[index].isSelected = !newFilters[index].isSelected;
    setFilters(newFilters);
  };

  let columnBeingDragged: number;

  const onDragStart = (e: any, columnIndex: number): void => {
    e.dataTransfer!.setData("text/plain", columnIndex.toString());
  };

  const onDrop = (e: any, newPosition: number): void => {
    e.preventDefault();
    const columnIndex = parseInt(e.dataTransfer.getData("text/plain"));

    const currentCols = table.getVisibleLeafColumns().map((c) => c.id);
    const colToBeMoved = currentCols.splice(columnIndex, 1);
    currentCols.splice(newPosition, 0, colToBeMoved[0]);

    table.setColumnOrder(currentCols);
  };

  return (
    <div className="hide-scroll flex h-full w-full flex-col overflow-scroll pt-6 ">
      {/*drop down stuff */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4">
        {/* Column Visibility */}
        <DropdownMenu.Root
          open={isColumnSelectionDropDownOpen}
          onOpenChange={() =>
            setColumnSelectionDropDownOpen(!isColumnSelectionDropDownOpen)
          }
          modal={false}
        >
          <DropdownMenu.Trigger asChild>
            <h1
              className={`flex w-44 shrink-0 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
                isColumnSelectionDropDownOpen ? " brightness-110" : ""
              }`}
            >
              Select Columns
              <img
                className="w-2 md:w-3"
                src={isColumnSelectionDropDownOpen ? chevron_up : chevron_down}
                alt="chevron-icon"
              />
            </h1>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={`absolute z-20 flex w-44 flex-col gap-2 rounded-lg border bg-softBeige shadow-md ${
                isColumnSelectionDropDownOpen ? "py-2 px-2" : ""
              }`}
              avoidCollisions
              align="start"
            >
              {[
                <FilterItem
                  key="toggleAll"
                  filterLabel="Toggle All"
                  onSelect={() =>
                    table.toggleAllColumnsVisible(
                      !table.getIsAllColumnsVisible()
                    )
                  }
                  selected={table.getIsAllColumnsVisible()}
                />,
                ...table
                  .getAllLeafColumns()
                  .map((column) => (
                    <FilterItem
                      key={column.id}
                      filterLabel={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                      selected={column.getIsVisible()}
                    />
                  )),
              ]}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {/* Filtering */}
        {filterProps && filterProps.length > 0 && (
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4">
            <DropdownMenu.Root
              open={isFilterDropdownOpen}
              onOpenChange={() =>
                setIsFilterDropdownOpen(!isFilterDropdownOpen)
              }
              modal={false}
            >
              <DropdownMenu.Trigger asChild>
                <h1
                  className={`flex w-44 shrink-0 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
                    isFilterDropdownOpen ? " brightness-110" : ""
                  }`}
                >
                  Filter
                  <img
                    className="w-2 md:w-3"
                    src={isFilterDropdownOpen ? chevron_up : chevron_down}
                    alt="chevron-icon"
                  />
                </h1>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={`absolute z-20 flex w-44 flex-col gap-2 rounded-lg border bg-softBeige shadow-md ${
                    isFilterDropdownOpen ? "py-2 px-2" : ""
                  }`}
                  avoidCollisions
                  align="start"
                >
                  {filters.map((item, i) => (
                    <FilterItem
                      key={i}
                      selected={item.isSelected}
                      onSelect={() => onFilterSelect(i)}
                      filterLabel={item.name}
                    />
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Applied Filters Labels */}
            {filters.filter((f) => f.isSelected).length > 0 && (
              <h1 className="align-stretch shrink-0 font-semibold text-newLeafGreen lg:text-lg">
                Applied Filters:
              </h1>
            )}

            {/* Buttons that pops up after filter is clicked */}
            <div className="scrollbar-thin flex h-11 max-w-full grow items-start gap-4 overflow-x-auto overscroll-x-auto py-1 px-2">
              {filters.map((item, i) => {
                if (!item.isSelected) return null;
                return (
                  <FilterButton
                    key={i}
                    onSelect={() => onFilterSelect(i)}
                    filterLabel={item.name}
                  />
                );
              })}
            </div>

            {/* Clear Filters button */}
            {filters.filter((f) => f.isSelected).length > 0 && (
              <button
                className="shrink-0 rounded-full bg-pumpkinOrange px-4 text-base font-semibold text-white md:px-10 md:py-1 lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
                type="button"
                onClick={() => {
                  let newFilters = filters.map((filter) => ({
                    ...filter,
                    isSelected: false,
                  }));
                  setFilters(newFilters);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      <div className="h-10" />
      <div
        className={`softGrayWhite border-spacing-2 overflow-y-auto rounded-lg border-2`}
      >
        <table className="table w-full border-collapse rounded-lg">
          <thead className="sticky top-0 z-10 border-b-2 border-newLeafGreen bg-softBeige">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      draggable={true}
                      onDragStart={(e) => {
                        onDragStart(e, header.index);
                      }}
                      onDragOver={(e): void => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        onDrop(e, header.index);
                      }}
                      key={header.id}
                      colSpan={header.colSpan}
                      className="border border-newLeafGreen bg-softBeige p-4 text-sm text-newLeafGreen md:text-base"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id} className="text-center">
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="border border-newLeafGreen bg-softBeige px-2 py-2 text-center align-middle text-sm text-newLeafGreen md:text-base"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
