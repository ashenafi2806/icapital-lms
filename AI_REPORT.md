# AI Development Report

## Scope

This report summarizes the AI-assisted engineering work that led to the
working backend, admin portal, and Flutter student application. It focuses on
three real integration findings:

1. The `courses` versus `getCourses` operation mismatch and the missing `name`
   field mismatch.
2. The missing per-student `status` field.
3. The `correctIndex` leak in student-facing GraphQL responses.

The backend schema was treated as the source of truth. The mobile client was
then aligned to the actual GraphQL operation names, input types, and return
fields instead of relying on guessed names.

## Example 1: GraphQL operation and field mismatches

### Symptoms

The first mobile implementation assumed a query named `courses` and requested
`user.name`. The deployed GraphQL schema rejected those requests because:

- The actual course query was `getCourses`.
- `UserType` exposed `id`, `email`, and `role`, but no `name`.
- `RegisterInput` accepted only `email` and `password`; it did not accept a
  `name` field.

These failures demonstrate why a client should be generated from or verified
against the live schema rather than inferred from a UI model.

### Investigation

The backend source was inspected before changing the client:

- `backend/src/course/course.resolver.ts`
- `backend/src/auth/auth.resolver.ts`
- `backend/src/auth/dto/*.input.ts`
- `backend/src/auth/dto/user.type.ts`
- `backend/src/course/dto/*.type.ts`

The real operations and types were confirmed from the resolver and DTO
definitions.

### Correction

The mobile client was changed to use:

```graphql
query GetCourses {
  getCourses {
    id
    title
    description
    stepOrder
    status
  }
}
```

Authentication selection sets stopped requesting `name`, and registration
sent only fields accepted by the backend:

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    user {
      id
      email
      role
    }
  }
}
```

The Dart `User` model keeps `name` nullable for compatibility with local model
code, but the GraphQL client no longer expects the field from this backend.

### Result

The mobile application could authenticate against the deployed API and load
the student's courses. The final client operations are:

- `login`
- `register`
- `getCourses`
- `getCourse`
- `submitExam`

## Example 2: Missing per-student course status

### Problem

Courses were returned with title, description, step order, and exam data, but
there was no indication whether the current student had started or completed a
course. The mobile badges therefore could not represent actual progress.

### Backend change

A GraphQL enum was added and registered:

```text
ProgressStatus:
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
```

The `status` field was added to both:

- `backend/src/course/dto/course.type.ts`
- `backend/src/course/dto/course-detail.type.ts`

The authenticated user ID comes from the existing JWT-backed
`@CurrentUser()` decorator.

### Query design

The course service loads course progress in the course query using a filtered
relation include:

```text
course.findMany({
  include: {
    progress: {
      where: { userId },
      select: { status: true },
      take: 1
    }
  }
})
```

The detail query uses the same pattern with `course.findUnique`.

This avoids an N+1 query pattern. Missing progress maps to
`NOT_STARTED`.

### Submission behavior

Exam submission updates `StudentProgress` in the same Prisma transaction as
the `ExamAttempt` creation:

- Failed result: `IN_PROGRESS`
- Passed result: `COMPLETED`
- Existing `COMPLETED`: preserved and never downgraded

### Client result

The Flutter course list displays:

- Not Started
- In Progress
- Passed

After a successful submission, the mobile app invalidates both the course list
provider and the course detail provider so the status is refreshed from the
backend.

## Example 3: `correctIndex` leak

### Vulnerability

Exam questions were stored as JSON objects containing the correct answer:

```json
{
  "text": "Example question",
  "options": ["A", "B", "C"],
  "correctIndex": 1
}
```

The internal grading service needed `correctIndex`, but the student-facing
GraphQL `QuestionType` also exposed it. A student could inspect the GraphQL
response and learn every answer without completing the exam.

### Investigation

The following files were reviewed:

- `backend/src/exam/dto/question.type.ts`
- `backend/src/exam/dto/exam.type.ts`
- `backend/src/exam/exam.service.ts`
- `backend/src/course/course.service.ts`

The internal service parser correctly needed the field for grading, so the
problem was the output type, not the stored grading data.

### Correction

`correctIndex` was removed from the student-facing GraphQL type. The public
question shape now contains only:

```graphql
type QuestionType {
  text: String!
  options: [String!]!
}
```

The Flutter detail query also requests only:

```graphql
questions {
  text
  options
}
```

The backend still parses and uses `correctIndex` internally inside
`submitExam`; it is never serialized into a student response.

### Result

Students can answer by selecting option indices, while the server remains the
only component that knows the correct answers. The mobile quiz can submit the
answers without displaying or expecting any correct-answer field.

## Validation performed

The relevant application checks completed successfully during development:

- Backend TypeScript build.
- Backend lint.
- Flutter `analyze`.
- Flutter tests.
- Flutter release APK build.
- Release APK installation and launch on the Android emulator.
- Manual login and course loading through the deployed API.
- Manual quiz navigation and submission flow.

The release artifact is available as
[LMS Student App v1.0.0](https://github.com/ashenafi2806/icapital-lms/releases/tag/v1.0.0).

## Lessons

- Verify GraphQL names and fields directly from resolver and DTO definitions.
- Keep client models tolerant only where compatibility is intentional; do not
  request fields the schema does not expose.
- Load authenticated progress in the main course query to avoid N+1 queries.
- Separate internal grading data from public GraphQL output types.
- Treat every field in a student-facing GraphQL type as potentially visible to
  the student.
