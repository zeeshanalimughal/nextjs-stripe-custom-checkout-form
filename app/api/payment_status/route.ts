import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { clientSecret } = await req.json();

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Missing client secret" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(clientSecret);

    return NextResponse.json({ paymentIntent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
