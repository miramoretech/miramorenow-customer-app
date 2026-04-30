const PromoBanner = () => {
  return (
    <div className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-light p-6 shadow-lg">
        {/* Decorative sparkles */}
        <div className="absolute top-3 right-4 text-2xl opacity-80 animate-pulse">✨</div>
        <div className="absolute bottom-4 right-12 text-lg opacity-50 animate-pulse" style={{ animationDelay: "1s" }}>✨</div>

        <div className="relative z-10 space-y-3">
          <h2 className="text-white text-xl font-bold font-display leading-snug">
            ✨ Welcome to Soft Living
          </h2>
          <p className="text-white/85 text-sm leading-relaxed">
            Your first order comes with{" "}
            <span className="font-bold text-secondary">FREE DELIVERY</span>{" "}
            — because your experience should start smooth, not stressful.
          </p>
          <p className="text-white/70 text-xs italic leading-relaxed">
            Tap. Order. Receive. Enjoy.
          </p>
          <p className="text-white/60 text-[11px] font-semibold tracking-wide">
            That's the Miramore way. 💛
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
