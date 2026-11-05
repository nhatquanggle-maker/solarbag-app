import React, { useState } from 'react';
import { Sun, Lightbulb, LightbulbOff, X, Zap, Sliders, ChevronRight, ShieldAlert } from 'lucide-react';
import { HardwareState } from '../types';

interface HardwarePillProps {
  hardware: HardwareState;
  onUpdateHardware: (updates: Partial<HardwareState>) => void;
  onNavigateToBagTab: () => void;
}

export const HardwarePill: React.FC<HardwarePillProps> = ({
  hardware,
  onUpdateHardware,
  onNavigateToBagTab
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleLamp = () => {
    const nextState = hardware.lampState === 'ON' ? 'OFF' : 'ON';
    onUpdateHardware({ lampState: nextState });
  };

  return (
    <>
      {/* Top Floating Pill */}
      <div className="w-full px-4 pt-1 pb-2 flex justify-center z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="group flex items-center gap-2.5 bg-[#1B221D] hover:bg-[#252F28] border border-[#2E3B32] px-3.5 py-1.5 rounded-full shadow-md transition-all active:scale-98"
        >
          {/* Status Dot */}
          <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></div>

          {/* Battery */}
          <span className="text-[12px] font-semibold text-white">
            {hardware.deviceName}: {hardware.batteryLevel}%
          </span>

          <span className="text-[#2E3B32]">|</span>

          {/* Solar Watts */}
          <div className="flex items-center gap-1 text-[#F2B832] text-[11px] font-medium">
            <Sun size={12} className="animate-spin-slow" />
            <span>+{hardware.topPillWatts}W</span>
          </div>

          <span className="text-[#2E3B32]">|</span>

          {/* Lamp Status */}
          <div className="flex items-center gap-1 text-[11px]">
            {hardware.lampState === 'ON' ? (
              <>
                <Lightbulb size={12} className="text-[#F2B832]" />
                <span className="text-[#F2B832] font-semibold">Bật {hardware.brightness}%</span>
              </>
            ) : (
              <>
                <LightbulbOff size={12} className="text-[#A5B4A8]" />
                <span className="text-[#A5B4A8]">Tắt</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Quick IoT Bottom Sheet Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div
            className="w-full max-w-[420px] bg-[#1B221D] border-t border-[#2E3B32] rounded-t-3xl p-5 shadow-2xl transition-transform animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="w-10 h-1 bg-[#2E3B32] rounded-full mx-auto mb-4"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-wider font-bold text-[#38764B] uppercase">
                  Điều khiển nhanh phần cứng
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{hardware.deviceName}</span>
                  <span className="text-xs font-normal text-[#A5B4A8]">({hardware.edition})</span>
                </h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full bg-[#252F28] text-[#A5B4A8] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#121613] p-3 rounded-xl border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] mb-1">Dung lượng pin</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{hardware.batteryLevel}%</span>
                  <span className="text-[11px] text-[#4ADE80] font-medium">{hardware.chargingState}</span>
                </div>
                <div className="w-full bg-[#252F28] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#4ADE80] h-full rounded-full transition-all duration-500"
                    style={{ width: `${hardware.batteryLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#121613] p-3 rounded-xl border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] mb-1">Công suất sạc nắng</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#F2B832]">+{hardware.solarInputWatts}W</span>
                </div>
                <div className="text-[10px] text-[#A5B4A8] mt-1">Đã thu: {hardware.dailyWhHarvested}Wh hôm nay</div>
              </div>
            </div>

            {/* Remote Lamp Fast Controls */}
            <div className="bg-[#121613] p-4 rounded-xl border border-[#2E3B32] mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${hardware.lampState === 'ON' ? 'bg-[#F2B832]/20 text-[#F2B832]' : 'bg-[#252F28] text-[#A5B4A8]'}`}>
                    {hardware.lampState === 'ON' ? <Lightbulb size={18} /> : <LightbulbOff size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Đèn dã ngoại balo</div>
                    <div className="text-xs text-[#A5B4A8]">Điều khiển từ xa qua BLE</div>
                  </div>
                </div>

                <button
                  onClick={toggleLamp}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    hardware.lampState === 'ON'
                      ? 'bg-[#F2B832] text-black shadow-lg shadow-[#F2B832]/20'
                      : 'bg-[#252F28] text-white hover:bg-[#2E3B32]'
                  }`}
                >
                  {hardware.lampState === 'ON' ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              {/* Brightness slider */}
              <div className="pt-2 border-t border-[#2E3B32]/60">
                <div className="flex justify-between text-xs text-[#A5B4A8] mb-1.5">
                  <span>Độ sáng đèn</span>
                  <span className="font-mono text-white">{hardware.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={hardware.brightness}
                  disabled={hardware.lampState === 'OFF'}
                  onChange={(e) => onUpdateHardware({ brightness: Number(e.target.value) })}
                  className="w-full accent-[#F2B832] cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onNavigateToBagTab();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all"
              >
                <span>Xem chi tiết phần cứng (Balo Tôi)</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

