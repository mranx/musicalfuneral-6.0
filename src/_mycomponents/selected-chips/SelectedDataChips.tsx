"use client";

import useGetSelectedItems from "@/hooks/useGetSelectedItems";

type Props = {
  showSelectedMusicFormat?: boolean;
  showSelectedPreferredService?: boolean;
  showSelectedSecType?: boolean;
};

const SelectedDataChips = ({
  showSelectedMusicFormat,
  showSelectedPreferredService,
  showSelectedSecType,
}: Props) => {
  const { selectedMusicFormat, selectedPreferredService, selectedSecType } =
    useGetSelectedItems();
  return (
    <div className="flex gap-2">
      {showSelectedMusicFormat && selectedMusicFormat && (
        <h6 className="text-[#3F72AF] text-sm font-semibold py-2.5 px-3.5 rounded-full bg-[#3F72AF14]">
          {selectedMusicFormat?.label}
        </h6>
      )}
      {showSelectedPreferredService && selectedPreferredService && (
        <h6 className="text-[#3F72AF] text-sm font-semibold py-2.5 px-3.5 rounded-full bg-[#3F72AF14]">
          {selectedPreferredService?.label}
        </h6>
      )}
      {showSelectedSecType && selectedSecType && (
        <h6 className="text-[#3F72AF] text-sm font-semibold py-2.5 px-3.5 rounded-full bg-[#3F72AF14]">
          {selectedSecType?.label}
        </h6>
      )}
    </div>
  );
};

export default SelectedDataChips;
