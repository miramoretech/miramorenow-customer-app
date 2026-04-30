import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Gift, Flame, Zap, Clock, Copy, Check,
  ShoppingCart, Star, MapPin, ChevronRight, Percent, Sparkles,
  Truck, Coffee, Pizza, Beer, Cake, Heart, Share2, Bookmark,
  X, Calendar, Award, Diamond, Crown, Ticket, BadgeDollarSign,
  Search, MessageCircle, Home, Utensils, Filter, Volume2, VolumeX,
  RotateCcw, Trophy, Coins, Gift as GiftIcon, Music, PartyPopper
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

// Food cards data
const foodCards = [
  { id: 1, name: "Jollof Rice", emoji: "🍛", value: 100, color: "from-red-500 to-orange-500", sound: "jollof" },
  { id: 2, name: "Shawarma", emoji: "🌯", value: 150, color: "from-amber-500 to-yellow-500", sound: "shawarma" },
  { id: 3, name: "Suya", emoji: "🍢", value: 120, color: "from-orange-500 to-red-500", sound: "suya" },
  { id: 4, name: "Pounded Yam", emoji: "🍠", value: 80, color: "from-yellow-500 to-amber-500", sound: "pounded" },
  { id: 5, name: "Egusi Soup", emoji: "🥘", value: 130, color: "from-green-500 to-emerald-500", sound: "egusi" },
  { id: 6, name: "Parfait", emoji: "🍨", value: 90, color: "from-pink-500 to-rose-500", sound: "parfait" },
  { id: 7, name: "Grilled Fish", emoji: "🐟", value: 200, color: "from-blue-500 to-cyan-500", sound: "fish" },
  { id: 8, name: "Chapman", emoji: "🍹", value: 70, color: "from-purple-500 to-indigo-500", sound: "chapman" },
];

interface Card {
  id: number;
  cardId: number;
  name: string;
  emoji: string;
  value: number;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Sound utility functions
const playMatchSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = "sine";
  oscillator.frequency.value = 523.25;
  gainNode.gain.value = 0.3;
  
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const playFlipSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = "triangle";
  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.15;
  
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const playWinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gainNode.gain.value = 0.2;
    
    oscillator.start(audioContext.currentTime + index * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + index * 0.15 + 0.3);
    oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
  });
};

const playCelebrationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  for (let i = 0; i < 3; i++) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = "square";
    oscillator.frequency.value = 440 + i * 100;
    gainNode.gain.value = 0.2;
    
    oscillator.start(audioContext.currentTime + i * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + i * 0.1 + 0.2);
    oscillator.stop(audioContext.currentTime + i * 0.1 + 0.2);
  }
};

const playCoinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.2;
  
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.15);
  oscillator.stop(audioContext.currentTime + 0.15);
};

