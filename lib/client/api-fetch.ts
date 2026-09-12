export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

function parseJsonSafely(body: string): Record<string, unknown> | null {
  if (!body.trim()) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function throwForErrorResponse(res: Response, body: Record<string, unknown> | null): never {
  if (body?.success === false && typeof body.error === "object" && body.error !== null) {
    const error = body.error as Record<string, unknown>;
    if (typeof error.message === "string" && typeof error.code === "string") {
      throw new ApiClientError(error.message, error.code, res.status);
    }
  }

  const statusMessage =
    res.status === 401 ? "Unauthorized" :
    res.status === 403 ? "Forbidden" :
    res.status === 404 ? "Not found" :
    res.status === 409 ? "Conflict" :
    res.status === 500 ? "Internal server error" :
    `HTTP ${res.status}`;

  throw new ApiClientError(statusMessage, "HTTP_ERROR", res.status);
}

/**
 * Calls an API route and unwraps the standard `{ success: true, data }`
 * envelope. Throws ApiClientError with the server's message/code on failure.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, options);
  } catch (error) {
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      "NETWORK_ERROR",
      0,
    );
  }

  const text = await res.text();
  const json = parseJsonSafely(text);
  const body = json as Record<string, unknown> | null;

  if (res.ok) {
    if (body?.success !== true || body.data === undefined) {
      throw new ApiClientError("Invalid server response", "INVALID_RESPONSE", res.status);
    }
    return body.data as T;
  }

  throwForErrorResponse(res, body);
}

async function apiJsonMethod<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  body: unknown,
  options?: Omit<RequestInit, "method" | "body">,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method,
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body),
  });
}

export async function apiPost<T>(path: string, body: unknown, options?: Omit<RequestInit, "method" | "body">): Promise<T> {
  return apiJsonMethod<T>("POST", path, body, options);
}

export async function apiPatch<T>(path: string, body: unknown, options?: Omit<RequestInit, "method" | "body">): Promise<T> {
  return apiJsonMethod<T>("PATCH", path, body, options);
}
