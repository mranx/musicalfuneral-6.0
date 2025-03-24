import { setPreferredService } from "@/redux/reducers/selections";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const usePreferredServiceSelection = () => {
  const dispatch = useDispatch();

  const preferredService = useSelector(
    (state: RootState) => state.selections.preferredService
  );
  const setPreferredService2 = (id: number) => {
    dispatch(setPreferredService(id));
  };

  return { preferredService, setPreferredService: setPreferredService2 };
};

export default usePreferredServiceSelection;
