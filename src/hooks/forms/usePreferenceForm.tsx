import { PreferenceForm, setPreferenceForm } from "@/redux/reducers/formsData";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export const usePreferenceForm = () => {
  const { preferenceForm } = useSelector((state: RootState) => state.formsData);
  const dispatch = useDispatch();
  const setPreferenceForm1 = (data: PreferenceForm) => {
    dispatch(setPreferenceForm(data));
  };
  return { preferenceForm, setPreferenceForm: setPreferenceForm1 };
};
