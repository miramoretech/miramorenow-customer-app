// src/hooks/useFlutterwavePayment.ts
// Reuse same Flutterwave as cart — no need for Paystack, keep it consistent
import { useState } from "react";

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";

interface PaymentOptions {
  amount: number;
  email: string;
  phone: string;
  name: string;
  txRef: string;
  meta?: Record<string, any>;
  onSuccess: (response: { transaction_id: string }) => void;
  onClose?: () => void;
}

export function useFlutterwavePayment() {
  const [paymentLoading, setPaymentLoading] = useState(false);

  const initiatePayment = (options: PaymentOptions): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const proceed = () => {
        setPaymentLoading(true);

        window.FlutterwaveCheckout({
          public_key: FLW_PUBLIC_KEY,
          tx_ref: options.txRef,
          amount: options.amount,
          currency: "NGN",
          payment_options: "card, banktransfer, ussd",
          customer: {
            email: options.email,
            phone_number: options.phone,
            name: options.name,
          },
          meta: options.meta || {},
          customizations: {
            title: "Miramore Delivery",
            description: "Package delivery fee",
            logo: "https://id-preview--47eebcb8-3c8f-44ed-aed1-85139916fac7.lovable.app/lovable-uploads/miramore-logo.png",
          },
          callback: (response: { status: string; transaction_id: string }) => {
            setPaymentLoading(false);
            if (response.status === "successful") {
              options.onSuccess({ transaction_id: String(response.transaction_id) });
              resolve();
            } else {
              reject(new Error("Payment was not successful. Please try again."));
            }
          },
          onclose: () => {
            setPaymentLoading(false);
            options.onClose?.();
            reject(new Error("Payment cancelled."));
          },
        });
      };

      // Wait for Flutterwave script to load
      if (typeof window.FlutterwaveCheckout === "function") {
        proceed();
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (typeof window.FlutterwaveCheckout === "function") {
            clearInterval(interval);
            proceed();
          } else if (attempts >= 20) {
            clearInterval(interval);
            setPaymentLoading(false);
            reject(new Error("Payment system not loaded. Please check your connection and try again."));
          }
        }, 300);
      }
    });
  };

  return { initiatePayment, paymentLoading };
}