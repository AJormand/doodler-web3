import React from "react";
import { loadingSpinner } from "../assets";
import Image from "next/image";

const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-50 bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-white p-10">
        <p>Processing...</p>

        <Image src={loadingSpinner} className="w-16 h-16" alt="loader" />
      </div>
      {/* <img src={loader} className="w-32 h-32" alt="loader" /> */}
    </div>
  );
};

export default LoadingSpinner;
