import { cn } from "@/lib/utils";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { LucideIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

// types
type Props = {
  selected: number | null;
  label: string;
  id: number;
  setSelected: Function;
  icon: LucideIcon;
  item: {
    label: string;
    id: number;
  };
};
const SelectionCard = ({
  selected,
  id,
  label,
  icon: Icon,
  setSelected,
  item,
}: Props) => {
  return (
    <div
      onClick={() => setSelected(id)}
      className={cn(
        "px-6 py-[32px] cursor-pointer rounded-xl border-2 relative   flex  flex-col items-center justify-center gap-4",
        selected === id
          ? "border-[#3F72AF] dark:border-[#3F72AF] dark:bg-[#191D31]"
          : "border-[#E6E6E6] dark:border-[#303559]"
      )}
    >
      {/* radio button  */}
      <div
        className={cn(
          "h-5 w-5 absolute top-2 right-2 rounded-circle border-2  flex justify-center items-center",
          selected === id
            ? "border-[#3F72AF]"
            : "border-[#E6E6E6] dark:border-[#3F72AF]"
        )}
      >
        <div
          className={cn(
            selected === id && "h-3 w-3 rounded-circle bg-[#3F72AF]"
          )}
        ></div>
      </div>
      {/* icon  */}
      <div className="w-12 h-12 rounded-circle bg-[#3F72AF] flex justify-center items-center">
        <Icon size={25} color="white" />
      </div>
      <h5 className="font-semibold text-center">{label}</h5>
    </div>
  );
};

export default SelectionCard;
