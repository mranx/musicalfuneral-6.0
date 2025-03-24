"use client";
import BigSelectionImageCard from "../card/BigSelectionImageCard";
import PreviousButton from "../buttons/PreviousButton";
import { Button } from "@/components/ui/button";
import { preferredServiceSelection } from "@/lib/consts";
import usePreferredServiceSelection from "@/hooks/usePreferredServiceSelection";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PreferredServiceSelections = () => {
  const router = useRouter();
  const { preferredService, setPreferredService } =
    usePreferredServiceSelection();
  const [error, setError] = useState<string | null>(null);
  const handleNextClick = () => {
    if (preferredService === null) {
      setError("Please select a preferred service before proceeding.");
    } else {
      setError(null);
      if (preferredService === 2) {
        router.push("/music/share-your-preference-secular");
      } else {
        router.push("/music/choose-sectype");
      }
    }
  };
  return (
    <div className="grid grid-cols-1 min-[650px]:grid-cols-2 gap-x-4 gap-y-5 ">
      {preferredServiceSelection.map((music, index) => (
        <BigSelectionImageCard
          iconImage={music.iconImage}
          label={music.label}
          id={music.id}
          setSelected={setPreferredService}
          selected={preferredService}
          key={index}
          item={music}
        />
      ))}
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

export default PreferredServiceSelections;
