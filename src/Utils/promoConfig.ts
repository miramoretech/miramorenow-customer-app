// src/utils/promoConfig.ts

// Set your actual launch date here (change to your go-live date)
export const APP_LAUNCH_DATE = new Date('2026-04-23'); // Update this!

// Check if free delivery promo is active (auto-expires after 14 days)
export const isFreeDeliveryActive = (): boolean => {
    const today = new Date();
    const daysSinceLaunch = (today.getTime() - APP_LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLaunch <= 14;
};

// Optional: Get remaining promo days (for countdown display)
export const getRemainingPromoDays = (): number => {
    const today = new Date();
    const daysSinceLaunch = (today.getTime() - APP_LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24);
    const remaining = Math.max(0, 14 - Math.floor(daysSinceLaunch));
    return remaining;
};