import { NextResponse } from "next/server";
import { checkPassword, denied } from "@/lib/store";

export async function POST(request: Request) {
  const { password } = await request.json();
  return checkPassword(password) ? NextResponse.json({ ok: true }) : denied();
}
