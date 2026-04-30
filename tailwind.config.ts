import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Poppins', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        conversion: {
          DEFAULT: "hsl(var(--conversion))",
          foreground: "hsl(var(--conversion-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        
        // 🟢⭐🤍 ADDICTIVE BRAND COLORS - Green + White + Yellow
        brand: {
          // Primary Green (main brand color - trustworthy, fresh, growth)
          green: "#10B981",
          "green-dark": "#059669",
          "green-deep": "#047857",
          "green-light": "#D1FAE5",
          "green-soft": "#ECFDF5",
          
          // Energetic Yellow (happiness, optimism, appetite stimulation)
          yellow: "#FBBF24",
          "yellow-dark": "#F59E0B",
          "yellow-deep": "#D97706",
          "yellow-light": "#FEF3C7",
          "yellow-soft": "#FFFBEB",
          
          // Clean White (purity, simplicity, elegance)
          white: "#FFFFFF",
          "white-off": "#FAFAF9",
          "white-cream": "#F5F5F4",
          
          // Accent Colors
          lime: "#A3E635",
          "lime-light": "#ECFCCB",
          emerald: "#34D399",
          "emerald-light": "#D1FAE5",
          
          // CTA Orange (urgency, action, conversion)
          cta: "#F97316",
          "cta-deep": "#EA580C",
          "cta-light": "#FFEDD5",
          
          // Backgrounds
          bg: "#FFFFFF",
          "bg-light": "#FAFAF9",
          "bg-warm": "#FEFCE8",
        },
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
      },
      
      boxShadow: {
        card: "0px 4px 20px rgba(0,0,0,0.04)",
        "card-hover": "0px 8px 30px rgba(0,0,0,0.08)",
        
        // Green shadows (trust, growth)
        green: "0 6px 20px rgba(16,185,129,0.25)",
        "green-lg": "0 10px 30px rgba(16,185,129,0.3)",
        "green-glow": "0 0 20px rgba(16,185,129,0.4)",
        
        // Yellow shadows (warmth, happiness)
        yellow: "0 6px 20px rgba(251,191,36,0.25)",
        "yellow-lg": "0 10px 30px rgba(251,191,36,0.3)",
        
        // CTA Orange (urgency)
        cta: "0 6px 20px rgba(249,115,22,0.35)",
        "cta-lg": "0 10px 30px rgba(249,115,22,0.4)",
        
        // Soft neutrals
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        "soft-lg": "0 4px 16px rgba(0,0,0,0.06)",
      },
      
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "logo-bounce": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "icon-dance": {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-12px) rotate(-8deg)" },
          "50%": { transform: "translateY(0) rotate(0deg)" },
          "75%": { transform: "translateY(-8px) rotate(8deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0px)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(16,185,129,0)" },
        },
        "pulse-yellow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(251,191,36,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(251,191,36,0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "logo-bounce": "logo-bounce 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "icon-dance": "icon-dance 0.8s ease-in-out 2",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-left": "fade-in-left 0.4s ease-out forwards",
        "fade-in-right": "fade-in-right 0.4s ease-out forwards",
        "fade-out": "fade-out 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slide-down 0.4s ease-out forwards",
        "slide-left": "slide-left 20s linear infinite",
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "pulse-yellow": "pulse-yellow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "spin-slow": "spin-slow 8s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "scale-up": "scale-up 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 1s ease-in-out infinite",
      },
      
      backgroundImage: {
        "gradient-green-white": "linear-gradient(135deg, #10B981 0%, #FFFFFF 100%)",
        "gradient-yellow-white": "linear-gradient(135deg, #FBBF24 0%, #FFFFFF 100%)",
        "gradient-green-yellow": "linear-gradient(135deg, #10B981 0%, #FBBF24 100%)",
        "gradient-cta": "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        "gradient-radial-green": "radial-gradient(circle at top right, #D1FAE5, #FFFFFF)",
        "gradient-shimmer": "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;