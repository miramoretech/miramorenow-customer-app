const tips = [
  { icon: "📅", tip: "Book 2 weeks in advance" },
  { icon: "👥", tip: "Order 20% extra for guests" },
  { icon: "🍽️", tip: "Include vegetarian options" },
  { icon: "🎵", tip: "Plan for music & entertainment" },
  { icon: "📸", tip: "Hire a photographer" },
  { icon: "🎂", tip: "Custom cake makes it special" },
];

const PartyTips = () => {
  return (
    <div>
      <h3 className="text-md font-bold text-gray-800 mb-3">💡 Party Planning Tips</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tips.map((item, i) => (
          <div key={i} className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium text-gray-700">{item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyTips;