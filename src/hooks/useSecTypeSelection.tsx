import { setSecType } from "@/redux/reducers/selections";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const useSecTypeSelection = () => {
  const dispatch = useDispatch();
  const secType = useSelector((state: RootState) => state.selections.secType);

  const setSecType2 = (id: number) => {
    dispatch(setSecType(id));
  };

  return { secType, setSecType: setSecType2 };
};

export default useSecTypeSelection;
