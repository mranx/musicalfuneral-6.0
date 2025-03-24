"use client";

import MoveBackButton from "@/_mycomponents/common/MoveBackButton";
import SelectedDataShower from "@/_mycomponents/details/SelectedDataShower";
import { PaymentForm } from "@/_mycomponents/forms/PaymentForm";

const MakePaymentPage = () => {
  const handlePrevious = () => {
    // Handle previous action
  };

  const handlePayment = () => {
    // Handle payment submission
  };

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="max-w-2xl-container mx-auto ">
        <div className="flex items-center gap-3 flex-wrap mb-7">
          <MoveBackButton />
          <h1 className="text-[32px] font-bold ">Make Payment</h1>
        </div>
        <div className="grid grid-cols-1 items-start  lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#191D31]  md:p-[32px] p-6  rounded-xl shadow max-lg:order-2">
            <div className="mb-4">
              <h3 className="font-bold  text-2xl">Complete Checkout:</h3>
            </div>
            <div className="flex gap-2 mb-5">
              <div className="w-16 aspect-video bg-gray-200 dark:bg-gray-700 rounded "></div>
              <div className="w-16 aspect-video bg-gray-200 dark:bg-gray-700 rounded "></div>
              <div className="w-16 aspect-video bg-gray-200 dark:bg-gray-700 rounded "></div>
            </div>
            <div>
              <PaymentForm onPrevious={handlePrevious} onPayment={handlePayment} />
            </div>
          </div>
          <SelectedDataShower />
        </div>
      </div>
    </div>
  );
};

export default MakePaymentPage;
