import {
  PaymentAndUserRegistrationForm,
  setPaymentAndUserRegistrationForm,
} from "@/redux/reducers/formsData";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const usePaymentAndRegistrationForm = () => {
  const dispatch = useDispatch();
  const { paymentAndUserRegistrationForm } = useSelector(
    (state: RootState) => state.formsData
  );
  const setPaymentAndUserRegistrationForm1 = (
    data: PaymentAndUserRegistrationForm
  ) => {
    dispatch(setPaymentAndUserRegistrationForm(data));
  };
  return {
    paymentAndUserRegistrationForm,
    setPaymentAndUserRegistrationForm: setPaymentAndUserRegistrationForm1,
  };
};

export default usePaymentAndRegistrationForm;
