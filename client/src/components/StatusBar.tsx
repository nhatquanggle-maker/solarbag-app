import React, { useEffect, useState } from 'react';
import { Wifi, Battery } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hrs = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-2 select-none text-white text-xs font-semibold z-50">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* iOS Cellular signal bars */}
        <div className="flex items-end gap-[1.5px] h-3 mr-0.5">
          <div className="w-[3px] h-[3px] bg-white rounded-xs"></div>
          <div className="w-[3px] h-[5px] bg-white rounded-xs"></div>
          <div className="w-[3px] h-[8px] bg-white rounded-xs"></div>
          <div className="w-[3px] h-[11px] bg-white rounded-xs"></div>
        </div>
        {/* Wifi */}
        <Wifi size={13} className="text-white" />
        {/* Battery */}
        <div className="relative flex items-center">
          <Battery size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
};

