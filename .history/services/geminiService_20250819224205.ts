import { GoogleGenAI, Type } from "@google/genai";
import { SelfIntroductionFeedback, TechnicalQAFeedback, CodingFeedback, AptitudeQuestion, AptitudeFeedback, HRFeedback } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please create a .env file in the project root.");
}

const ai = new GoogleGenAI({ apiKey });

// Curated profile map to tailor interview content per selection (language/framework/track)
type Profile = {
  kind: 'Language' | 'Framework' | 'Track';
  topics: string[];
  codingLanguage: string; // which language to use in code fences and starter
  challengeStyle: string; // instruction for the type of coding task
  starterTemplate: string; // default starter code to use/require
};

const PROFILE_MAP: Record<string, Profile> = {
  // Languages
  JavaScript: {
    kind: 'Language',
    topics: [
      'scopes and closures', 'event loop and microtasks', 'promises vs async/await',
      'array/object manipulation', 'ES modules vs CommonJS', 'this binding and arrow functions'
    ],
    codingLanguage: 'javascript',
    challengeStyle: 'Algorithmic or data-structure problem solvable in 20 minutes.',
    starterTemplate: `function solve(input) {
  // TODO: implement
  return null;
}

// Example usage:
// console.log(solve(/* your input */));
`,
  },
  TypeScript: {
    kind: 'Language',
    topics: ['types vs interfaces', 'generics', 'narrowing', 'utility types', 'modules', 'strict mode'],
    codingLanguage: 'typescript',
    challengeStyle: 'Algorithm with type-safe function signature.',
    starterTemplate: `export function solve<T>(input: T): unknown {
  // TODO: implement
  return null;
}
`,
  },
  Python: {
    kind: 'Language',
    topics: ['data structures', 'list/dict/set comprehensions', 'decorators', 'generators/iterators', 'OOP basics', 'virtual env'],
    codingLanguage: 'python',
    challengeStyle: 'Algorithmic function or simple class method.',
    starterTemplate: `def solve(input):
    """TODO: implement"""
    return None

if __name__ == "__main__":
    pass
`,
  },
  Java: {
    kind: 'Language',
    topics: ['OOP', 'collections framework', 'generics', 'streams', 'exceptions', 'JVM basics'],
    codingLanguage: 'java',
    challengeStyle: 'Class with a static method implementing the algorithm.',
    starterTemplate: `public class Solution {
    public static Object solve(Object input) {
        // TODO: implement
        return null;
    }
}
`,
  },
  'C++': {
    kind: 'Language',
    topics: ['value vs reference', 'RAII', 'STL containers/algorithms', 'smart pointers', 'move semantics'],
    codingLanguage: 'cpp',
    challengeStyle: 'Function implementing the algorithm; prefer STL.',
    starterTemplate: `#include <bits/stdc++.h>
using namespace std;

auto solve(/* your params */) {
    // TODO: implement
    return 0;
}

int main(){
    // cout << solve(...);
    return 0;
}
`,
  },
  'C#': {
    kind: 'Language',
    topics: ['LINQ', 'async/await', 'collections', 'OOP', 'generics', 'memory management basics'],
    codingLanguage: 'csharp',
    challengeStyle: 'Static method in a class; use LINQ where suitable.',
    starterTemplate: `public static class Solution {
    public static object Solve(object input) {
        // TODO: implement
        return null;
    }
}
`,
  },
  Go: {
    kind: 'Language',
    topics: ['goroutines and channels', 'interfaces', 'slices vs arrays', 'error handling', 'packages/modules'],
    codingLanguage: 'go',
    challengeStyle: 'Function with clear signature and tests in mind.',
    starterTemplate: `package main

func Solve(input any) any {
    // TODO: implement
    return nil
}

func main() {}
`,
  },
  Rust: {
    kind: 'Language',
    topics: ['ownership and borrowing', 'lifetimes (intro)', 'Option/Result', 'iterators', 'collections'],
    codingLanguage: 'rust',
    challengeStyle: 'Function with clear types and Result where appropriate.',
    starterTemplate: `pub fn solve<T>(_input: T) -> Option<String> {
    // TODO: implement
    None
}

fn main() {}
`,
  },

  // Frameworks
  React: {
    kind: 'Framework',
    topics: ['hooks (useState, useEffect)', 'props vs state', 'memoization', 'keys & lists', 'controlled components', 'performance'],
    codingLanguage: 'tsx',
    challengeStyle: 'Build a small functional component with props and state.',
    starterTemplate: `import { useState } from 'react';

export function Widget({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial);
  // TODO: implement required behavior
  return <div>{value}</div>;
}
`,
  },
  Angular: {
    kind: 'Framework',
    topics: ['components', 'modules', 'dependency injection', 'RxJS basics', 'templates', 'routing basics'],
    codingLanguage: 'typescript',
    challengeStyle: 'Implement a service or component method with RxJS.',
    starterTemplate: `import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  fetch(): Observable<string> {
    // TODO: implement
    return of('');
  }
}
`,
  },
  Vue: {
    kind: 'Framework',
    topics: ['reactivity', 'computed vs watch', 'components/props', 'composition API basics', 'routing basics'],
    codingLanguage: 'javascript',
    challengeStyle: 'Implement a composable or component logic.',
    starterTemplate: `export default {
  name: 'Widget',
  props: { initial: Number },
  data() { return { value: this.initial } },
  // TODO: implement behavior
}
`,
  },
  Svelte: {
    kind: 'Framework',
    topics: ['reactivity with $', 'props', 'stores basics', 'bindings', 'events'],
    codingLanguage: 'javascript',
    challengeStyle: 'Small component logic demonstrating reactivity.',
    starterTemplate: `<script>
  export let initial = 0;
  let value = initial;
  // TODO: implement behavior
</script>

<div>{value}</div>
`,
  },
  'Next.js': {
    kind: 'Framework',
    topics: ['routing', 'data fetching (SSR/SSG)', 'API routes basics', 'metadata', 'dynamic routes'],
    codingLanguage: 'typescript',
    challengeStyle: 'Implement a simple server component or API handler.',
    starterTemplate: `export async function GET() {
  // TODO: implement API handler
  return new Response(JSON.stringify({ ok: true }));
}
`,
  },
  'Express.js': {
    kind: 'Framework',
    topics: ['routing', 'middleware', 'error handling', 'request validation', 'async handlers'],
    codingLanguage: 'javascript',
    challengeStyle: 'Implement an Express route handler/middleware.',
    starterTemplate: `export function handler(req, res, next) {
  try {
    // TODO: implement
    res.json({ ok: true });
  } catch (err) { next(err); }
}
`,
  },
  NestJS: {
    kind: 'Framework',
    topics: ['modules/controllers/services', 'decorators', 'providers/DI', 'pipes/guards basics'],
    codingLanguage: 'typescript',
    challengeStyle: 'Implement a service method or controller handler.',
    starterTemplate: `import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  compute(input: unknown): unknown {
    // TODO: implement
    return null;
  }
}
`,
  },
  Django: {
    kind: 'Framework',
    topics: ['models', 'ORM queries', 'views basics', 'forms/validation basics', 'settings & migrations'],
    codingLanguage: 'python',
    challengeStyle: 'Implement a model method or view logic.',
    starterTemplate: `from django.http import JsonResponse

def handler(request):
    # TODO: implement
    return JsonResponse({ 'ok': True })
`,
  },
  Flask: {
    kind: 'Framework',
    topics: ['routing', 'request/response', 'blueprints basics', 'validation basics'],
    codingLanguage: 'python',
    challengeStyle: 'Implement a route function.',
    starterTemplate: `from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/task', methods=['POST'])
def task():
    # TODO: implement
    return jsonify({ 'ok': True })
`,
  },
  FastAPI: {
    kind: 'Framework',
    topics: ['path/query/body params', 'Pydantic models basics', 'responses', 'dependency injection basics'],
    codingLanguage: 'python',
    challengeStyle: 'Implement an endpoint function.',
    starterTemplate: `from fastapi import FastAPI
app = FastAPI()

@app.get('/status')
def status():
    # TODO: implement
    return { 'ok': True }
`,
  },
  'Spring Boot': {
    kind: 'Framework',
    topics: ['controllers', 'services', 'dependency injection', 'REST basics', 'validation basics'],
    codingLanguage: 'java',
    challengeStyle: 'Implement a service method or controller handler.',
    starterTemplate: `import org.springframework.web.bind.annotation.*;

@RestController
public class ExampleController {
    @GetMapping("/status")
    public Object status() {
        // TODO: implement
        return java.util.Map.of("ok", true);
    }
}
`,
  },
  'ASP.NET Core': {
    kind: 'Framework',
    topics: ['controllers', 'dependency injection', 'middleware basics', 'routing', 'model binding'],
    codingLanguage: 'csharp',
    challengeStyle: 'Implement a controller action or service method.',
    starterTemplate: `using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class StatusController : ControllerBase {
    [HttpGet]
    public IActionResult Get() {
        // TODO: implement
        return Ok(new { ok = true });
    }
}
`,
  },
  'Ruby on Rails': {
    kind: 'Framework',
    topics: ['MVC basics', 'ActiveRecord', 'routes', 'controllers/actions', 'validations'],
    codingLanguage: 'ruby',
    challengeStyle: 'Implement a controller action or model validation.',
    starterTemplate: `class StatusController < ApplicationController
  def show
    # TODO: implement
    render json: { ok: true }
  end
end
`,
  },
  Laravel: {
    kind: 'Framework',
    topics: ['routing', 'controllers', 'Eloquent basics', 'validation', 'service container basics'],
    codingLanguage: 'php',
    challengeStyle: 'Implement a controller method.',
    starterTemplate: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class StatusController extends Controller {
    public function show(Request $request) {
        // TODO: implement
        return response()->json(['ok' => true]);
    }
}
`,
  },

  // Tracks
  'Full-Stack (MERN)': {
    kind: 'Track',
    topics: ['MongoDB basics', 'Express routing', 'React components', 'Node async patterns', 'RESTful design'],
    codingLanguage: 'javascript',
    challengeStyle: 'Implement an Express route or React utility related to MERN tasks.',
    starterTemplate: `// Express route handler example
export function handler(req, res) {
  // TODO: implement
  res.json({ ok: true });
}
`,
  },
  'Data Science (Python)': {
    kind: 'Track',
    topics: ['NumPy', 'Pandas', 'data cleaning', 'basic ML', 'visualization basics'],
    codingLanguage: 'python',
    challengeStyle: 'Implement a function manipulating a dataset (no external files).',
    starterTemplate: `def transform(df):
    """df: pandas.DataFrame -> pandas.DataFrame"""
    # TODO: implement
    return df
`,
  },
  'Android (Kotlin)': {
    kind: 'Track',
    topics: ['activities/fragments basics', 'coroutines', 'ViewModel basics', 'collections and null-safety'],
    codingLanguage: 'kotlin',
    challengeStyle: 'Implement a pure Kotlin function or small class method (no Android framework required).',
    starterTemplate: `object Solution {
    fun solve(input: Any?): Any? {
        // TODO: implement
        return null
    }
}
`,
  },
  'iOS (Swift)': {
    kind: 'Track',
    topics: ['optionals', 'structs/classes', 'protocols', 'value semantics', 'collections'],
    codingLanguage: 'swift',
    challengeStyle: 'Implement a pure Swift function (no UIKit/SwiftUI required).',
    starterTemplate: `func solve(_ input: Any?) -> Any? {
    // TODO: implement
    return nil
}
`,
  },
};

function getProfile(selection: string): Profile | undefined {
  return PROFILE_MAP[selection];
}

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
    const profile = getProfile(language);
    const topicsLine = profile ? `Focus on these topics: ${profile.topics.join(', ')}.` : 'Focus on core language/framework fundamentals.';
    const roleLine = profile ? `You are a senior interviewer for an entry-level ${profile.kind.toLowerCase()} candidate in ${language}.` : `You are a senior interviewer for an entry-level ${language} candidate.`;
    const countLine = 'Generate 8 to 10 unique, foundational technical interview questions.';
    const qualityLine = 'Keep each question concise and unambiguous. Avoid trick questions and multi-part scenarios. Do not repeat or rephrase questions.';
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${roleLine} ${countLine} ${topicsLine} ${qualityLine}`,
        config: {
            systemInstruction: `Generate high-quality technical questions tailored to ${language}. Ensure coverage breadth across the specified topics. Output JSON array of strings only.`,
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

    const profile = getProfile(language);
    const codingLang = profile?.codingLanguage ?? language.toLowerCase();
    const challengeStyle = profile?.challengeStyle ?? 'Algorithmic problem with a clear function signature.';
    const starter = profile?.starterTemplate ?? '';

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a unique, medium-difficulty coding challenge for a ${language} candidate. The problem should be solvable within 15–20 minutes. Style: ${challengeStyle}\n\nYou MUST return JSON with keys: title, description, defaultCode. For defaultCode, use the following starter EXACTLY as the starting point (do not alter surrounding structure, only fill TODO when the candidate writes their solution):\n\n---STARTER-BEGIN---\n${starter}\n---STARTER-END---\n\nDo NOT include test cases or I/O code in defaultCode.`,
        config: {
            systemInstruction: "You are an expert problem setter for coding interviews.",
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    const parsed = JSON.parse(response.text);
    // Fallback to our curated starter if the model ignores it
    if (!parsed.defaultCode || typeof parsed.defaultCode !== 'string' || parsed.defaultCode.trim().length === 0) {
        parsed.defaultCode = starter;
    }
    // Normalize code fence language when present
    if (typeof parsed.defaultCode === 'string' && !parsed.defaultCode.startsWith('```')) {
        parsed.defaultCode = `\`\`\`${codingLang}\n${parsed.defaultCode}\n\`\`\``;
    }
    return parsed;
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

export async function generateHRQuestions(): Promise<{ question: string; category: string; }[]> {
    const hrQuestionsSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The HR interview question text." },
                category: { type: Type.STRING, description: "Category of the question: behavioral, situational, motivational, teamwork, or leadership." }
            },
            required: ["question", "category"]
        }
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 5 diverse HR interview questions covering different categories: behavioral, situational, motivational, teamwork, and leadership. These should be relevant for entry-level software developer positions.`,
        config: {
            systemInstruction: "You are an expert HR manager creating interview questions for software developer candidates. Generate questions that assess soft skills, communication, and cultural fit.",
            responseMimeType: "application/json",
            responseSchema: hrQuestionsSchema
        }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as { question: string; category: string; }[];
}

export async function evaluateHRResponse(questions: { question: string; category: string; }[], responses: string[]): Promise<HRFeedback> {
    const qaPairs = questions.map((q, i) => ({ 
        question: q.question, 
        category: q.category,
        response: responses[i] || "Not Answered" 
    }));

    const hrFeedbackSchema = {
        type: Type.OBJECT,
        properties: {
            ...feedbackSchema.properties,
            communication: { type: Type.INTEGER, description: "Score from 1-10 for communication skills" },
            problemSolving: { type: Type.INTEGER, description: "Score from 1-10 for problem-solving approach" },
            culturalFit: { type: Type.INTEGER, description: "Score from 1-10 for cultural fit and values alignment" },
            leadership: { type: Type.INTEGER, description: "Score from 1-10 for leadership potential" },
            detailedResults: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        response: { type: Type.STRING },
                        evaluation: { type: Type.STRING, description: "Specific feedback on this response" },
                        score: { type: Type.INTEGER, description: "Score from 1-10 for this response" }
                    },
                    required: ["question", "response", "evaluation", "score"]
                }
            }
        },
        required: [...feedbackSchema.required, "communication", "problemSolving", "culturalFit", "leadership", "detailedResults"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here are the candidate's responses to HR interview questions:\n\n${JSON.stringify(qaPairs)}\n\nEvaluate each response individually and provide an overall assessment. Consider communication skills, problem-solving approach, cultural fit, and leadership potential.`,
        config: {
            systemInstruction: "You are an expert HR manager evaluating interview responses. Assess communication, problem-solving, cultural fit, and leadership potential. Be fair and constructive.",
            responseMimeType: "application/json",
            responseSchema: hrFeedbackSchema
        }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as HRFeedback;
}