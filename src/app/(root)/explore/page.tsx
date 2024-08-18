import { useState, useEffect } from "react";
import { createCustomer, hasSubscription } from "@/lib/stripe";
import FlashcardSetsList from "@/components/FlashcardSetsList";

export default async function Explore() {
  const stripeCustomerId = await createCustomer();
  const isSubscribed = await hasSubscription(stripeCustomerId);

  return (
    <div className="bg-[#5D4037] text-[#FFC107] min-h-screen">
      <h1 className="text-center text-3xl font-bold py-8">Explore</h1>
      <div className="flex flex-wrap justify-center">
        <FlashcardSetsList isSubscribed={isSubscribed} />
      </div>
    </div>
  );
}