const PlayAndWin = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dailyAttempts, setDailyAttempts] = useState(3);
  const [showRules, setShowRules] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current && soundEnabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (soundFn: () => void) => {
    if (soundEnabled) {
      initAudio();
      soundFn();
    }
  };

  const initGame = () => {
    const doubledCards = [...foodCards, ...foodCards].map((card, index) => ({
      id: index,
      cardId: card.id,
      name: card.name,
      emoji: card.emoji,
      value: card.value,
      color: card.color,
      isFlipped: false,
      isMatched: false,
    }));
    
    const shuffled = [...doubledCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedCount(0);
    setMoves(0);
    setScore(0);
    setGameCompleted(false);
    setTimeLeft(60);
    setIsPlaying(true);
    setShowConfetti(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (!isPlaying || gameCompleted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameCompleted(true);
          toast.error("Time's up! Try again tomorrow!");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, gameCompleted]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      const card1 = cards[first];
      const card2 = cards[second];
      
      if (card1.cardId === card2.cardId) {
        playSound(playMatchSound);
        
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isMatched = true;
          newCards[second].isMatched = true;
          setCards(newCards);
          setMatchedCount(prev => prev + 1);
          setScore(prev => {
            const newScore = prev + card1.value;
            playSound(playCoinSound);
            return newScore;
          });
          
          toast.success(`🎉 Match! +${card1.value} coins!`, {
            icon: card1.emoji,
            duration: 1500,
          });
        }, 500);
      } else {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
        }, 1000);
      }
      
      setFlippedIndices([]);
      setMoves(prev => prev + 1);
    }
  }, [flippedIndices, cards, soundEnabled]);

  useEffect(() => {
    if (matchedCount === foodCards.length && !gameCompleted) {
      setGameCompleted(true);
      setShowConfetti(true);
      setShowRewardModal(true);
      setIsPlaying(false);
      
      playSound(playWinSound);
      playSound(playCelebrationSound);
      
      const savedRewards = localStorage.getItem("miramore_game_rewards") || "0";
      const newTotal = parseInt(savedRewards) + score;
      localStorage.setItem("miramore_game_rewards", newTotal.toString());
      
      toast.success(`🏆 Amazing! You completed the game!`, {
        duration: 3000,
        icon: "🏆",
      });
    }
  }, [matchedCount, gameCompleted, score]);

  const handleCardClick = (index: number) => {
    if (!isPlaying) return;
    if (gameCompleted) return;
    if (cards[index].isMatched) return;
    if (cards[index].isFlipped) return;
    if (flippedIndices.length === 2) return;
    
    playSound(playFlipSound);
    
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setFlippedIndices([...flippedIndices, index]);
  };

  const claimReward = () => {
    playSound(playCelebrationSound);
    
    const discountAmount = score;
    localStorage.setItem("miramore_game_winnings", discountAmount.toString());
    toast.success(`🎉 You won ₦${discountAmount}! Applied to your next order!`, {
      icon: "💰",
      duration: 3000,
    });
    setShowRewardModal(false);
    navigate("/cart");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 360 * 2
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear"
              }}
              className="absolute text-2xl"
              style={{
                left: Math.random() * window.innerWidth,
                fontSize: `${20 + Math.random() * 20}px`
              }}
            >
              {["🎉", "🎊", "✨", "⭐", "💫", "🍛", "🌯", "🎮"][Math.floor(Math.random() * 8)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Header - Fixed for mobile */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-3 py-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-gray-800">Play & Win</h1>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-full hover:bg-gray-100 relative"
          >
            {soundEnabled ? (
              <div className="relative">
                <Volume2 className="w-4 h-4 text-brand-red" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              </div>
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </header>

      {/* Game Stats - Reduced font sizes for mobile */}
      <div className="bg-gradient-to-r from-brand-red to-orange-500 text-white px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-[10px] opacity-80">Score</p>
            <p className="text-lg font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-80">Moves</p>
            <p className="text-lg font-bold">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-80">Time</p>
            <p className="text-lg font-bold font-mono">{formatTime(timeLeft)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-80">Matches</p>
            <p className="text-lg font-bold">{matchedCount}/{foodCards.length}</p>
          </div>
        </div>
      </div>

      {/* Daily Attempts */}
      <div className="px-3 py-2 bg-amber-50 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] text-amber-700 font-medium">Daily Attempts Left: {dailyAttempts}</span>
        </div>
        <button
          onClick={() => setShowRules(true)}
          className="text-[11px] text-brand-red font-medium"
        >
          How to Play?
        </button>
      </div>

      {/* Game Board - Mobile optimized grid */}
      <div className="p-3">
        {isPlaying && !gameCompleted && (
          <>
            <div className="text-center mb-3">
              <p className="text-xs text-gray-600">Match pairs of food items to win coins!</p>
              <div className="flex justify-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span>Win up to ₦1,000</span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>60 seconds</span>
                </div>
                {soundEnabled && (
                  <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Music className="w-3 h-3 text-green-500" />
                    <span>Sound ON</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile-optimized grid - smaller cards on phones */}
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
              {cards.map((card, index) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-xl text-2xl font-bold transition-all duration-300 ${
                    card.isMatched
                      ? "bg-green-100 border border-green-400 opacity-50 cursor-default"
                      : card.isFlipped
                      ? `bg-gradient-to-br ${card.color} shadow-lg transform rotate-y-180`
                      : "bg-gradient-to-br from-gray-200 to-gray-300 shadow-md hover:shadow-lg"
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {card.isFlipped || card.isMatched ? card.emoji : "?"}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Sound indicator animation */}
            {soundEnabled && (
              <div className="flex justify-center mt-3 gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [6, 12, 6],
                      backgroundColor: ["#ef4444", "#f97316", "#ef4444"]
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="w-0.5 bg-brand-red rounded-full"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Game Over / Completed State */}
        {!isPlaying && !gameCompleted && timeLeft === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Time's Up! ⏰</h3>
            <p className="text-xs text-gray-500 mb-4">Come back tomorrow for another chance to win!</p>
            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 bg-brand-red text-white rounded-xl text-sm font-bold"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>

      {/* Reward Modal - Mobile optimized */}
      <AnimatePresence>
        {showRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setShowRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-xl p-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <PartyPopper className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">🎉 You Won! 🎉</h3>
              <p className="text-xs text-gray-600 mb-1">You scored</p>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-2xl font-bold text-brand-red mb-2"
              >
                {score} Coins
              </motion.p>
              <p className="text-xs text-gray-500 mb-4">= ₦{score} OFF your next order!</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    initGame();
                    setShowRewardModal(false);
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Play Again
                </button>
                <button
                  onClick={claimReward}
                  className="flex-1 py-2 bg-brand-red text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Claim Reward
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal - Mobile optimized with smaller text */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">How to Play 🎮</h3>
                <button onClick={() => setShowRules(false)} className="p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-red text-xs font-bold">1</span>
                  </div>
                  <p className="text-xs text-gray-600">Match pairs of food cards to earn coins</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-red text-xs font-bold">2</span>
                  </div>
                  <p className="text-xs text-gray-600">Each match gives you coins based on the food item</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-red text-xs font-bold">3</span>
                  </div>
                  <p className="text-xs text-gray-600">Complete all 8 matches within 60 seconds</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-red text-xs font-bold">4</span>
                  </div>
                  <p className="text-xs text-gray-600">Your total score = discount on your next order!</p>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-1 justify-center">
                  <Music className="w-3 h-3 text-amber-600" />
                  <p className="text-[10px] text-amber-700 text-center">
                    Fun sound effects play when you make matches!
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowRules(false)}
                className="w-full mt-3 py-2 bg-brand-red text-white rounded-lg text-sm font-bold"
              >
                Got it! Let's Play
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Preview - Mobile optimized */}
      <div className="px-3 py-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              Top Players This Week
            </h3>
            <button className="text-[10px] text-brand-red">View All</button>
          </div>
          <div className="space-y-1.5">
            {[
              { name: "Adebayo 🏆", score: 1250, rank: 1 },
              { name: "Chidinma ⭐", score: 980, rank: 2 },
              { name: "Emeka 🔥", score: 750, rank: 3 },
            ].map((player, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold w-5 ${player.rank === 1 ? "text-yellow-500" : player.rank === 2 ? "text-gray-400" : "text-amber-600"}`}>
                    #{player.rank}
                  </span>
                  <span className="text-xs text-gray-700">{player.name}</span>
                </div>
                <span className="text-xs font-bold text-brand-red">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Rewards */}
      <div className="px-3 pb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Daily Login Bonus</p>
              <p className="text-[10px] opacity-90">Claim 50 coins every day!</p>
            </div>
            <button 
              onClick={() => {
                playSound(playCoinSound);
                toast.success("🎁 You claimed 50 coins!", { icon: "💰" });
              }}
              className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium hover:bg-white/30 transition"
            >
              Claim
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default PlayAndWin;