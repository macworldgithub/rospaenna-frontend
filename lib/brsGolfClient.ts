// const BASE_URL = "https://visitors.brsgolf.com";

// function getAuthHeaders() {
//   const cookie = process.env.BRS_GOLF_COOKIE;
//   const xsrfToken = process.env.BRS_GOLF_XSRF_TOKEN;

//   if (!cookie || !xsrfToken) {
//     throw new Error(
//       "Missing BRS_GOLF_COOKIE / BRS_GOLF_XSRF_TOKEN env vars. These rotate " +
//         "(cf_clearance + session cookie + XSRF token) and need to be refreshed periodically."
//     );
//   }
//   return { cookie, xsrfToken };
// }

// const commonHeaders = () => {
//   const { cookie, xsrfToken } = getAuthHeaders();
//   return {
//     Accept: "application/json, text/plain, */*",
//     Referer: `${BASE_URL}/rosapenna`,
//     "X-Requested-With": "XMLHttpRequest",
//     "X-XSRF-TOKEN": xsrfToken,
//     Cookie: cookie,
//     "User-Agent":
//       "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36",
//   };
// };

// export async function fetchTeesheet(date: string, courseId: number) {
//   const url = `${BASE_URL}/api/casualBooking/teesheet?date=${date}&course_id=${courseId}`;
//   const res = await fetch(url, { headers: commonHeaders(), cache: "no-store" });

//   if (!res.ok) {
//     throw new Error(`Teesheet fetch failed: ${res.status} ${res.statusText}`);
//   }
//   return res.json();
// }

// export async function prepareCheckout(payload: unknown) {
//   const url = `${BASE_URL}/api/checkout/prepare`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       ...commonHeaders(),
//       "Content-Type": "application/json",
//       Origin: BASE_URL,
//     },
//     body: JSON.stringify(payload),
//     cache: "no-store",
//   });

//   const data = await res.json().catch(() => null);

//   if (!res.ok) {
//     throw new Error(
//       `Checkout prepare failed: ${res.status} ${res.statusText} ${data ? JSON.stringify(data) : ""}`
//     );
//   }
//   return data;
// }
const BASE_URL = "https://visitors.brsgolf.com";

function mutateLastThreeChars(value: string): string {
  if (!value) return value;

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const randomChars = Array.from({ length: 3 }, () => {
    return chars[Math.floor(Math.random() * chars.length)];
  }).join("");

  if (value.length <= 3) {
    return randomChars;
  }

  return value.slice(0, -3) + randomChars;
}

function getAuthHeaders() {
  const cookie = process.env.BRS_GOLF_COOKIE;
  const xsrfToken = process.env.BRS_GOLF_XSRF_TOKEN;

  if (!cookie || !xsrfToken) {
    throw new Error(
      "Missing BRS_GOLF_COOKIE / BRS_GOLF_XSRF_TOKEN env vars. These rotate " +
        "(cf_clearance + session cookie + XSRF token) and need to be refreshed periodically."
    );
  }

  return {
    cookie: mutateLastThreeChars(cookie),
    xsrfToken: mutateLastThreeChars(xsrfToken),
  };
}

const commonHeaders = () => {
  const { cookie, xsrfToken } = getAuthHeaders();

  return {
    Accept: "application/json, text/plain, */*",
    Referer: `${BASE_URL}/rosapenna`,
    "X-Requested-With": "XMLHttpRequest",
    "X-XSRF-TOKEN": xsrfToken,
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36",
  };
};

export async function fetchTeesheet(date: string, courseId: number) {
  const url = `${BASE_URL}/api/casualBooking/teesheet?date=${date}&course_id=${courseId}`;

  const res = await fetch(url, {
    headers: commonHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Teesheet fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function prepareCheckout(payload: unknown) {
  const url = `${BASE_URL}/api/checkout/prepare`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...commonHeaders(),
      "Content-Type": "application/json",
      Origin: BASE_URL,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Checkout prepare failed: ${res.status} ${res.statusText} ${
        data ? JSON.stringify(data) : ""
      }`
    );
  }

  return data;
}