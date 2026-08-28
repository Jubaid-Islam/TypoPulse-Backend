import { auth } from "./lib/auth";

export async function createContext(request: Request, res?: any) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return {
    userId: session?.user?.id ?? null,
    user: session?.user ?? null,
    headers: request.headers,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
