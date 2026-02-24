import { createBrowserClient } from "@/lib/supabase-browser";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface AuthError {
  message: string;
  status?: number;
}

interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

interface SignUpData {
  user: { id: string; email: string } | null;
  session: { access_token: string } | null;
}

interface SignInData {
  user: { id: string; email: string } | null;
  session: { access_token: string } | null;
}

interface SignOutResult {
  error: AuthError | null;
  redirectTo: string;
}

function validateEmail(email: string): AuthError | null {
  if (!EMAIL_REGEX.test(email)) {
    return { message: "Invalid email format" };
  }
  return null;
}

function validatePassword(password: string): AuthError | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { message: "Password must be at least 8 characters" };
  }
  return null;
}

export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<SignUpData>> {
  const emailError = validateEmail(email);
  if (emailError) return { data: null, error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { data: null, error: passwordError };

  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { data: null, error };
  if (!data.user) return { data: null, error: { message: "Signup failed" } };

  await supabase.from("user_profile").insert({
    id: data.user.id,
    preferred_language: "en",
    bundesland: null,
  });

  return {
    data: {
      user: data.user ? { id: data.user.id, email: data.user.email! } : null,
      session: data.session
        ? { access_token: data.session.access_token }
        : null,
    },
    error: null,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<SignInData>> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { data: null, error };

  return {
    data: {
      user: data.user ? { id: data.user.id, email: data.user.email! } : null,
      session: data.session
        ? { access_token: data.session.access_token }
        : null,
    },
    error: null,
  };
}

export async function signOut(): Promise<SignOutResult> {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error, redirectTo: "/login" };
}

export async function resetPassword(
  email: string
): Promise<AuthResult<object>> {
  const emailError = validateEmail(email);
  if (emailError) return { data: null, error: emailError };

  const supabase = createBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });

  return { data: error ? null : {}, error };
}

export async function sendMagicLink(
  email: string
): Promise<AuthResult<object>> {
  const emailError = validateEmail(email);
  if (emailError) return { data: null, error: emailError };

  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });

  return { data: error ? null : {}, error };
}
