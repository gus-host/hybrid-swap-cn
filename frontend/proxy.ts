import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Clone the request headers and set a new header `x-hello-from-proxy1`
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-pathname", pathname);

  // You can also set request headers in NextResponse.next
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  });

  return response;
}
