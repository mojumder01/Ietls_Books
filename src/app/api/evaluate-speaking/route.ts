import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { transcript, topic, difficulty, duration } = await request.json();

    if (!transcript || !topic) {
      return NextResponse.json(
        { error: 'Transcript and topic are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an IELTS speaking evaluator. Evaluate the following IELTS speaking response based on the criteria:
- Fluency & Coherence
- Lexical Resources (Vocabulary)
- Grammatical Accuracy & Range
- Pronunciation

Speaking Topic: ${topic}
Difficulty Level: ${difficulty}
Duration: ${duration} seconds

TRANSCRIPT:
${transcript}

Provide your evaluation in this JSON format:
{
  "score": <number 0-100>,
  "bandScore": <number 0-9>,
  "fluency": <number 0-9>,
  "vocabulary": <number 0-9>,
  "grammar": <number 0-9>,
  "pronunciation": <number 0-9>,
  "strengths": [<list of 3-5 strengths>],
  "weaknesses": [<list of 3-5 areas to improve>],
  "feedback": "<detailed feedback paragraph>"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse evaluation' },
        { status: 500 }
      );
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Speaking evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate speaking' },
      { status: 500 }
    );
  }
}
