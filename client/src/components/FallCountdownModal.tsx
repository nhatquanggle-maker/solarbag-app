import React, { useEffect, useState } from 'react';
import { ShieldAlert, XCircle, AlertOctagon } from 'lucide-react';
import { startSirenSound, stopSirenSound } from '../utils/audio';

interface FallCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
}

export const FallCountdownModal: React.FC<FallCountdownModalProps> = ({ isOpen, onClose, onTriggerSOS }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!isOpen) {
      stopSirenSound();
      setSeconds(60);
      return;
    }

    startSirenSound();

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          stopSirenSound();
          onTriggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopSirenSound();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#1B221D] border-2 border-[#E04838] rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(224,72,56,0.4)] animate-in zoom-in-95">
        <div className="flex items-center justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#E04838]/20 animate-ping absolute"></div>
            <div className="w-20 h-20 rounded-full bg-[#E04838] text-white flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black">{seconds}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">
          Cảnh Báo Phát Hiện Té Ngã!
        </h3>
        <p className="text-xs text-[#E04838] font-bold mb-3 flex items-center justify-center gap-1">
          <AlertOctagon size={14} /> CÒI BÁO ĐỘNG ĐANG HÚ
        </p>

        <p className="text-xs text-[#A5B4A8] leading-relaxed mb-6">
          Nếu bạn vẫn an toàn, hãy nhấn nút bên dưới trong vòng <span className="text-white font-bold">{seconds}s</span> để hủy. Hết thời gian, tọa độ GPS sẽ tự động gửi tới người bảo hộ khẩn cấp qua SMS & Zalo.
        </p>

        <button
          onClick={() => {
            stopSirenSound();
            onClose();
          }}
          className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
        >
          <XCircle size={18} />
          <span>TÔI VẪN ỔN · HỦY CẢNH BÁO</span>
        </button>
      </div>
    </div>
  );
};

