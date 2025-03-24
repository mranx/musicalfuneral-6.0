"use client";
import usePaymentAndRegistrationForm from "@/hooks/forms/usePaymentAndRegistrationForm";
import { usePreferenceForm } from "@/hooks/forms/usePreferenceForm";
import { useEffect, useState } from "react";

const SelectedDataShower = () => {
  const { preferenceForm } = usePreferenceForm();
  const { paymentAndUserRegistrationForm } = usePaymentAndRegistrationForm();

  const [serviceDetailsArray, setServiceDetailsArray] = useState<
    { heading: string; subHeading: string }[]
  >([]);

  useEffect(() => {
    const newServiceDetailsArray = [];

    for (const key in preferenceForm) {
      if (Object.prototype.hasOwnProperty.call(preferenceForm, key)) {
        console.log(key);
        const element = preferenceForm[key];
        if (element && typeof element !== "boolean") {
          newServiceDetailsArray.push({
            heading: key[0].toUpperCase() + key.slice(1, -1),
            subHeading: element.name,
          });
        }
      }
    }

    // Update the state with the new array
    setServiceDetailsArray(newServiceDetailsArray);
  }, [preferenceForm]);

  const personalDetailsArray = [
    {
      heading: "Service Date",
      subHeading: paymentAndUserRegistrationForm.serviceDate,
    },
    {
      heading: "Deceased Name",
      subHeading: paymentAndUserRegistrationForm.deceasedName,
    },
    {
      heading: "Funeral Director Company Name",
      subHeading: paymentAndUserRegistrationForm.funeralDirectorCompanyName,
    },
    {
      heading: "Email Adress",
      subHeading: paymentAndUserRegistrationForm.email,
    },
    {
      heading: "Phone No.",
      subHeading: paymentAndUserRegistrationForm.phoneNumber,
    },
    {
      heading: "Relationship to the Deceased",
      subHeading: paymentAndUserRegistrationForm.relationToDeceased?.name,
    },
  ];
  return (
    <div className="  p-6 sm:p-8 border-2 border-[#3F72AF] max-lg:order-1  rounded-xl">
      {/* ------ service details ------ */}
      <div className="mb-5">
        <h3 className="text-lg font-bold mb-3">Service Details</h3>
        <div>
          {serviceDetailsArray.map((service, index) => (
            <div className="items-center flex justify-between mb-2" key={index}>
              <h5 className="font-semibold text-xs sm:text-sm">
                {service.heading}
              </h5>
              <h6 className="text-gray-500  text-xs sm:text-sm">
                {service.subHeading}
              </h6>
            </div>
          ))}
        </div>
      </div>
      {/* -------- personal details --------- */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Personal Details</h3>
        <div>
          {personalDetailsArray.map((service, index) => (
            <div className="items-center flex justify-between mb-2" key={index}>
              <h5 className="font-bold text-xs sm:text-sm">
                {service.heading}
              </h5>
              <h6 className="text-gray-500 text-xs sm:text-sm">
                {service.subHeading}
              </h6>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedDataShower;
