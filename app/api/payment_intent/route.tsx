import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
    try {
        const { paymentMethodId } = await req.json();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 10000, // Amount in cents (example: $10.00)
            currency: "usd",
            payment_method: paymentMethodId,
            confirmation_method: "automatic",
            // confirm: true,
            // return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/return`, // Set your return URL here
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
