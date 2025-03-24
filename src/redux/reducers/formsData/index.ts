import { createSlice } from '@reduxjs/toolkit';


export type PreferenceForm ={
    [key: string]: {name: string, value: string , audioUrl?:string} | null | boolean;
}

export type PaymentAndUserRegistrationForm = {
    serviceDate:string | null,
    deceasedName:string | null,
    funeralDirectorCompanyName:string | null,
    yourName:string | null,
    email:string | null,
    phoneNumber:string | null,
    relationToDeceased : {name:string,value:string} | null;
}
type  InitialState = {
    preferenceForm:PreferenceForm
    paymentAndUserRegistrationForm:PaymentAndUserRegistrationForm

}


const initialState : InitialState = {
    preferenceForm:{},
    paymentAndUserRegistrationForm:{
        serviceDate: null,
        deceasedName: null,
        funeralDirectorCompanyName: null,
        yourName: null,
        email: null,
        phoneNumber: null,
        relationToDeceased : null,
    }

};

const formsData = createSlice({
  name: 'formsData',
  initialState,
  reducers: {
        setPreferenceForm(state, action) {
            state.preferenceForm = action.payload
        },
        setPaymentAndUserRegistrationForm(state,action){
            state.paymentAndUserRegistrationForm = action.payload 
        }
  },
});

export const {setPreferenceForm,setPaymentAndUserRegistrationForm } = formsData.actions;
export default formsData.reducer;

