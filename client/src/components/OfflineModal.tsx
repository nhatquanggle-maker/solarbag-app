import React, { useState } from 'react';
import { X, CloudCheck, Download, Check, Trash2, RefreshCw } from 'lucide-react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ isOpen, onClose }) => {
  const [packages, setPackages] = useState([
    { id: 'tay-bac', name: 'Tây Bắc (Lào Cai, Yên Bái, Sơn La)', size: '320 MB', ready: true, updateAvailable: false, downloading: false },
    { id: 'bidoup', name: 'Bidoup Núi Bà (Lâm Đồng)', size: '240 MB', ready: true, updateAvailable: true, downloading: false },
    { id: 'ta-xua', name: 'Tà Xùa - Bắc Yên', size: '180 MB', ready: false, updateAvailable: false, downloading: false }
  ]);

  if (!isOpen) return null;

  const handleDownload = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, downloading: true } : p));
    setTimeout(() => {
      setPackages(prev => prev.map(p => p.id === id ? { ...p, downloading: false, ready: true, updateAvailable: false } : p));
    }, 1800);
  };

  const handleDelete = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ready: false, updateAvailable: false } : p));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2E3B32]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#38764B]/20 text-[#4ADE80] rounded-xl">
              <CloudCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bản đồ Ngoại tuyến (Offline)</h3>
              <p className="text-xs text-[#A5B4A8]">Sẵn sàng cho trekking mất sóng 4G</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-[#252F28] text-[#A5B4A8] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Storage Bar */}
        <div className="bg-[#121613] p-3 rounded-2xl border border-[#2E3B32] mb-4">
          <div className="flex justify-between text-xs text-[#A5B4A8] mb-1.5">
            <span>Dung lượng đã lưu</span>
            <span className="font-semibold text-white">640 MB / 2.0 GB</span>
          </div>
          <div className="w-full h-2 bg-[#252F28] rounded-full overflow-hidden">
            <div className="h-full bg-[#38764B] rounded-full" style={{ width: '32%' }}></div>
          </div>
          <p className="text-[10px] text-[#A5B4A8] mt-2">
            2 bản đồ đã sẵn sàng hoạt động độc lập không cần Internet hoặc GPS qua SIM.
          </p>
        </div>

        {/* Package List */}
        <div className="space-y-2.5 mb-5">
          {packages.map(pkg => (
            <div key={pkg.id} className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32]">
              <div>
                <div className="text-xs font-bold text-white">{pkg.name}</div>
                <div className="text-[11px] text-[#A5B4A8] flex items-center gap-2 mt-0.5">
                  <span>{pkg.size}</span>
                  {pkg.ready && (
                    <span className="text-[#4ADE80] flex items-center gap-0.5">
                      <Check size={12} /> Đã tải
                    </span>
                  )}
                  {pkg.updateAvailable && (
                    <span className="text-[#F2B832] flex items-center gap-0.5">
                      <RefreshCw size={10} /> Có bản mới
                    </span>
                  )}
                </div>
              </div>

              <div>
                {pkg.downloading ? (
                  <div className="px-3 py-1 bg-[#252F28] text-[11px] text-white rounded-lg animate-pulse">
                    Đang tải...
                  </div>
                ) : pkg.ready ? (
                  <div className="flex items-center gap-1.5">
                    {pkg.updateAvailable && (
                      <button
                        onClick={() => handleDownload(pkg.id)}
                        title="Cập nhật bản đồ"
                        className="p-1.5 bg-[#F2B832]/20 text-[#F2B832] rounded-lg hover:bg-[#F2B832]/30"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      title="Xóa giải phóng bộ nhớ"
                      className="p-1.5 bg-[#252F28] text-[#A5B4A8] hover:text-[#E04838] rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(pkg.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-semibold rounded-lg"
                  >
                    <Download size={13} /> Tải về
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#252F28] hover:bg-[#2E3B32] text-white text-xs font-semibold rounded-xl"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

