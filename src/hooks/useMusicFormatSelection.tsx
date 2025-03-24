import { setMusicFormat } from "@/redux/reducers/selections";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
const useMusicFormatSelection = () => {
  const dispatch = useDispatch();
  const musicFormat = useSelector(
    (state: RootState) => state.selections.musicFormat
  );

  function setMusicFormat2(id: number) {
    dispatch(setMusicFormat(id));
  }

  return {
    musicFormat,
    setMusicFormat: setMusicFormat2,
  };
};

export default useMusicFormatSelection;
