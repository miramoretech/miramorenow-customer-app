import { useEffect, useRef } from "react";
import { App as CapApp } from "@capacitor/app";
import { useNavigate, useLocation } from "react-router-dom";

export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const handlerRef = useRef<any>(null);
  const isActive = useRef(true);

  useEffect(() => {
    isActive.current = true;
    
    const setupBackButton = async () => {
      try {
        const handler = await CapApp.addListener("backButton", () => {
          if (!isActive.current) return;
          
          // Check if we can navigate back in history
          if (window.history.length > 1 && location.key !== "default") {
            navigate(-1);
          } else {
            // At root screen - exit app
            CapApp.exitApp();
          }
        });
        
        handlerRef.current = handler;
      } catch (error) {
        console.error("Back button handler error:", error);
      }
    };
    
    setupBackButton();

    // ✅ Cleanup - NOW properly removes the listener
    return () => {
      isActive.current = false;
      if (handlerRef.current) {
        handlerRef.current.remove();
        handlerRef.current = null;
      }
    };
  }, [navigate, location]);
}