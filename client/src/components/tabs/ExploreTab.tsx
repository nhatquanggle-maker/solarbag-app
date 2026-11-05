import React, { useState } from 'react';
import { SlidersHorizontal, Search, Download, ChevronDown, Star, Bookmark, Footprints, AlertTriangle, MountainSnow, CloudCheck, X, Check, RotateCcw, Droplets, Tent, MapPin } from 'lucide-react';
import { LeafletMap } from '../LeafletMap';
import { Trail } from '../../types';

interface ExploreTabProps {
  trails: Trail[];
  onSelectTrail: (trail: Trail) => void;
  onOpenOfflineManager: () => void;
  onStartTrackingTrail: (trail: Trail) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  trails,
  onSelectTrail,
  onOpenOfflineManager,
  onStartTrackingTrail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('All');
  const [waterFilter, setWaterFilter] = useState(false);
  const [lengthFilter, setLengthFilter] = useState<'all' | 'short' | 'long'>('all');
  const [elevationFilter, setElevationFilter] = useState<'all' | 'low' | 'high'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | 'lamdong' | 'taybac'>('all');
  
  // Dropdown open states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['bidoup-summit']);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const resetAllFilters = () => {
    setActiveDifficulty('All');
    setWaterFilter(false);
    setLengthFilter('all');
    setElevationFilter('all');
    setRegionFilter('all');
    setActiveDropdown(null);
  };

  const isAnyFilterActive = activeDifficulty !== 'All' || waterFilter || lengthFilter !== 'all' || elevationFilter !== 'all' || regionFilter !== 'all';

  const filteredTrails = trails.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = activeDifficulty === 'All' || t.difficulty.toLowerCase() === activeDifficulty.toLowerCase();
    const matchesWater = !waterFilter || t.waypoints.some(w => w.type === 'water');

    // Length filter
    const numLength = parseFloat(t.length) || 0;
    let matchesLength = true;
    if (lengthFilter === 'short') matchesLength = numLength < 15;
    if (lengthFilter === 'long') matchesLength = numLength >= 15;

    // Elevation filter
    const numElev = parseInt(t.elevationGain.replace(/[^0-9]/g, '')) || 0;
    let matchesElev = true;
    if (elevationFilter === 'low') matchesElev = numElev < 800;
    if (elevationFilter === 'high') matchesElev = numElev >= 800;

    // Region / Near me filter
    let matchesRegion = true;
    if (regionFilter === 'lamdong') matchesRegion = t.region.toLowerCase().includes('lâm đồng');
    if (regionFilter === 'taybac') matchesRegion = t.region.toLowerCase().includes('tây bắc') || t.region.toLowerCase().includes('lào cai') || t.region.toLowerCase().includes('sơn la');

    return matchesSearch && matchesDiff && matchesWater && matchesLength && matchesElev && matchesRegion;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
      {/* Screen Heading */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase">
            SOLARBAG / TRAIL EXPLORER
          </div>
          <h1 className="text-2xl font-black text-white mt-0.5">Find your outside.</h1>
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`p-2.5 rounded-xl border border-[#2E3B32] transition-all relative ${
            isAnyFilterActive ? 'bg-[#38764B] text-white' : 'bg-[#1B221D] text-[#A5B4A8] hover:text-white'
          }`}
          title="Mở toàn bộ bộ lọc AllTrails"
        >
          <SlidersHorizontal size={18} />
          {isAnyFilterActive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F2B832] ring-2 ring-[#121613]"></span>
          )}
        </button>
      </div>

      {/* Search and Offline Access */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2.5 bg-[#1B221D] border border-[#2E3B32] px-3.5 py-2.5 rounded-2xl">
          <Search size={16} className="text-[#A5B4A8]" />
          <input
            type="text"
            placeholder="Find a peak, trail or forest…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-[#A5B4A8] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#A5B4A8] hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenOfflineManager}
          title="Tải bản đồ offline"
          className="p-3 rounded-2xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white transition-all active:scale-95"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Trail Filters Horizontal Chips */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* 1. Difficulty Chip */}
          <div className="relative shrink-0">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'difficulty' ? null : 'difficulty')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                activeDifficulty !== 'All'
                  ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-md'
                  : 'bg-[#1B221D] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
              }`}
            >
              <span>{activeDifficulty === 'All' ? 'Difficulty' : `Độ khó: ${activeDifficulty}`}</span>
              <ChevronDown size={13} className={activeDropdown === 'difficulty' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {activeDropdown === 'difficulty' && (
              <div className="absolute left-0 top-9 w-36 bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 text-xs animate-in fade-in">
                {['All', 'Easy', 'Moderate', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setActiveDifficulty(diff);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                      activeDifficulty === diff ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                    }`}
                  >
                    <span>{diff === 'All' ? 'Tất cả độ khó' : diff}</span>
                    {activeDifficulty === diff && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Water Source Chip (Toggle) */}
          <button
            onClick={() => setWaterFilter(!waterFilter)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
              waterFilter
                ? 'bg-[#2563EB] border-blue-400 text-white shadow-md'
                : 'bg-[#1B221D] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
            }`}
          >
            <span>💧 Gần nguồn nước</span>
            {waterFilter && <Check size={12} />}
          </button>

          {/* 3. Length Chip */}
          <div className="relative shrink-0">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'length' ? null : 'length')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                lengthFilter !== 'all'
                  ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-md'
                  : 'bg-[#1B221D] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
              }`}
            >
              <span>{lengthFilter === 'all' ? 'Length' : lengthFilter === 'short' ? 'Cự ly: <15km' : 'Cự ly: ≥15km'}</span>
              <ChevronDown size={13} className={activeDropdown === 'length' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {activeDropdown === 'length' && (
              <div className="absolute left-0 top-9 w-40 bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 text-xs animate-in fade-in">
                <button
                  onClick={() => { setLengthFilter('all'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    lengthFilter === 'all' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Tất cả cự ly</span>
                  {lengthFilter === 'all' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setLengthFilter('short'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    lengthFilter === 'short' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Dưới 15 km (Ngắn)</span>
                  {lengthFilter === 'short' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setLengthFilter('long'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    lengthFilter === 'long' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Từ 15 km trở lên</span>
                  {lengthFilter === 'long' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* 4. Elevation Chip */}
          <div className="relative shrink-0">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'elevation' ? null : 'elevation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                elevationFilter !== 'all'
                  ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-md'
                  : 'bg-[#1B221D] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
              }`}
            >
              <span>{elevationFilter === 'all' ? 'Elevation' : elevationFilter === 'low' ? 'Độ cao: <800m' : 'Độ cao: ≥800m'}</span>
              <ChevronDown size={13} className={activeDropdown === 'elevation' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {activeDropdown === 'elevation' && (
              <div className="absolute left-0 top-9 w-44 bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 text-xs animate-in fade-in">
                <button
                  onClick={() => { setElevationFilter('all'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    elevationFilter === 'all' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Tất cả độ dốc</span>
                  {elevationFilter === 'all' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setElevationFilter('low'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    elevationFilter === 'low' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Thấp (Dưới 800m)</span>
                  {elevationFilter === 'low' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setElevationFilter('high'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    elevationFilter === 'high' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Đỉnh dốc cao (≥800m)</span>
                  {elevationFilter === 'high' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* 5. Near me / Region Chip */}
          <div className="relative shrink-0">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'nearme' ? null : 'nearme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                regionFilter !== 'all'
                  ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-md'
                  : 'bg-[#1B221D] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
              }`}
            >
              <span>{regionFilter === 'all' ? 'Near me' : regionFilter === 'lamdong' ? 'Gần tôi: Lâm Đồng' : 'Khu vực: Tây Bắc'}</span>
              <ChevronDown size={13} className={activeDropdown === 'nearme' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {activeDropdown === 'nearme' && (
              <div className="absolute right-0 top-9 w-48 bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 text-xs animate-in fade-in">
                <button
                  onClick={() => { setRegionFilter('all'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    regionFilter === 'all' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Tất cả địa điểm</span>
                  {regionFilter === 'all' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setRegionFilter('lamdong'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    regionFilter === 'lamdong' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Gần tôi (Lâm Đồng)</span>
                  {regionFilter === 'lamdong' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setRegionFilter('taybac'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between ${
                    regionFilter === 'taybac' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                  }`}
                >
                  <span>Tây Bắc (Lào Cai / Sơn La)</span>
                  {regionFilter === 'taybac' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* Reset Filters Chip */}
          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E04838]/20 border border-[#E04838]/50 text-xs font-semibold text-[#E04838] hover:bg-[#E04838]/30 transition-all"
            >
              <RotateCcw size={11} />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Topographic Map (Bidoup Núi Bà) */}
      <div>
        <LeafletMap
          height="190px"
          placeName="Bidoup Núi Bà"
          summitAltitude="2,287m"
          routeNote="Offline map available"
          onWaypointClick={(wp) => alert(`Điểm đánh dấu: ${wp.name}`)}
        />
      </div>

      {/* Curated Trails ("Worth the climb") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-bold text-white">Worth the climb</h2>
            <span className="text-xs text-[#4ADE80] font-semibold">({filteredTrails.length} cung đường)</span>
          </div>
          <span className="text-xs font-semibold text-[#A5B4A8]">Curated for you</span>
        </div>

        {filteredTrails.length === 0 ? (
          <div className="p-8 text-center bg-[#1B221D] border border-[#2E3B32] rounded-2xl space-y-3">
            <p className="text-xs text-[#A5B4A8]">Không tìm thấy cung đường phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-[#38764B] text-white text-xs font-bold rounded-xl"
            >
              Đặt lại toàn bộ bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => onSelectTrail(trail)}
                className="group bg-[#1B221D] border border-[#2E3B32] rounded-2xl overflow-hidden hover:border-[#38764B] transition-all cursor-pointer shadow-lg"
              >
                {/* Photo with Overlay Badges */}
                <div className="relative h-36 w-full bg-[#121613] overflow-hidden">
                  <img
                    src={trail.image}
                    alt={trail.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/9680546a9f58bc783a3080e0c17b964f703f4857.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B221D] via-transparent to-black/30"></div>

                  {/* Status Badges on Photo */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 text-white shadow-md ${
                      trail.statusBadge === 'Slippery' ? 'bg-[#5E7A45]/90' : 'bg-[#C2562B]/90'
                    }`}>
                      {trail.statusBadge === 'Slippery' ? (
                        <Footprints size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      <span>{trail.statusBadge}</span>
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleBookmark(trail.id, e)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
                  >
                    <Bookmark
                      size={14}
                      fill={bookmarkedIds.includes(trail.id) ? '#F2B832' : 'none'}
                      className={bookmarkedIds.includes(trail.id) ? 'text-[#F2B832]' : ''}
                    />
                  </button>
                </div>

                {/* Trail Details */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#4ADE80] transition-colors">
                      {trail.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[#F2B832] font-semibold text-xs">
                      <Star size={13} fill="#F2B832" />
                      <span>{trail.rating}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#A5B4A8]">
                    {trail.length} · {trail.duration} · {trail.region.split('·')[0]}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#2E3B32]/60">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#252F28] text-white">
                      {trail.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-[#4ADE80] flex items-center gap-1 hover:underline">
                      View trail ↗
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* More Destinations ("Your next horizon") */}
      <div className="space-y-2.5">
        <h2 className="text-base font-bold text-white">Your next horizon</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => {
              alert('Cung đường Lảo Thẩn (Tây Bắc) đang được đội SolarBag cập nhật dữ liệu trắc địa. Bạn có thể tải trước gói bản đồ offline Tây Bắc!');
            }}
            className="p-3 bg-[#1B221D] border border-[#2E3B32] rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#38764B] transition-all"
          >
            <div className="p-2 rounded-xl bg-[#252F28] text-[#4ADE80]">
              <MountainSnow size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Lảo Thẩn</div>
              <div className="text-[10px] text-[#A5B4A8] flex items-center gap-0.5">
                Tây Bắc · Explore ↗
              </div>
            </div>
          </div>

          <div
            onClick={() => {
              alert('Cung đường Tà Xùa (Sống lưng khủng long) đang được cập nhật dữ liệu trắc địa. Bạn có thể tải trước gói bản đồ offline Tây Bắc!');
            }}
            className="p-3 bg-[#1B221D] border border-[#2E3B32] rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#38764B] transition-all"
          >
            <div className="p-2 rounded-xl bg-[#252F28] text-[#F2B832]">
              <MountainSnow size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tà Xùa</div>
              <div className="text-[10px] text-[#A5B4A8] flex items-center gap-0.5">
                Tây Bắc · Explore ↗
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Readiness Card */}
      <div className="p-4 bg-[#1B221D] border border-[#2E3B32] rounded-2xl space-y-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 rounded-lg bg-[#38764B]/20 text-[#4ADE80]">
            <CloudCheck size={18} />
          </div>
          <span className="text-sm font-bold">Ready without 4G</span>
        </div>

        <p className="text-xs text-[#A5B4A8]">
          2 maps saved · Tây Bắc & Bidoup · Ready without 4G
        </p>

        {/* Storage Bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-[#252F28] rounded-full overflow-hidden">
            <div className="h-full bg-[#38764B] rounded-full" style={{ width: '32%' }}></div>
          </div>
          <div className="text-[10px] text-[#A5B4A8]">
            Sample storage: 640 MB of 2 GB used
          </div>
        </div>

        <p className="text-[11px] text-[#A5B4A8]/80 leading-relaxed">
          Saved maps are available offline. Bidoup has an update ready; connect to Wi-Fi to refresh.
        </p>

        <button
          onClick={onOpenOfflineManager}
          className="w-full py-2.5 px-3 bg-[#252F28] hover:bg-[#2E3B32] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Download size={14} />
          <span>Manage offline maps</span>
        </button>
      </div>

      {/* ALLTRAILS-STYLE FULL FILTERS MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#1B221D] border-t border-[#2E3B32] rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom">
            <div className="w-10 h-1 bg-[#2E3B32] rounded-full mx-auto"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2E3B32]">
              <div>
                <h3 className="text-base font-bold text-white">Bộ lọc cung đường (AllTrails Style)</h3>
                <p className="text-xs text-[#A5B4A8]">Tùy chỉnh tiêu chí tìm kiếm dã ngoại</p>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-full bg-[#252F28] text-[#A5B4A8] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Độ khó (Difficulty)</label>
              <div className="grid grid-cols-4 gap-2">
                {['All', 'Easy', 'Moderate', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setActiveDifficulty(diff)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      activeDifficulty === diff
                        ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-md'
                        : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
                    }`}
                  >
                    {diff === 'All' ? 'Tất cả' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Length */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Cự ly quãng đường</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLengthFilter('all')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    lengthFilter === 'all' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  Tất cả cự ly
                </button>
                <button
                  onClick={() => setLengthFilter('short')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    lengthFilter === 'short' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  &lt; 15 km
                </button>
                <button
                  onClick={() => setLengthFilter('long')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    lengthFilter === 'long' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  ≥ 15 km
                </button>
              </div>
            </div>

            {/* 3. Elevation Gain */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Độ cao dốc (Elevation gain)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setElevationFilter('all')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    elevationFilter === 'all' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setElevationFilter('low')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    elevationFilter === 'low' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  &lt; 800 m
                </button>
                <button
                  onClick={() => setElevationFilter('high')}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    elevationFilter === 'high' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  ≥ 800 m
                </button>
              </div>
            </div>

            {/* 4. Special Features (Water / Location) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Tiện ích đặc biệt</label>
              <div className="space-y-2">
                <button
                  onClick={() => setWaterFilter(!waterFilter)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    waterFilter ? 'bg-[#2563EB]/20 border-blue-400 text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Droplets size={16} className={waterFilter ? 'text-blue-400' : ''} />
                    <span>Có nguồn nước tự nhiên trên đường</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${waterFilter ? 'bg-blue-500 border-blue-400 text-white' : 'border-[#2E3B32]'}`}>
                    {waterFilter && <Check size={12} />}
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRegionFilter(regionFilter === 'lamdong' ? 'all' : 'lamdong')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      regionFilter === 'lamdong' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                    }`}
                  >
                    <MapPin size={14} />
                    <span>Lâm Đồng (Gần tôi)</span>
                  </button>
                  <button
                    onClick={() => setRegionFilter(regionFilter === 'taybac' ? 'all' : 'taybac')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      regionFilter === 'taybac' ? 'bg-[#38764B] border-[#4ADE80] text-white' : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8]'
                    }`}
                  >
                    <MountainSnow size={14} />
                    <span>Tây Bắc (Sơn La / Lào Cai)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#2E3B32] flex items-center gap-2">
              <button
                onClick={resetAllFilters}
                className="py-3 px-4 bg-[#252F28] hover:bg-[#2E3B32] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Đặt lại</span>
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-3 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Hiển thị {filteredTrails.length} cung đường phù hợp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
