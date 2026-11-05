import React, { useState } from 'react';
import { Settings2, Bluetooth, Rotate3d, Sun, Sparkles, Lightbulb, LightbulbOff, Flashlight, Volume2, Navigation, ArrowUpRight, Nfc, Wrench, Recycle, ChevronRight, Check } from 'lucide-react';
import { HardwareState } from '../../types';
import { playChimeSound } from '../../utils/audio';

interface MyBagTabProps {
  hardware: HardwareState;
  onUpdateHardware: (updates: Partial<HardwareState>) => void;
}

export const MyBagTab: React.FC<MyBagTabProps> = ({ hardware, onUpdateHardware }) => {
  const [strobeActive, setStrobeActive] = useState(false);
  const [chimePlaying, setChimePlaying] = useState(false);
  const [is3dRotated, setIs3dRotated] = useState(false);
  const [passportModal, setPassportModal] = useState<string | null>(null);

  const toggleLamp = () => {
    const nextState = hardware.lampState === 'ON' ? 'OFF' : 'ON';
    onUpdateHardware({ lampState: nextState });
  };

  const handleSoundChime = () => {
    setChimePlaying(true);
    playChimeSound();
    fetch('/api/locator/chime', { method: 'POST' }).catch(() => {});
    setTimeout(() => setChimePlaying(false), 2000);
  };

  const handleSosFlash = () => {
    setStrobeActive(true);
    let count = 0;
    const interval = setInterval(() => {
      onUpdateHardware({
        lampState: count % 2 === 0 ? 'ON' : 'OFF',
        sosFlashActive: true
      });
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setStrobeActive(false);
        onUpdateHardware({ lampState: 'OFF', sosFlashActive: false });
      }
    }, 200);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
      {/* Screen Heading */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase">
            CONNECTED EQUIPMENT
          </div>
          <h1 className="text-2xl font-black text-white mt-0.5">{hardware.deviceName}</h1>
        </div>
        <button
          onClick={() => alert('Cài đặt phần cứng: Đổi tên Bluetooth, cập nhật firmware OTA v2.4, hiệu chuẩn cảm biến')}
          className="p-2.5 rounded-xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {/* Product Hero 3D Card */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
        {/* Connection status header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#38764B]/20 border border-[#38764B] text-[#4ADE80] text-xs font-bold">
            <Bluetooth size={14} />
            <span>BLE connected</span>
          </div>
          <span className="text-[10px] tracking-wider font-bold text-[#A5B4A8] uppercase">
            {hardware.edition}
          </span>
        </div>

        {/* 3D Product Image from Figma */}
        <div className="relative flex items-center justify-center py-2">
          <div
            className={`w-52 h-52 relative transition-transform duration-700 ease-out cursor-pointer ${
              is3dRotated ? 'rotate-y-180 scale-105' : 'hover:scale-102'
            }`}
            onClick={() => setIs3dRotated(!is3dRotated)}
          >
            <img
              src="/assets/a1d5c0cef8048f2349fea106903686a014510b5d.png"
              alt="SolarBag Pro Product Render"
              className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>

        {/* Hero Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2E3B32]/70 text-xs">
          <span className="font-mono text-[11px] text-[#A5B4A8] uppercase tracking-wider">
            SOLAR-READY HARDWARE
          </span>
          <button
            onClick={() => setIs3dRotated(!is3dRotated)}
            className="flex items-center gap-1.5 text-[#4ADE80] hover:text-white font-semibold text-xs"
          >
            <Rotate3d size={15} />
            <span>Xoay 3D</span>
          </button>
        </div>
      </div>

      {/* Battery and Solar Health */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          {/* Circular Battery Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#252F28"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#4ADE80"
                strokeWidth="10"
                strokeDasharray={`${(hardware.batteryLevel / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{hardware.batteryLevel}%</span>
              <span className="text-[9px] font-bold tracking-wider text-[#4ADE80] uppercase">
                {hardware.chargingState}
              </span>
            </div>
          </div>

          {/* Solar Telemetry */}
          <div className="flex-1 pl-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] tracking-wider font-bold text-[#F2B832] uppercase">
              <Sun size={13} className="animate-spin-slow" />
              <span>LATEST INPUT</span>
            </div>
            <div className="text-3xl font-black text-[#F2B832]">+{hardware.solarInputWatts} W</div>
            <p className="text-[10px] text-[#A5B4A8] leading-tight">
              Top pill: +{hardware.topPillWatts}W at last sync. Illustrative readings.
            </p>
          </div>
        </div>

        {/* Smart Charging Tip */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#121613] border border-[#2E3B32] text-xs">
          <div className="p-1.5 rounded-lg bg-[#F2B832]/20 text-[#F2B832] shrink-0">
            <Sparkles size={16} />
          </div>
          <p className="text-[#A5B4A8] text-[11px] leading-relaxed">
            <span className="text-white font-semibold">Gợi ý nắng: </span>
            Face the panel toward sunlight for the next 30 min.
          </p>
        </div>
      </div>

      {/* Remote Light Controls */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all ${
              hardware.lampState === 'ON'
                ? 'bg-[#F2B832]/20 border-[#F2B832] text-[#F2B832]'
                : 'bg-[#252F28] border-[#2E3B32] text-[#A5B4A8]'
            }`}>
              {hardware.lampState === 'ON' ? <Lightbulb size={20} /> : <LightbulbOff size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Backpack light</h3>
              <p className="text-xs text-[#A5B4A8]">{hardware.lampState} · Bluetooth remote</p>
            </div>
          </div>

          <button
            onClick={toggleLamp}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
              hardware.lampState === 'ON' ? 'bg-[#F2B832]' : 'bg-[#252F28]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                hardware.lampState === 'ON' ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Brightness Slider */}
        <div className="pt-2 border-t border-[#2E3B32]/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A5B4A8]">Brightness · saved</span>
            <span className="font-mono text-white font-bold">{hardware.brightness}%</span>
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

          <div className="flex justify-between text-[10px] text-[#A5B4A8] font-mono">
            <span>10%</span>
            <span className="text-[10px] text-amber-500/80 font-sans italic">
              {hardware.lampState === 'OFF' ? 'Turn on light to adjust' : 'Đang bật'}
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* SOS Flash Light Beacon */}
        <button
          onClick={handleSosFlash}
          disabled={strobeActive}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
            strobeActive
              ? 'bg-[#E04838] text-white animate-pulse border-white'
              : 'bg-[#252F28] hover:bg-[#2E3B32] border-[#2E3B32] text-white'
          }`}
        >
          <Flashlight size={15} />
          <span>{strobeActive ? 'ĐANG CHỚP ĐÈN SOS LIÊN TỤC...' : 'SOS flash · light beacon only'}</span>
        </button>
        <p className="text-[10px] text-[#A5B4A8] italic text-center">
          Flashes the lamp. This does not send a Guardian SOS alert.
        </p>
      </div>

      {/* Bag Locator (AirTag / Find My Bag Style) */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Find your bag</h2>
          <span className="text-xs font-semibold text-[#4ADE80]">BLE nearby</span>
        </div>

        {/* Range Card */}
        <div className="p-3.5 bg-[#121613] rounded-2xl border border-[#2E3B32] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#38764B]/20 text-[#4ADE80]">
              <ArrowUpRight size={22} className="rotate-45" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{hardware.bleDistanceMeters} m away</div>
              <div className="text-xs text-[#A5B4A8]">Near Bidoup · Hướng Đông Bắc</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#A5B4A8]">BLE estimate · last seen just now</span>
        </div>

        {/* Locator Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleSoundChime}
            className={`py-3 px-3 rounded-xl border border-[#2E3B32] text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              chimePlaying
                ? 'bg-[#F2B832] text-black shadow-lg shadow-[#F2B832]/30 animate-pulse'
                : 'bg-[#252F28] hover:bg-[#2E3B32] text-white'
            }`}
          >
            <Volume2 size={16} />
            <span>{chimePlaying ? 'Đang phát bíp...' : 'Sound chime'}</span>
          </button>

          <button
            onClick={() => alert(`Balo đang cách bạn ${hardware.bleDistanceMeters}m hướng ${hardware.bleDirection}`)}
            className="py-3 px-3 rounded-xl bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Navigation size={16} />
            <span>Find bag</span>
          </button>
        </div>

        <p className="text-[10px] text-[#A5B4A8] leading-relaxed">
          Nearby guidance uses the bag’s BLE signal. Range and direction are illustrative, not precision location.
        </p>
      </div>

      {/* Product Passport & Care */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Product passport</h2>
            <p className="text-[10px] font-mono text-[#A5B4A8]">{hardware.serial} · Sample serial</p>
          </div>
          <span className="text-xs font-semibold text-[#4ADE80] cursor-pointer hover:underline">
            View ↗
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          {/* NFC Warranty */}
          <div
            onClick={() => setPassportModal('nfc')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#38764B] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#252F28] text-[#4ADE80]">
                <Nfc size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">NFC warranty & activation</div>
                <div className="text-[11px] text-[#A5B4A8]">Tap your bag to view its passport</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A5B4A8]" />
          </div>

          {/* Repair & Care */}
          <div
            onClick={() => setPassportModal('repair')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#38764B] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#252F28] text-[#F2B832]">
                <Wrench size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Repair & care</div>
                <div className="text-[11px] text-[#A5B4A8]">Keep your equipment on the trail</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A5B4A8]" />
          </div>

          {/* Take-back program */}
          <div
            onClick={() => setPassportModal('recycle')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#38764B] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#252F28] text-[#34D399]">
                <Recycle size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Take-back program</div>
                <div className="text-[11px] text-[#A5B4A8]">Return, repair or responsibly recycle</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A5B4A8]" />
          </div>
        </div>
      </div>

      {/* Passport Details Modal */}
      {passportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white">
              {passportModal === 'nfc' ? 'Bảo Hành Điện Tử NFC' : passportModal === 'repair' ? 'Dịch Vụ Sửa Chữa Balo' : 'Chương Trình Thu Hồi & Tái Chế'}
            </h3>
            <p className="text-xs text-[#A5B4A8] leading-relaxed">
              {passportModal === 'nfc'
                ? 'Balo SolarBag Pro của bạn đã kích hoạt bảo hành điện tử chính hãng đến tháng 11/2028. Cảm biến NFC được tích hợp tại quai đeo bên phải.'
                : passportModal === 'repair'
                ? 'Đội ngũ kỹ thuật hỗ trợ thay thế cell pin mặt trời, dây kéo chống nước và bo mạch điều khiển BLE trong vòng 48 giờ.'
                : 'Đăng ký gửi lại balo cũ để được hoàn tiền 20% khi nâng cấp phiên bản mới. Balo cũ sau kiểm định sẽ được tái tạo trao tặng học sinh vùng cao.'}
            </p>
            <button
              onClick={() => setPassportModal(null)}
              className="w-full py-2.5 bg-[#38764B] text-white text-xs font-bold rounded-xl"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

