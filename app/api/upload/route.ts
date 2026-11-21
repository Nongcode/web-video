import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkPassword } from "@/lib/store";

// Trình duyệt tải thẳng lên Blob (không qua server nên không bị giới hạn 4.5MB)
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!checkPassword(clientPayload)) throw new Error("Sai mật khẩu");
        if (!pathname.startsWith("videos/")) throw new Error("Đường dẫn không hợp lệ");
        return { allowedContentTypes: ["video/*"], addRandomSuffix: false, maximumSizeInBytes: 5 * 1024 ** 3 };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
