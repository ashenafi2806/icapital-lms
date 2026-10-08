"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gql } from "@/lib/graphql";

type Question = {
  text: string;
  options: string[];
  correctIndex: number;
};

type Exam = {
  id: string;
  title: string;
  passingThreshold: number;
  questions: Question[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  stepOrder: number;
  exams: Exam[];
};

type CourseResponse = { getCourse: Course };

const COURSE_QUERY = `
  query GetCourse($id: String!) {
    getCourse(id: $id) {
      id
      title
      description
      stepOrder
      exams {
        id
        title
        courseId
        passingThreshold
        questions {
          text
          options
          correctIndex
        }
      }
    }
  }
`;

export default function CourseDetailsPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !params.id) {
      return;
    }

    let active = true;
    void gql<CourseResponse>(COURSE_QUERY, { id: params.id }, token)
      .then((response) => {
        if (active) {
          setCourse({
            ...response.getCourse,
            exams: Array.isArray(response.getCourse?.exams)
              ? response.getCourse.exams
              : [],
          });
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load course details.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id, token]);

  if (loading) {
    return <p className="text-sm text-gray-600">Loading course details...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!course) {
    return <p className="text-sm text-gray-600">Course not found.</p>;
  }

  return (
    <section>
      <Link href="/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
        ← Back to courses
      </Link>
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          Step {course.stepOrder}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">{course.title}</h1>
        <p className="mt-3 leading-7 text-gray-600">{course.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Exams ({course.exams.length})
          </h2>
          <Link
            href={`/courses/${course.id}/exams/new`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add exam
          </Link>
        </div>
      </div>

      {course.exams.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
          No exams have been added to this course yet.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {course.exams.map((exam) => (
            <article key={exam.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{exam.title}</h2>
              <p className="mt-1 text-sm text-gray-600">
                Passing threshold: {exam.passingThreshold}% · {exam.questions.length} questions
              </p>
              <div className="mt-5 space-y-4">
                {exam.questions.map((question, index) => (
                  <div key={`${exam.id}-${index}`} className="rounded-lg bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-gray-600">
                      {question.options.map((option, optionIndex) => (
                        <li
                          key={`${exam.id}-${index}-${optionIndex}`}
                          className={optionIndex === question.correctIndex ? "font-medium text-green-700" : ""}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {optionIndex === question.correctIndex && " (Correct answer)"}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
