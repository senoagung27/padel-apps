"use client";

import { formatTime } from "@/lib/utils";

export interface SlotData {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isActive: boolean;
}

interface TimeSlotGridProps {
  slots: SlotData[];
  selectedSlots: string[];
  onToggleSlot: (startTime: string) => void;
}

export function TimeSlotGrid({
  slots,
  selectedSlots,
  onToggleSlot,
}: TimeSlotGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-100 border border-brand-300" />
          <span>Tersedia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span>Terisi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-500" />
          <span>Dipilih</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          <span>Tidak Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.startTime);
          const isDisabled = !slot.isActive || !slot.isAvailable;

          let className =
            "relative flex flex-col items-center justify-center py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none";

          if (isSelected) {
            className +=
              " bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-[1.02]";
          } else if (!slot.isActive) {
            className +=
              " bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed";
          } else if (!slot.isAvailable) {
            className +=
              " bg-red-50 text-red-400 border border-red-200 cursor-not-allowed";
          } else {
            className +=
              " bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:border-brand-300 hover:shadow-sm";
          }

          return (
            <button
              key={slot.startTime}
              type="button"
              className={className}
              disabled={isDisabled}
              onClick={() => onToggleSlot(slot.startTime)}
            >
              <span className="text-xs opacity-70">
                {formatTime(slot.startTime)}
              </span>
              <span className="text-xs opacity-70">
                {formatTime(slot.endTime)}
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-brand-500 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
