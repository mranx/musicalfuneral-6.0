"use client";
import { useState } from "react";
import SelectionCard from "@/_mycomponents/card/SelectionCard";
import { Button } from "@/components/ui/button";
import PreviousButton from "../buttons/PreviousButton";
import { musicFormats } from "@/lib/consts";
import { useRouter } from "next/navigation";
import useMusicFormatSelection from "@/hooks/useMusicFormatSelection";

const MusicFormatSelections = () => {
  const router = useRouter();
  const { musicFormat, setMusicFormat } = useMusicFormatSelection();
  const [error, setError] = useState<string | null>(null);

  const handleNextClick = () => {
    if (musicFormat === null) {
      setError("Please select a music format before proceeding.");
    } else {
      setError(null);
      router.push("/music/choose-preferred-service");
    }
  };

  return (
    <div className="grid grid-cols-1 min-[650px]:grid-cols-3 gap-x-4 gap-y-5">
      {musicFormats.map((music, index) => (
        <SelectionCard
          icon={music.icon}
          label={music.label}
          id={music.id}
          setSelected={setMusicFormat}
          selected={musicFormat}
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

export default MusicFormatSelections;
