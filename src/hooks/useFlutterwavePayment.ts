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
  const [loading, setLoading] = useState(false);

  const initiatePayment = (options: PaymentOptions) => {
    return new Promise<void>((resolve, reject) => {
      const proceed = () => {
        setLoading(true);
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
          meta: options.meta,
          customizations: {
            title: "Miramore Delivery",
            description: "Package delivery fee",
            logo: "https://id-preview--47eebcb8-3c8f-44ed-aed1-85139916fac7.lovable.app/lovable-uploads/miramore-logo.png",
          },
          callback: (response: { status: string; transaction_id: string }) => {
            setLoading(false);
            if (response.status === "successful") {
              options.onSuccess({ transaction_id: response.transaction_id });
              resolve();
            } else {
              reject(new Error("Payment failed"));
            }
          },
          onclose: () => {
            setLoading(false);
            options.onClose?.();
            reject(new Error("Payment cancelled"));
          },
        });
      };

      if (typeof window.FlutterwaveCheckout === "function") {
        proceed();
      } else {
        const interval = setInterval(() => {
          if (typeof window.FlutterwaveCheckout === "function") {
            clearInterval(interval);
            proceed();
          }
        }, 300);
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Payment system not loaded. Please refresh."));
        }, 8000);
      }
    });
  };

  return { initiatePayment, paymentLoading: loading };
}