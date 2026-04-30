import logo from "@/assets/miramore-logo.jpg";

const MiramoreLogo = ({ size = "lg" }: { size?: "sm" | "md" | "lg" }) => {
  const dims = { sm: "w-8 h-8", md: "w-14 h-14", lg: "w-24 h-24" };

  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={logo}
        alt="Miramore"
        className={`${dims[size]} rounded-xl object-contain`}
      />
      {size === "lg" && (
        <span className="text-primary-foreground font-bold text-lg tracking-wide">
          Miramorenow
        </span>
      )}
    </div>
  );
};

export default MiramoreLogo;
