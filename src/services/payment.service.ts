/**
 * Payment Gateway Service
 * Minimal client-side integration for Paystack / Flutterwave.
 * - Keys come from VITE_PAYSTACK_PUBLIC_KEY / VITE_FLUTTERWAVE_PUBLIC_KEY
 * - When a key is missing the gateway is reported as "not configured" so the
 *   checkout UI can fall back to bank transfer / pay on delivery.
 *
 * NOTE: for production orders, always verify the payment server-side
 * (webhook or charge verification) before fulfilling.
 */

interface PaystackCheckoutOptions {
  email: string;
  amountNaira: number;
  reference: string;
  onCancel?: () => void;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    PaystackPop?: any;
    FlutterwaveCheckout?: any;
  }
}

export const paymentConfig = {
  paystackKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || '',
  flutterwaveKey: (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string) || '',
};

export function getGatewayStatus(): {
  paystack: boolean;
  flutterwave: boolean;
} {
  return {
    paystack: !!paymentConfig.paystackKey,
    flutterwave: !!paymentConfig.flutterwaveKey,
  };
}

/**
 * Paystack inline payment. Resolves with the payment reference on success.
 */
export async function payWithPaystack(options: PaystackCheckoutOptions): Promise<string> {
  if (!paymentConfig.paystackKey) {
    throw new Error('Paystack is not configured. Use bank transfer or pay on delivery instead.');
  }

  await loadScript('https://js.paystack.co/v1/inline.js');

  return new Promise((resolve, reject) => {
    try {
      const handler = window.PaystackPop?.setup({
        key: paymentConfig.paystackKey,
        email: options.email,
        amount: Math.round(options.amountNaira * 100), // kobo
        ref: options.reference,
        currency: 'NGN',
        callback: (response: { reference?: string; trxref?: string }) =>
          resolve(response.reference || response.trxref || options.reference),
        onClose: () => {
          options.onCancel?.();
          reject(new Error('Payment window closed. Your order is saved — you can retry or use bank transfer.'));
        },
      });
      handler?.openIframe();
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Could not start Paystack popup'));
    }
  });
}

/**
 * Flutterwave card payment via their popup checkout.
 */
export async function payWithFlutterwave(options: PaystackCheckoutOptions): Promise<string> {
  if (!paymentConfig.flutterwaveKey) {
    throw new Error('Flutterwave is not configured. Use BANK + pay on delivery instead.');
  }

  await loadScript('https://checkout.flutterwave.com/v3.js');

  return new Promise((resolve, reject) => {
    try {
      window.FlutterwaveCheckout({
        public_key: paymentConfig.flutterwaveKey,
        tx_ref: options.reference,
        amount: options.amountNaira,
        currency: 'NGN',
        payment_options: 'card, ussd, banktransfer',
        customer: { email: options.email },
        callback: (response: { status?: string; transaction_id?: string | number; tx_ref?: string }) => {
          if (response.status === 'successful') {
            resolve(String(response.transaction_id || response.tx_ref || options.reference));
          } else {
            options.onCancel?.();
            reject(new Error('Payment not confirmed. Your order is saved — you can retry or use bank transfer.'));
          }
        },
        onclose: () => {
          options.onCancel?.();
          reject(new Error('Payment cancelled. Your order is saved — you can retry or use bank transfer.'));
        },
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Could not start Flutterwave checkout'));
    }
  });
}