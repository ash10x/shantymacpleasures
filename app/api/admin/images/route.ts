import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/server/lib/auth";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");
const PUBLIC_PREFIX = "/images/products";
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function normalizeExt(ext: string) {
  const lower = ext.toLowerCase();
  return lower === ".jpeg" ? ".jpg" : lower;
}

async function ensureAuth() {
  const session = await getSession();
  return Boolean(session);
}

async function ensureDir() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

export async function GET() {
  if (!(await ensureAuth())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await ensureDir();
  const files = await fs.readdir(IMAGES_DIR, { withFileTypes: true });

  const images = files
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `${PUBLIC_PREFIX}/${name}`);

  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  if (!(await ensureAuth())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No image file received" }, { status: 400 });
  }

  const rawExt = normalizeExt(path.extname(file.name));
  if (!ALLOWED_EXT.has(rawExt)) {
    return NextResponse.json({ message: "Unsupported image format" }, { status: 400 });
  }

  await ensureDir();

  const baseName = path
    .basename(file.name, path.extname(file.name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "product";

  const filename = `${baseName}-${randomUUID().slice(0, 8)}${rawExt}`;
  const savePath = path.join(IMAGES_DIR, filename);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(savePath, Buffer.from(bytes));

  return NextResponse.json({ path: `${PUBLIC_PREFIX}/${filename}` });
}

export async function DELETE(req: NextRequest) {
  if (!(await ensureAuth())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const imagePath = req.nextUrl.searchParams.get("path");
  if (!imagePath || !imagePath.startsWith(`${PUBLIC_PREFIX}/`)) {
    return NextResponse.json({ message: "Invalid image path" }, { status: 400 });
  }

  const filename = path.basename(imagePath);
  const fullPath = path.join(IMAGES_DIR, filename);

  try {
    await fs.unlink(fullPath);
  } catch {
    return NextResponse.json({ message: "Image not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
