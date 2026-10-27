const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || `Request failed (${response.status})`,
    );
  }

  return result as T;
}

export const api = {
  register: (body: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) =>
    request<any>("/user/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyRegistrationOtp: (body: { otp: string }) =>
    request<any>("/user/register/otpval", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<any>("/user/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<any>("/user/logout"),

  getAccount: () =>
    request<any>("/user/account"),

  updateProfile: (body: FormData) =>
    request<any>("/user/updateusr", {
      method: "POST",
      body,
    }),

  saveResumeData: () =>
    request<any>("/user/resumedata"),

  fetchResume: () =>
    request<any>("/user/resume/fetchResume"),

  generateMail: (body: {
    companyname: string;
    hrname: string;
    hrmail: string;
    desc: string;
  }) =>
    request<any>("/user/mail/mailcontent", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
