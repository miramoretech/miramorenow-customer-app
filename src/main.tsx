import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App";
import "./index.css";

// ✅ Create QueryClient with optimal settings (SINGLETON)
let queryClientInstance: QueryClient | null = null;
const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: 1,
          retryDelay: 1000,
          throwOnError: false,
        },
        mutations: {
          retry: 1,
          retryDelay: 1000,
        },
      },
    });
  }
  return queryClientInstance;
};

// ✅ Global error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-4">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-semibold active:scale-95 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// ✅ Global error handler for uncaught errors
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Global error caught:", event.error);
  if (event.error?.message?.includes("ResizeObserver")) {
    event.preventDefault();
  }
};

// ✅ Handle unhandled promise rejections
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
};

// Register global error handlers
window.addEventListener("error", handleGlobalError);
window.addEventListener("unhandledrejection", handleUnhandledRejection);

// ✅ Register PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("✅ Miramore Service Worker registered");
      })
      .catch((err) => {
        console.warn("⚠️ Service Worker registration failed:", err);
      });
  });
}

// Get QueryClient singleton
const queryClient = getQueryClient();

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Check your index.html");
}

// ✅ RENDER WITHOUT BrowserRouter (App.tsx already has it)
createRoot(rootElement).render(
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      window.location.reload();
    }}
  >
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);

// ✅ Optional: Log when app is running in development mode
if (import.meta.env.DEV) {
  console.log("🚀 Miramore App running in development mode");
  console.log("📱 Platform:", navigator.userAgent.includes("Android") ? "Android" : "Web");
}