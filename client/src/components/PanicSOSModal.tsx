import React, { useEffect } from 'react';
import { AlertTriangle, PhoneCall, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { startSirenSound, stopSirenSound } from '../utils/audio';

interface PanicSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number };
}

export const PanicSOSModal: React.FC<PanicSOSModalProps> = ({ isOpen, onClose, coordinates }) => {
  useEffect(() => {
    if (isOpen) {
      startSirenSound();
    } else {
      stopSirenSound();
    }
    return () => stopSirenSound();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#E04838]/95 backdrop-blur-md animate-in fade-in select-none text-white">
      <div className="w-full max-w-sm bg-[#121613] border-2 border-white rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-[#E04838] flex items-center justify-center mx-auto mb-4 animate-bounce">
          <AlertTriangle size={36} className="text-white" />
        </div>

        <div className="text-[10px] tracking-widest font-black text-[#E04838] uppercase mb-1">
          TRAIL GUARDIAN EMERGENCY BEACON
        </div>
        <h2 className="text-2xl font-black text-white mb-2">ĐÃ PHÁT TÍN HIỆU SOS!</h2>

        <div className="bg-[#1B221D] p-3 rounded-2xl border border-[#2E3B32] mb-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#4ADE80]">
            <CheckCircle size={15} />
            <span className="font-bold">Đã gửi tin nhắn SMS & Web Link khẩn cấp</span>
          </div>
          <div className="text-[11px] text-[#A5B4A8]">
            Đã chuyển tiếp tới: <span className="text-white font-semibold">Lan (Chị gái - +84 912 345 678)</span>
          </div>

          <div className="pt-2 border-t border-[#2E3B32] flex items-center justify-between text-xs font-mono">
            <span className="text-[#A5B4A8] flex items-center gap-1">
              <MapPin size={13} className="text-[#E04838]" /> Tọa độ GPS:
            </span>
            <span className="text-white font-bold">{coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E</span>
          </div>
        </div>

        <p className="text-[11px] text-[#A5B4A8] mb-6">
          Đèn dã ngoại của balo đang chớp mã SOS nhấp nháy liên tục để đội cứu hộ nhận diện trong bóng tối.
        </p>

        <button
          onClick={() => {
            stopSirenSound();
            onClose();
          }}
          className="w-full py-3.5 bg-[#38764B] hover:bg-[#438a58] text-white font-bold text-sm rounded-2xl shadow-xl transition-all"
        >
          TÔI ĐÃ AN TOÀN · TẮT CÒI SOS
        </button>
      </div>
    </div>
  );
};

