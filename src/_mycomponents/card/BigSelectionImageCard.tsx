import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

// types
type Props = {
  selected: number | null;
  label: string;
  id: number;
  setSelected: Function;
  iconImage: string;
  item: {
    label: string;
    id: number;
  };
};
const BigSelectionImageCard = ({
  selected,
  id,
  label,
  iconImage,
  setSelected,
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
      <div>
        <Image
          className="h-36 w-36 object-contain object-center"
          src={iconImage}
          width={150}
          height={150}
          alt="icon"
        />
      </div>

      <h5 className="font-semibold text-center">{label}</h5>
    </div>
  );
};

export default BigSelectionImageCard;
