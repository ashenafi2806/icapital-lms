"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { gql } from "@/lib/graphql";

type Question = {
  text: string;
  options: string[];
  correctIndex: number | null;
};

type CreateExamResponse = {
  createExam: {
    id: string;
    title: string;
  };
};

const CREATE_EXAM_MUTATION = `
  mutation CreateExam($input: CreateExamInput!) {
    createExam(input: $input) {
      id
      title
    }
  }
`;

const newQuestion = (): Question => ({
  text: "",
  options: ["", ""],
  correctIndex: null,
});

export default function NewExamPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [threshold, setThreshold] = useState("70");
  const [questions, setQuestions] = useState<Question[]>([newQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateQuestion(index: number, update: Partial<Question>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...update } : question,
      ),
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;
        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    );
  }

  function validate(): string | null {
    if (!title.trim()) return "Exam title is required.";
    const numericThreshold = Number(threshold);
    if (!Number.isFinite(numericThreshold) || numericThreshold < 0 || numericThreshold > 100) {
      return "Passing threshold must be between 0 and 100.";
    }
    for (const [index, question] of questions.entries()) {
      const options = question.options.filter((option) => option.trim());
      if (!question.text.trim()) return `Question ${index + 1} needs text.`;
      if (options.length < 2) return `Question ${index + 1} needs at least 2 options.`;
      if (question.correctIndex === null || !question.options[question.correctIndex]?.trim()) {
        return `Question ${index + 1} needs a correct option.`;
      }
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError || !token) {
      setError(validationError ?? "You must be signed in as an admin.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await gql<CreateExamResponse>(
        CREATE_EXAM_MUTATION,
        {
          input: {
            courseId: params.id,
            title: title.trim(),
            passingThreshold: Number(threshold),
            questions: questions.map((question) => ({
              text: question.text.trim(),
              options: question.options.filter((option) => option.trim()),
              correctIndex: question.correctIndex,
            })),
          },
        },
        token,
      );
      setSuccess(`Exam "${response.createExam.title}" was created successfully.`);
      setTimeout(() => router.push("/courses"), 700);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to create exam.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Create exam</h1>
      <form className="mt-6 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Exam title
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Passing threshold
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" type="number" min="0" max="100" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
        </label>
        {questions.map((question, questionIndex) => (
          <fieldset key={questionIndex} className="rounded-lg border border-gray-200 p-4">
            <legend className="px-2 text-sm font-semibold text-gray-900">Question {questionIndex + 1}</legend>
            <input className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Question text" value={question.text} onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })} />
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${questionIndex}`} checked={question.correctIndex === optionIndex} onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })} aria-label={`Mark option ${optionIndex + 1} correct`} />
                  <input className="flex-1 rounded-lg border border-gray-300 px-3 py-2" placeholder={`Option ${optionIndex + 1}`} value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} />
                  {question.options.length > 2 && (
                    <button type="button" className="text-sm text-red-600" onClick={() => {
                      setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, options: item.options.filter((_, i) => i !== optionIndex), correctIndex: item.correctIndex === optionIndex ? null : item.correctIndex } : item));
                    }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <button type="button" className="text-indigo-600 disabled:text-gray-400" disabled={question.options.length >= 6} onClick={() => updateQuestion(questionIndex, { options: [...question.options, ""] })}>Add option</button>
              {questions.length > 1 && <button type="button" className="text-red-600" onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}>Remove question</button>}
            </div>
          </fieldset>
        ))}
        <button type="button" className="text-sm font-medium text-indigo-600" onClick={() => setQuestions((current) => [...current, newQuestion()])}>Add question</button>
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Creating exam..." : "Create exam"}</button>
      </form>
    </section>
  );
}
