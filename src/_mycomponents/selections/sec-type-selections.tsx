"use client";
import { useState } from "react";
import BigSelectionImageCard from "../card/BigSelectionImageCard";
import PreviousButton from "../buttons/PreviousButton";
import { Button } from "@/components/ui/button";
import { setTypeSelections } from "@/lib/consts";
import useSecTypeSelection from "@/hooks/useSecTypeSelection";
import { useRouter } from "next/navigation";

const SecTypeSelections = () => {
  const router = useRouter();
  const { secType, setSecType } = useSecTypeSelection();
  const [error, setError] = useState<string | null>(null);
  const handleNextClick = () => {
    if (secType === null) {
      setError("Please select a preferred service before proceeding.");
    } else {
      setError(null);
      switch (secType) {
        case 1:
          router.push("/music/share-your-preference-catholic");
          break;
        case 2:
          router.push("/music/share-your-preference-anglican");
          break;
        case 3:
          router.push("/music/share-your-preference-uniting");
          break;
        case 4:
          router.push("/music/share-your-preference-baptist");
          break;
        default:
          break;
      }
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 ">
      {setTypeSelections.map((music, index) => (
        <BigSelectionImageCard
          iconImage={music.iconImage}
          label={music.label}
          id={music.id}
          setSelected={setSecType}
          selected={secType}
          key={index}
          item={music}
        />
      ))}{" "}
      {error && (
        <div className="text-red-500 text-sm col-span-full">{error}</div>
      )}
      <div className="flex justify-between items-center gap-2 col-span-full">
        <PreviousButton />
        <button
          type="button"
          className="  px-10 py-2.5 rounded-full  font-medium bg-[#3F72AF] hover:bg-[#172e4b] text-white"
          onClick={handleNextClick}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SecTypeSelections;
