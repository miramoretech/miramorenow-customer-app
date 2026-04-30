import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickActionsProps {
  onSendFoodClick?: () => void;
}

const QuickActions = ({ onSendFoodClick }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    { 
      id: "send-food", 
      emoji: "❤️", 
      label: "Send Food", 
      desc: "Gift a meal", 
      onClick: onSendFoodClick, 
      featured: true,
      bgClass: "bg-gradient-to-br from-rose-500 to-rose-600",
      textClass: "text-white",
      descClass: "text-rose-100"
    },
    { 
      id: "group", 
      emoji: "👥", 
      label: "Group Order", 
      desc: "Order together", 
      path: "/cart",
      bgClass: "bg-gradient-to-br from-brand-green to-brand-green-deep",
      textClass: "text-white",
      descClass: "text-white/80"
    },
    { 
      id: "beauty", 
      emoji: "💇‍♀️", 
      label: "Book Beauty", 
      desc: "Hair & services", 
      href: "https://wa.me/2347037632867?text=Hi%2C%20I%20want%20to%20book%20a%20beauty%20service%20on%20MiramoreNow",
      bgClass: "bg-gradient-to-br from-purple-500 to-purple-600",
      textClass: "text-white",
      descClass: "text-purple-100"
    },
    { 
      id: "reorder", 
      emoji: "🔁", 
      label: "Reorder", 
      desc: "Past favorites", 
      path: "/orders",
      bgClass: "bg-gradient-to-br from-amber-500 to-amber-600",
      textClass: "text-white",
      descClass: "text-amber-100"
    },
  ];

  return (
    <div className="px-4 pt-5">
      <h3 className="text-sm font-bold text-brand-green mb-3 font-display tracking-wide flex items-center gap-1">
        <span className="text-lg">✨</span> Quick Actions
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => {
              if (action.onClick) action.onClick();
              else if ("href" in action && action.href) window.open(action.href, "_blank", "noopener,noreferrer");
              else if ("path" in action && action.path) navigate(action.path);
            }}
            className={`
              relative flex flex-col items-center gap-1.5 p-3 rounded-2xl
              ${action.bgClass} shadow-md shadow-black/20
              transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
            `}
          >
            <span className="text-3xl drop-shadow-sm">{action.emoji}</span>
            <span className={`text-[11px] font-bold text-center ${action.textClass}`}>
              {action.label}
            </span>
            <span className={`text-[9px] text-center leading-tight ${action.descClass}`}>
              {action.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;