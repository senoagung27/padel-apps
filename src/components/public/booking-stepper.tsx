"use client";

import { Check } from "lucide-react";

interface BookingStepperProps {
  currentStep: number;
  steps: string[];
}

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8" />
        <div
          className="absolute top-5 left-0 h-0.5 gradient-brand mx-8 transition-all duration-500"
          style={{
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 4rem)`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "gradient-brand text-white shadow-lg shadow-brand-500/30"
                    : isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                  isActive
                    ? "text-brand-600"
                    : isCompleted
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
