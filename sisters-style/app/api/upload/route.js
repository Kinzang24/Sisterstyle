import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image too large — please use one under 5MB" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, WEBP, or GIF image" }, { status: 400 });
  }

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const filename = `${uuidv4()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload] Blob upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed — check that Blob storage is set up (BLOB_READ_WRITE_TOKEN)" },
      { status: 500 }
    );
  }
}
