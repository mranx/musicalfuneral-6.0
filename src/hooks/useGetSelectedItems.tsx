import useMusicFormatSelection from "@/hooks/useMusicFormatSelection";
import usePreferredServiceSelection from "@/hooks/usePreferredServiceSelection";
import {
  musicFormats,
  preferredServiceSelection,
  setTypeSelections,
} from "@/lib/consts";
import useSecTypeSelection from "./useSecTypeSelection";

const useGetSelectedItems = () => {
  const { musicFormat } = useMusicFormatSelection();
  const { preferredService } = usePreferredServiceSelection();
  const { secType } = useSecTypeSelection();
  const selectedMusicFormat = musicFormats.find(
    (music) => music.id === musicFormat
  );
  const selectedPreferredService = preferredServiceSelection.find(
    (service) => service.id === preferredService
  );
  const selectedSecType = setTypeSelections.find((sec) => sec.id === secType);

  return {
    selectedMusicFormat,
    selectedPreferredService,
    selectedSecType,
  };
};

export default useGetSelectedItems;
