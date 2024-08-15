import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are an API that generates flashcards based on a given topic or subject. When provided with a topic, you should generate a set of x flashcards, where x is a number provided by the user between 1 and 5. You will also be provided a difficulty by the user, which can range from 'Easy', 'Medium', 'Hard', 'Very Hard', or 'Extreme'. Each flashcard does not necessarily have to be increasing in difficulty, but they should simply adhere to the difficulty provided. Each flashcard should have a "front", "back" and "hints" section. The "front" contains a question, term, or prompt, and the "back" contains the answer, definition, or explanation. The "hints" section contains a set of three progressive hints as an array, where each hint is to build on top of the previous one. Your output should be in JSON format, structured as an array of objects, each representing a flashcard.`;

const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  hints: z.array(z.string()),
});

const flashcardsSchema = z.object({
  flashcards: z.object({
    title: z.string(),
    items: z.array(flashcardSchema),
  }),
});

export async function POST(request: NextRequest) {
  const openai = new OpenAI();
  const { topic, difficulty, size } = await request.json();

  const userInput = `Topic: ${topic}, Difficulty: ${difficulty}, Number of Flashcards: ${size}`;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
    response_format: zodResponseFormat(flashcardsSchema, "flashcards"),
  });
  const flashcards = completion.choices[0].message.parsed;

  return NextResponse.json(flashcards);
}
