import React, { useState } from 'react';
import { Bell, Heart, MessageCircle, Send, MoreHorizontal, Footprints, Users, Mountain, Sun, Trophy, HandHeart, ArrowUpRight, Check, Compass, Plus } from 'lucide-react';
import { LeafletMap } from '../LeafletMap';
import { FeedPost, CrewMember, Challenge, Trophy as TrophyType } from '../../types';

interface CommunityTabProps {
  posts: FeedPost[];
  crew: CrewMember[];
  challenges: Challenge[];
  trophies: TrophyType[];
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  posts,
  crew,
  challenges,
  trophies,
  onLikePost,
  onAddComment
}) => {
  const [activeSegment, setActiveSegment] = useState<'feed' | 'challenges' | 'charity'>('feed');
  const [commentDrawerPostId, setCommentDrawerPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  const handleSendComment = (postId: string) => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
      {/* Screen Heading */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase">
            SHARED TRAILS. SHARED PURPOSE.
          </div>
          <h1 className="text-2xl font-black text-white mt-0.5">Better, together.</h1>
        </div>
        <button
          onClick={() => alert('Thông báo mới: Bạn có 2 lượt cổ vũ từ Minh Linh & An Nguyễn')}
          className="p-2.5 rounded-xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white transition-all relative"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E04838]"></span>
        </button>
      </div>

      {/* Community Segments Control */}
      <div className="flex items-center p-1 bg-[#1B221D] border border-[#2E3B32] rounded-2xl">
        <button
          onClick={() => setActiveSegment('feed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSegment === 'feed'
              ? 'bg-[#252F28] text-white shadow-md'
              : 'text-[#A5B4A8] hover:text-white'
          }`}
        >
          Bảng tin (Feed)
        </button>
        <button
          onClick={() => setActiveSegment('challenges')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSegment === 'challenges'
              ? 'bg-[#252F28] text-white shadow-md'
              : 'text-[#A5B4A8] hover:text-white'
          }`}
        >
          Thử thách (Challenges)
        </button>
        <button
          onClick={() => setActiveSegment('charity')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSegment === 'charity'
              ? 'bg-[#252F28] text-white shadow-md'
              : 'text-[#A5B4A8] hover:text-white'
          }`}
        >
          Thiện nguyện (Charity)
        </button>
      </div>

      {/* SEGMENT 1: FEED & GROUP TRIP TRACKER */}
      {activeSegment === 'feed' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Friend Trail Diary */}
          {posts.map((post) => (
            <div key={post.id} className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
              {/* Author & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#38764B]"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{post.author.name}</h3>
                    <p className="text-[10px] text-[#A5B4A8]">{post.author.location} · {post.author.timeAgo}</p>
                  </div>
                </div>
                <button className="text-[#A5B4A8] hover:text-white p-1">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Caption */}
              <p className="text-xs text-white leading-relaxed">
                {post.caption}
              </p>

              {/* Activity Metrics Badges */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-white">
                <span className="px-2.5 py-1 rounded-lg bg-[#121613] border border-[#2E3B32]">
                  {post.metrics.distance}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#121613] border border-[#2E3B32] text-[#4ADE80]">
                  {post.metrics.elevation}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#38764B]/30 text-[#4ADE80] border border-[#38764B] flex items-center gap-1">
                  <Footprints size={12} /> {post.metrics.type}
                </span>
              </div>

              {/* Photo & GPS Route Preview */}
              <div className="rounded-xl overflow-hidden border border-[#2E3B32] bg-[#121613]">
                <img
                  src={post.photo}
                  alt="Check-in"
                  className="w-full h-44 object-cover"
                />
                <div className="p-2.5 bg-[#121613] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Compass size={14} className="text-[#38764B]" />
                    <span className="font-semibold text-white">{post.mapPreview}</span>
                  </div>
                  <span className="text-[10px] text-[#A5B4A8]">GPS ±3m</span>
                </div>
              </div>

              {/* Post Actions: Like, Comment, Share */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2E3B32]/70 text-xs text-[#A5B4A8]">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.hasLiked ? 'text-[#E04838]' : 'hover:text-white'
                  }`}
                >
                  <Heart size={16} fill={post.hasLiked ? '#E04838' : 'none'} />
                  <span className="font-bold">{post.likes}</span>
                </button>

                <button
                  onClick={() => setCommentDrawerPostId(commentDrawerPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>{post.comments.length} bình luận</span>
                </button>

                <button
                  onClick={() => alert('Đã sao chép link hành trình để chia sẻ lên Facebook/Zalo!')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Send size={15} />
                  <span>Chia sẻ</span>
                </button>
              </div>

              {/* Comment Box Drawer */}
              {commentDrawerPostId === post.id && (
                <div className="pt-3 border-t border-[#2E3B32] space-y-2.5 animate-in fade-in">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-2 bg-[#121613] rounded-xl text-xs">
                        <span className="font-bold text-white mr-1.5">{c.author}:</span>
                        <span className="text-[#A5B4A8]">{c.text}</span>
                        <span className="text-[10px] text-[#A5B4A8]/60 ml-2 font-mono">{c.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Viết lời cổ vũ cho bạn trekker..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                      className="flex-1 bg-[#121613] border border-[#2E3B32] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#A5B4A8]"
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      className="px-3 py-1.5 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-bold rounded-xl"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Group Trip Tracker */}
          <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">On the trail together</h2>
              <span className="text-xs font-semibold text-[#4ADE80] cursor-pointer hover:underline">
                View group ↗
              </span>
            </div>

            {/* Interactive Crew Map */}
            <LeafletMap
              height="210px"
              placeName="Weekend crew"
              summitAltitude="2,287m"
              routeNote="3 of 4 sharing · updated 30s ago"
              showCrew={true}
              crewMembers={crew}
            />

            {/* Group Status */}
            <div className="flex items-start gap-2.5 p-3 bg-[#121613] rounded-xl border border-[#2E3B32]">
              <div className="p-2 bg-[#38764B]/20 text-[#4ADE80] rounded-xl shrink-0">
                <Users size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">
                  Weekend crew · 3 on trail, 1 at camp
                </div>
                <div className="text-[11px] text-[#A5B4A8]">
                  Permission: group only · Sample locations
                </div>
              </div>
            </div>

            {/* Member Details */}
            <div className="space-y-1.5">
              {crew.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-[#121613] border border-[#2E3B32]/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#38764B] text-white font-bold flex items-center justify-center text-[10px]">
                      {member.initials}
                    </span>
                    <span className="font-semibold text-white">{member.name}</span>
                    <span className="text-[10px] text-[#A5B4A8]">({member.status})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-[#F2B832]">{member.distanceToMe}</span>
                    <div className="text-[9px] text-[#A5B4A8]">Pin: {member.battery}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: CHALLENGES */}
      {activeSegment === 'challenges' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">November challenges</h2>
            <span className="text-xs font-semibold text-[#F2B832]">12 days left</span>
          </div>

          {challenges.map((ch) => (
            <div key={ch.id} className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#252F28] text-[#F2B832] border border-[#2E3B32]">
                    {ch.id.includes('climb') ? <Mountain size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{ch.title}</h3>
                    <p className="text-xs text-[#A5B4A8]">{ch.progress} / {ch.target}{ch.unit}</p>
                  </div>
                </div>
                <span className="text-base font-black text-white">{ch.percentage}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 bg-[#121613] rounded-full overflow-hidden border border-[#2E3B32]">
                <div
                  className="h-full bg-gradient-to-r from-[#38764B] to-[#4ADE80] rounded-full transition-all duration-500"
                  style={{ width: `${ch.percentage}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-[#A5B4A8] leading-relaxed">
                {ch.rewardNote}
              </p>
            </div>
          ))}

          {/* Trophy Miniatures Shelf */}
          <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 shadow-lg">
            <div className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>Huy hiệu tháng đã mở khóa</span>
              <span className="text-[11px] text-[#4ADE80]">2 / 3 Đã đạt</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {trophies.map((tr) => (
                <div
                  key={tr.id}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    tr.unlocked
                      ? 'bg-[#121613] border-[#38764B] text-[#F2B832]'
                      : 'bg-[#121613]/50 border-[#2E3B32] text-[#A5B4A8] opacity-50'
                  }`}
                >
                  <div className="p-2 rounded-full bg-[#252F28]">
                    {tr.icon === 'sun' ? <Sun size={18} /> : tr.icon === 'mountain' ? <Mountain size={18} /> : <Trophy size={18} />}
                  </div>
                  <span className="text-xs font-bold text-white">{tr.name}</span>
                  <span className="text-[9px] text-[#A5B4A8]">{tr.unlocked ? 'Đã nhận' : 'Khóa'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 3: CHARITY CSR IMPACT MATCHING */}
      {activeSegment === 'charity' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-[#1B221D] border-2 border-[#F2B832]/60 rounded-3xl overflow-hidden shadow-2xl">
            {/* Banner Photo from Figma */}
            <div className="relative h-44 w-full bg-[#121613] overflow-hidden">
              <img
                src="/assets/03c61dcb8366d0bd2e5d5da0951ca819441c95b0.png"
                alt="Mountain school students"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B221D] via-transparent to-black/40"></div>

              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F2B832] text-black flex items-center gap-1 shadow-md">
                  <HandHeart size={12} /> SPONSOR MATCHING · SAMPLE
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <h3 className="text-lg font-black text-white">Gùi nắng lên bản</h3>
                <p className="text-xs text-[#A5B4A8] mt-1 leading-relaxed">
                  Every 10 verified trekking km unlocks a 50,000₫ sponsor contribution toward a SolarBag Lite for a mountain student.
                </p>
              </div>

              {/* Progress and Target */}
              <div className="p-3.5 bg-[#121613] rounded-2xl border border-[#2E3B32]">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-2xl font-black text-[#F2B832]">100,000₫</span>
                  <span className="text-xs text-[#A5B4A8]">Mục tiêu 350,000₫ / 1 Balo</span>
                </div>
                <div className="w-full h-2 bg-[#252F28] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#F2B832] rounded-full" style={{ width: '28.5%' }}></div>
                </div>
                <div className="text-[11px] font-semibold text-[#4ADE80] flex items-center gap-1">
                  <Check size={12} /> 20 verified km = 100,000₫ matched
                </div>
              </div>

              <p className="text-[10px] text-[#A5B4A8] italic">
                Sponsor-funded, not an automatic donation from you. Illustrative campaign progress; no payment is taken.
              </p>

              <button
                onClick={() => setShowLogModal(true)}
                className="w-full py-3 bg-[#38764B] hover:bg-[#438a58] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <span>Xem nhật ký tài trợ & đóng góp</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Nhật Ký Tài Trợ CSR</h3>
            <p className="text-xs text-[#A5B4A8] mb-4">Các doanh nghiệp đồng hành cùng bước chân Trekker:</p>
            <div className="space-y-2 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] flex justify-between">
                <span>Green Mountain Co.</span>
                <span className="font-bold text-[#F2B832]">+50,000₫ (10km)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] flex justify-between">
                <span>SolarTech Energy VN</span>
                <span className="font-bold text-[#F2B832]">+50,000₫ (10km)</span>
              </div>
            </div>
            <button
              onClick={() => setShowLogModal(false)}
              className="w-full py-2.5 bg-[#252F28] text-white text-xs font-bold rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

