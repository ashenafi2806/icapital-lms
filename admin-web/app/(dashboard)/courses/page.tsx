"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { gql } from "@/lib/graphql";

type Course = {
  id: string;
  title: string;
  description: string;
  stepOrder: number;
  examsCount: number;
  exams: ExamSummary[];
};

type ExamSummary = {
  id: string;
  title: string;
  passingThreshold: number;
  questionCount: number;
};

type CoursesResponse = {
  getCourses: Course[];
};

type CreateCourseResponse = {
  createCourse: Course;
};

const COURSES_QUERY = `
  query GetCourses {
    getCourses {
      id
      title
      description
      stepOrder
      examsCount
      exams { id title passingThreshold questionCount }
    }
  }
`;

const CREATE_COURSE_MUTATION = `
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      description
      stepOrder
      examsCount
      exams { id title passingThreshold questionCount }
    }
  }
`;

export default function CoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepOrder, setStepOrder] = useState("");

  const refreshCourses = useCallback(async (): Promise<void> => {
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await gql<CoursesResponse>(
        COURSES_QUERY,
        undefined,
        token,
      );
      setCourses(
        (response.getCourses ?? []).map((course) => ({
          ...course,
          exams: Array.isArray(course.exams) ? course.exams : [],
        })),
      );
      setError(null);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load courses. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const refresh = window.setTimeout(() => {
      void refreshCourses();
    }, 0);
    return () => window.clearTimeout(refresh);
  }, [refreshCourses]);

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await gql<CreateCourseResponse>(
        CREATE_COURSE_MUTATION,
        {
          input: {
            title,
            description,
            stepOrder: Number(stepOrder),
          },
        },
        token,
      );
      setTitle("");
      setDescription("");
      setStepOrder("");
      await refreshCourses();
    } catch (cause: unknown) {
      setCreateError(
        cause instanceof Error
          ? cause.message
          : "Unable to create course. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Courses</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage the courses available in the learning platform.
      </p>

      <form
        className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        onSubmit={handleCreateCourse}
      >
        <h2 className="text-lg font-semibold text-gray-900">Add course</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Step number
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="number"
              min="0"
              value={stepOrder}
              onChange={(event) => setStepOrder(event.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Description
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>
        </div>
        {createError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {createError}
          </div>
        )}
        <button
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={creating}
        >
          {creating ? "Adding course..." : "Add course"}
        </button>
      </form>

      {loading && <p className="mt-8 text-sm text-gray-600">Loading courses...</p>}

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
          No courses found.
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                Step {course.stepOrder}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {course.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {course.description}
              </p>
              <p className="mt-4 text-sm font-medium text-gray-500">
                {course.examsCount}{" "}
                {course.examsCount === 1 ? "exam" : "exams"}
              </p>
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {course.exams.map((exam) => (
                  <div key={exam.id} className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{exam.title}</span>
                    <span className="ml-2">{exam.questionCount} questions</span>
                  </div>
                ))}
                <Link
                  href={`/courses/${course.id}/exams/new`}
                  className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Add exam
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
