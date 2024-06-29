"use client"
import PaymentForm from "./_components/PaymentForm";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export default function Home() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
