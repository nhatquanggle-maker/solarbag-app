import React, { useState } from 'react';
import { X, Backpack, CheckSquare, Square, Plus, Scale } from 'lucide-react';

interface GearItem {
  id: string;
  name: string;
  category: string;
  weightKg: number;
  packed: boolean;
}

interface GearChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GearChecklistModal: React.FC<GearChecklistModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<GearItem[]>([
    { id: '1', category: 'Shelter & sleep', name: 'Lều siêu nhẹ 2 người', weightKg: 1.4, packed: true },
    { id: '2', category: 'Shelter & sleep', name: 'Túi ngủ lông vũ 5°C', weightKg: 0.8, packed: true },
    { id: '3', category: 'Shelter & sleep', name: 'Đệm hơi cách nhiệt R4', weightKg: 0.6, packed: true },
    { id: '4', category: 'Clothing & pack', name: 'Balo SolarBag Pro 30L', weightKg: 1.2, packed: true },
    { id: '5', category: 'Clothing & pack', name: 'Áo khoác chống thấm Gore-Tex', weightKg: 0.5, packed: true },
    { id: '6', category: 'Clothing & pack', name: 'Bộ quần áo khô dự phòng', weightKg: 0.7, packed: true },
    { id: '7', category: 'Tools & essentials', name: 'Bình lọc nước vi sợi Katadyn', weightKg: 0.3, packed: true },
    { id: '8', category: 'Tools & essentials', name: 'Bộ sơ cứu y tế cá nhân', weightKg: 0.4, packed: true },
    { id: '9', category: 'Tools & essentials', name: 'Bếp gas mini & nồi titan', weightKg: 0.5, packed: true },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('0.3');
  const [newItemCat, setNewItemCat] = useState('Tools & essentials');

  if (!isOpen) return null;

  const togglePacked = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: GearItem = {
      id: `gear-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCat,
      weightKg: parseFloat(newItemWeight) || 0.2,
      packed: true
    };
    setItems([...items, newItem]);
    setNewItemName('');
  };

  // Group items by category and compute weights
  const categories = ['Shelter & sleep', 'Clothing & pack', 'Tools & essentials'];
  const totalWeight = items.filter(i => i.packed).reduce((sum, i) => sum + i.weightKg, 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] bg-[#1B221D] border border-[#2E3B32] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#2E3B32] flex items-center justify-between bg-[#121613]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#38764B]/20 text-[#4ADE80] rounded-xl">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kiểm tra trọng lượng đồ (LighterPack)</h3>
              <p className="text-[11px] text-[#A5B4A8]">Tối ưu tải trọng balo cho chuyến đi nhẹ êm</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-[#252F28] text-[#A5B4A8] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Total Weight Card */}
        <div className="p-4 bg-[#1B221D] border-b border-[#2E3B32]">
          <div className="flex items-center justify-between p-3.5 bg-[#121613] rounded-2xl border border-[#2E3B32]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F2B832]/20 text-[#F2B832]">
                <Backpack size={22} />
              </div>
              <div>
                <div className="text-[11px] text-[#A5B4A8]">Tổng cân nặng cơ bản (Base weight)</div>
                <div className="text-2xl font-black text-white">{totalWeight.toFixed(1)} kg</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                totalWeight <= 7.0 ? 'bg-[#38764B]/30 text-[#4ADE80]' : 'bg-[#E04838]/20 text-[#E04838]'
              }`}>
                {totalWeight <= 7.0 ? 'Tối ưu (Ultralight)' : 'Hơi nặng'}
              </span>
              <div className="text-[10px] text-[#A5B4A8] mt-1">{items.filter(i => i.packed).length}/{items.length} món đã chọn</div>
            </div>
          </div>
        </div>

        {/* Scrollable Items by Category */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            const catWeight = catItems.filter(i => i.packed).reduce((s, i) => s + i.weightKg, 0);

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="font-bold text-white">{cat}</span>
                  <span className="font-mono text-[#F2B832] font-semibold">{catWeight.toFixed(1)} kg</span>
                </div>

                <div className="space-y-1">
                  {catItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => togglePacked(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                        item.packed
                          ? 'bg-[#121613] border-[#2E3B32] text-white'
                          : 'bg-[#121613]/40 border-transparent text-[#A5B4A8] opacity-60 line-through'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.packed ? (
                          <CheckSquare size={16} className="text-[#4ADE80]" />
                        ) : (
                          <Square size={16} className="text-[#A5B4A8]" />
                        )}
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#A5B4A8]">{item.weightKg} kg</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add item form */}
          <form onSubmit={handleAddItem} className="pt-2 border-t border-[#2E3B32] space-y-2">
            <div className="text-xs font-semibold text-[#A5B4A8]">Thêm vật dụng mới:</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên đồ dùng..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="flex-1 bg-[#121613] border border-[#2E3B32] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#A5B4A8]"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Kg"
                value={newItemWeight}
                onChange={e => setNewItemWeight(e.target.value)}
                className="w-16 bg-[#121613] border border-[#2E3B32] rounded-xl px-2 py-1.5 text-xs text-white text-center"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Thêm
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121613] border-t border-[#2E3B32]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#38764B] text-white text-xs font-bold rounded-xl shadow-lg"
          >
            Lưu danh sách đồ ({totalWeight.toFixed(1)} kg)
          </button>
        </div>
      </div>
    </div>
  );
};

