"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gql } from "@/lib/graphql";

type Progress = {
  courseTitle: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  isPassed: boolean;
  bestScore: number | null;
  attempts: number;
};

type Student = {
  id: string;
  email: string;
  progress: Progress[];
  passedCourseCount: number;
  totalCourseCount: number;
};

type StudentsResponse = { getStudents: Student[] };

const STUDENTS_QUERY = `
  query GetStudents {
    getStudents {
      id email
      progress { courseTitle status isPassed bestScore attempts }
      passedCourseCount totalCourseCount
    }
  }
`;

function statusLabel(progress: Progress): string {
  if (progress.isPassed || progress.status === "COMPLETED") return "Passed";
  if (progress.status === "IN_PROGRESS") return "In Progress";
  return "Not Started";
}

function statusClass(progress: Progress): string {
  if (progress.isPassed || progress.status === "COMPLETED") return "bg-green-100 text-green-700";
  if (progress.status === "IN_PROGRESS") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function StudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await gql<StudentsResponse>(STUDENTS_QUERY, undefined, token);
      setStudents(response.getStudents);
      setError(null);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Students</h1>
          <p className="mt-1 text-sm text-gray-600">Monitor course progress and exam performance.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {loading && <p className="mt-8 text-sm text-gray-600">Loading students...</p>}
      {error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && !error && students.length === 0 && <div className="mt-8 rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">No students found.</div>}
      {!loading && !error && students.length > 0 && (
        <div className="mt-8 space-y-4">
          {students.map((student) => {
            const percentage = student.totalCourseCount ? Math.round((student.passedCourseCount / student.totalCourseCount) * 100) : 0;
            return (
              <article key={student.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{student.email}</h2>
                    <p className="mt-1 text-sm text-gray-600">{student.passedCourseCount} of {student.totalCourseCount} courses passed</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-700">{percentage}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-gray-500">
                      <tr><th className="py-2 pr-4">Course</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Best score</th><th className="py-2">Attempts</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {student.progress.map((item) => (
                        <tr key={item.courseTitle}>
                          <td className="py-3 pr-4 font-medium text-gray-900">{item.courseTitle}</td>
                          <td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item)}`}>{statusLabel(item)}</span></td>
                          <td className="py-3 pr-4 text-gray-600">{item.bestScore === null ? "—" : `${item.bestScore}%`}</td>
                          <td className="py-3 text-gray-600">{item.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
