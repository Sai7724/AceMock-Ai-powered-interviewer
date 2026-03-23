import { GoogleGenAI, Type } from "@google/genai";
import { SelfIntroductionFeedback, TechnicalQAFeedback, CodingFeedback, AptitudeQuestion, AptitudeFeedback, HRFeedback } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please create a .env file in the project root.");
}

const ai = new GoogleGenAI({ apiKey });

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive aspects of the response."},
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas that need improvement."},
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable tips for improvement."},
        score: { type: Type.INTEGER, description: "A score from 1 to 10 evaluating the overall performance."}
    },
    required: ["strengths", "weaknesses", "suggestions", "score"]
};

export async function analyzeSelfIntroduction(introduction: string): Promise<SelfIntroductionFeedback> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following self-introduction: "${introduction}". Evaluate it based on clarity, confidence, and structure. Provide a score out of 10.`,
    config: {
        systemInstruction: "You are an expert HR manager and interview coach evaluating a candidate's self-introduction.",
        responseMimeType: "application/json",
        responseSchema: feedbackSchema
    }
  });

  const jsonResponse = JSON.parse(response.text);
  return jsonResponse as SelfIntroductionFeedback;
}

export async function generateAptitudeQuestions(count: number): Promise<AptitudeQuestion[]> {
    const aptitudeSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The aptitude question text." },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 multiple-choice options." },
                answer: { type: Type.STRING, description: "The correct answer from the options array." }
            },
            required: ["question", "options", "answer"]
        }
    };
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate ${count} unique, medium-difficulty quantitative and logical reasoning aptitude questions suitable for a pre-employment screening test. Each question must have exactly 4 multiple-choice options. Ensure one option is the correct answer.`,
        config: {
            systemInstruction: "You are an expert test creator. Generate clear and unambiguous questions and answers.",
            responseMimeType: "application/json",
            responseSchema: aptitudeSchema
        }
    });
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as AptitudeQuestion[];
}

export async function evaluateAptitudePerformance(questions: AptitudeQuestion[], userAnswers: string[]): Promise<AptitudeFeedback> {
    const detailedResults = questions.map((q, i) => ({
        question: q.question,
        userAnswer: userAnswers[i] || "Not Answered",
        correctAnswer: q.answer,
        isCorrect: userAnswers[i] === q.answer
    }));
    const correctCount = detailedResults.filter(r => r.isCorrect).length;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `A candidate took an aptitude test. Here are their results:\n${JSON.stringify(detailedResults)}\n\nProvide an overall evaluation of their performance. Give a score from 1-10. Identify strengths (e.g., strong logical reasoning) and weaknesses (e.g., difficulty with percentages). Offer suggestions for improvement.`,
        config: {
            systemInstruction: "You are an expert test evaluator. Analyze the user's performance and provide constructive feedback.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ...feedbackSchema.properties
                }
            }
        }
    });

    const feedbackPart = JSON.parse(response.text);

    return {
        ...feedbackPart,
        correctCount,
        totalQuestions: questions.length,
        detailedResults,
    };
}

export async function generateTechnicalQuestions(language: string): Promise<string[]> {
    const questionListSchema = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of technical interview questions"
    };
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a list of 8 to 10 unique, foundational technical interview questions for an entry-level ${language} developer. The questions should cover core concepts and fundamentals. For example, if Python, ask about list vs tuple, GIL, or decorators. Avoid complex, multi-part scenario questions.`,
        config: {
            systemInstruction: `You are a senior software engineer creating interview questions for freshers in ${language}. Do not repeat questions.`,
            responseMimeType: "application/json",
            responseSchema: questionListSchema,
        }
    });
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as string[];
}

export async function evaluateTechnicalAnswers(questions: string[], answers: string[], language: string): Promise<TechnicalQAFeedback> {
    const qaPairs = questions.map((q, i) => ({ question: q, answer: answers[i] || "Not Answered" }));

    const technicalQASchema = {
        ...feedbackSchema,
        properties: {
            ...feedbackSchema.properties,
            questionCount: { type: Type.INTEGER },
            detailedResults: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                        evaluation: { type: Type.STRING, description: "Specific feedback on this answer's technical accuracy and clarity." },
                        score: { type: Type.INTEGER, description: "A score from 1 to 10 for this specific answer." }
                    },
                    required: ["question", "answer", "evaluation", "score"]
                }
            }
        },
        required: [...feedbackSchema.required, "questionCount", "detailedResults"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Language context: ${language}\n\nHere are the candidate's answers to a series of technical questions:\n\n${JSON.stringify(qaPairs)}\n\nFirst, for each question/answer pair, provide a specific evaluation and a score from 1-10. Then, provide an overall summary of performance: overall score, strengths, weaknesses, and suggestions.`,
        config: {
            systemInstruction: `You are a senior software engineer and tech interviewer with deep expertise in ${language}. Provide a critical and fair evaluation for each answer and an overall summary.`,
            responseMimeType: "application/json",
            responseSchema: technicalQASchema
        }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as TechnicalQAFeedback;
}

export async function generateCodingChallenge(language: string): Promise<{ title: string; description: string; defaultCode: string; }> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            defaultCode: { type: Type.STRING, description: `Function signature or class structure in ${language}` }
        },
        required: ["title", "description", "defaultCode"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a unique, medium-difficulty coding challenge for a ${language} developer. The problem should be solvable within 15-20 minutes.`,
        config: {
            systemInstruction: "You are an expert problem setter for coding interviews.",
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    return JSON.parse(response.text);
}

export async function evaluateCode(problem: string, language: string, code: string): Promise<CodingFeedback> {
    const codingSchema = {
        ...feedbackSchema,
        properties: {
            ...feedbackSchema.properties,
            logic: { type: Type.STRING, description: "Evaluation of the logical approach and correctness of the algorithm."},
            syntax: { type: Type.STRING, description: "Comments on code style, syntax, and readability."},
            efficiency: { type: Type.STRING, description: "Analysis of the time and space complexity."}
        },
        required: [...feedbackSchema.required, "logic", "syntax", "efficiency"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Coding Challenge: "${problem}"\n\nLanguage: "${language}"\n\nCandidate's Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEvaluate the code for logic, syntax, efficiency, and adherence to the problem description.`,
        config: {
            systemInstruction: "You are an expert code reviewer and competitive programming judge. Be precise and constructive in your feedback.",
            responseMimeType: "application/json",
            responseSchema: codingSchema
        }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as CodingFeedback;
}