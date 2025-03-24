import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 | Not Found",
};

const notfound = () => {
  return (
    <div className="min-h-[70vh] flex justify-center items-center">
      <h5 className="text-2xl font-semibold text-[#881717]">
        <span className="pe-4 border-r-2 border-gray-500">404</span>
        <span className="ps-4">Page Not Found</span>
      </h5>
    </div>
  );
};

export default notfound;
