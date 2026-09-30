export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (request.headers.get("accept")?.includes("text/html")) {
    const response = NextResponse.redirect(new URL("/login", request.url), 303);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const response = NextResponse.json({ success: true, message: "Berhasil keluar" });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
