type GraphQLErrorResponse = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorResponse[];
};

function isGraphQLResponse<T>(value: unknown): value is GraphQLResponse<T> {
  return typeof value === "object" && value !== null;
}

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }

  if (!isGraphQLResponse<T>(body)) {
    throw new Error("Cannot reach the server. Please try again.");
  }

  if (body.errors?.length) {
    throw new Error(body.errors[0].message);
  }

  if (!response.ok || body.data === undefined) {
    throw new Error("Cannot reach the server. Please try again.");
  }

  return body.data;
}
