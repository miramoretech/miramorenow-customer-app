package com.miramoretech.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;
import androidx.core.view.WindowCompat;          // <-- ADDED for edge-to-edge
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ──────────────────────────────────────────────────────────
        // EDGE-TO-EDGE FIX for Android 15 (SDK 35)
        // ──────────────────────────────────────────────────────────
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Get the WebView instance after Capacitor initialisation
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Enable scrollbars and overscroll (essential for horizontal scroll)
            webView.setHorizontalScrollBarEnabled(true);
            webView.setVerticalScrollBarEnabled(true);
            webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);

            WebSettings settings = webView.getSettings();
            // Let WebView handle touch for horizontal panning
            settings.setSupportZoom(true);
            settings.setBuiltInZoomControls(false);
            // Use wide viewport to allow content wider than screen
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            // Improve rendering performance
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            // Force hardware acceleration for smoother scrolling
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
    }
}