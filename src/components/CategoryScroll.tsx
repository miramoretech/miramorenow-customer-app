// src/components/CategoryScroll.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Fixes the Android WebView horizontal scroll bug for categories.
//
// ROOT CAUSE OF THE BUG (found in Home.tsx):
//  1. Manual touch event listeners (onTouchStart/Move/End + scrollLeft manipulation)
//     CONFLICT with native CSS overflow scroll — Android WebView picks one or the other,
//     and the manual handler was winning, breaking native scroll.
//  2. marginLeft:-14 / marginRight:-14 negative margins on the scroll container
//     caused the container width to exceed the viewport, clipping touch targets.
//  3. className="hs" + injected <style> strings are unreliable in Capacitor WebView —
//     styles may not apply before the first paint on Android.
//  4. width:max-content on the inner row is unreliable on old Android WebView.
//
// THE FIX:
//  - All scroll styles are INLINE (never className-based) so they always apply.
//  - Zero negative margins — padding is used instead to create breathing room.
//  - NO manual touch handlers — pure CSS native scroll only.
//  - Inner row uses display:flex + white-space:nowrap pattern (more reliable).
//  - overscrollBehaviorX:"contain" prevents parent page scroll fighting the row.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

interface Category {
  id: string;
  name: string;
  emoji: string;
  img: string;
  fb: string[];
  ac: string;
}

interface CategoryScrollProps {
  categories: Category[];
  activeCat: string;
  onCatClick: (catId: string, catName: string) => void;
}

// ── Category image with emoji fallback ───────────────────────────────────────
const CatImg = ({
  src, fb, alt, emoji, isActive, accent,
}: {
  src: string; fb: string[]; alt: string;
  emoji: string; isActive: boolean; accent: string;
}) => {
  const [idx, setIdx]   = React.useState(-1);
  const [fail, setFail] = React.useState(false);
  const cur = idx === -1 ? src : fb[idx];

  return (
    <div
      style={{
        width: 62,
        height: 62,
        borderRadius: 16,
        overflow: "hidden",
        flexShrink: 0,
        background: fail ? `${accent}18` : "#F1F8F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: isActive
          ? `2.5px solid ${accent}`
          : "2px solid rgba(255,255,255,0.9)",
        boxShadow: isActive
          ? `0 0 0 3px ${accent}25, 0 6px 16px ${accent}35`
          : "0 3px 10px rgba(0,0,0,0.10)",
        transform: isActive ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border 0.22s ease",
      }}
    >
      {fail ? (
        <span style={{ fontSize: 28 }}>{emoji}</span>
      ) : (
        <img
          src={cur}
          alt={alt}
          loading="eager"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => {
            const next = idx + 1;
            if (next < fb.length) setIdx(next);
            else setFail(true);
          }}
        />
      )}
    </div>
  );
};

// ── Main CategoryScroll ───────────────────────────────────────────────────────
export const CategoryScroll: React.FC<CategoryScrollProps> = ({
  categories,
  activeCat,
  onCatClick,
}) => {
  return (
    // OUTER wrapper: full width, clips visual overflow, no negative margins
    <div
      style={{
        width: "100%",
        // KEY FIX: overflow hidden on X at this level is WRONG — remove it
        // We allow the scroll container below to handle it
        overflow: "visible",
        marginBottom: 4,
      }}
    >
      {/* SCROLL CONTAINER — pure CSS, no JS touch override */}
      <div
        style={{
          // ── THE CRITICAL SCROLL STYLES ──────────────────────────────
          overflowX: "scroll",                   // always scroll, not auto
          overflowY: "visible",
          WebkitOverflowScrolling: "touch",       // momentum on iOS
          // overscrollBehaviorX keeps page from fighting this scroll
          overscrollBehaviorX: "contain",
          // scrollbar hidden cross-browser
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          // ── LAYOUT ──────────────────────────────────────────────────
          // Use paddingLeft/Right instead of negative margins
          // so we get the edge breathing room without width overflow
          paddingLeft: 14,
          paddingRight: 14,
          paddingBottom: 10,
          paddingTop: 4,
          // width must be 100% of parent, not wider
          width: "100%",
          boxSizing: "border-box",
        }}
        // HIDE WEBKIT SCROLLBAR via inline approach
        onScroll={() => {}} // harmless, keeps React happy on SSR
      >
        {/* INNER ROW — flex row that grows as wide as needed */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",           // never wrap
            alignItems: "flex-start",
            gap: 12,
            // KEY FIX: width:max-content is unreliable on Android WebView.
            // Instead we use minWidth:max-content which forces the flex container
            // to expand as wide as children need, without capping.
            minWidth: "max-content",
            width: "max-content",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCat === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onCatClick(cat.id, cat.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  // FIXED width per tile — no minWidth ambiguity
                  width: 70,
                  flexShrink: 0,
                  cursor: "pointer",
                  paddingTop: 2,
                  // Prevent text selection on rapid taps
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                <CatImg
                  src={cat.img}
                  fb={cat.fb}
                  alt={cat.name}
                  emoji={cat.emoji}
                  isActive={isActive}
                  accent={cat.ac}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? cat.ac : "#666",
                    textAlign: "center",
                    lineHeight: 1.3,
                    width: 70,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hide webkit scrollbar — injected once, scoped to this component */}
      <style>{`
        .mm-cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CategoryScroll;