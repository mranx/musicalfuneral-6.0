import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CircleCheck, DownloadIcon } from "lucide-react";
// types
type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
const PaymentCompleteDialog = ({ open, setOpen }: Props) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col items-center text-center max-w-[408px] rounded-xl p-8 dark:bg-[#191C30]">
        <CircleCheck size={55} color="#039E1C" />
        <DialogTitle className="text-[32px] font-bold">
          Checkout completed successfully!
        </DialogTitle>

        <Button className="flex items-center gap-2 font-semibold bg-[#3F72AF] text-white hover:bg-[#163a66] py-2.5 px-10 rounded-full">
          <span className="tracking-wider">Download Invoice</span>
          <DownloadIcon size={24} />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCompleteDialog;
