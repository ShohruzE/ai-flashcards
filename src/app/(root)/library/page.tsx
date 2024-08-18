"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "@clerk/nextjs";

interface FlashcardSet {
  id: string;
  title: string;
  createdAt: Date;
  items: any[];
}

export default function Library({ isSubscribed }: { isSubscribed: boolean }) {
  const { userId } = useAuth();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      if (!userId) return;

      try {
        const q = query(collection(db, "flashcards"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const sets: FlashcardSet[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          sets.push({ id: doc.id, title: data.title, createdAt, items: data.items });
        });

        setFlashcardSets(sets);
      } catch (error) {
        console.error("Error fetching flashcard sets:", error);
      }
    };

    fetchFlashcardSets();
  }, [userId]);

  const handleButtonClick = (setId: string) => {
    if (isSubscribed) {
      router.push(`/learn/${setId}`);
    } else {
      // Handle subscription error or prompt
    }
  };

  return (
    <div className="bg-[#5D4037] text-[#FFC107] min-h-screen">
      <div className="container mx-auto p-8">
        <div className="flex flex-row items-center mb-8">
          <h1 className="text-start text-2xl font-bold pr-4">Your Flashcards</h1>
          <p className="text-2xl font-medium">{flashcardSets.length}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {flashcardSets.length > 0 ? (
            flashcardSets.map((set) => (
              <div
                key={set.id}
                className="relative bg-[#4E342E] w-full h-60 cursor-pointer transform transition-transform hover:scale-105 text-center flex items-center justify-center text-[#FFC107] font-bold rounded-lg shadow-md hover:shadow-lg"
                onClick={() => handleButtonClick(set.id)}
              >
                <div className="p-4 text-sm">
                  <h2>{set.title}</h2>
                  <p>{set.items.length} items</p>
                </div>
              </div>
            ))
          ) : (
            <p>No flashcard sets found.</p>
          )}
        </div>
      </div>
    </div>
  );
}