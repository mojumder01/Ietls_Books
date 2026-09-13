import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { writing, topic, difficulty } = await request.json();

    if (!writing || !topic) {
      return NextResponse.json(
        { error: 'Writing and topic are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an IELTS writing evaluator. Evaluate the following IELTS writing based on the criteria:
- Lexical Resources (Vocabulary)
- Grammatical Accuracy
- Cohesion & Coherence
- Task Achievement

Writing Topic: ${topic}
Difficulty Level: ${difficulty}

WRITING:
${writing}

Provide your evaluation in this JSON format:
{
  "bandScore": <number 0-9>,
  "score": <number 0-100>,
  "lexicalResources": <number 0-9>,
  "grammaticalAccuracy": <number 0-9>,
  "cohesionCoherence": <number 0-9>,
  "taskAchievement": <number 0-9>,
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
    console.error('Writing evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate writing' },
      { status: 500 }
    );
  }
}
