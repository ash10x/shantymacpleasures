"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, type ProductInput } from "@/server/actions/adminProducts";
import { Pencil, Trash2, Plus, X, Check, Loader2, Upload, RefreshCcw, Eye } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  featured: boolean;
  bestseller: boolean;
};

const empty: ProductInput = {
  name: "", price: 0, quantity: 0, description: "", image: "", imageAlt: "", category: "",
  featured: false, bestseller: false,
};

type UploadMode = "path" | "upload";

async function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load selected image.")));
    image.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Unable to prepare image crop.");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to export cropped image."));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ProductInput>(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("path");
  const [rawPreviewUrl, setRawPreviewUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagesLibrary, setImagesLibrary] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const refresh = () => router.refresh();

  const loadImages = async () => {
    setImagesLoading(true);
    try {
      const res = await fetch("/api/admin/images", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Unable to load images");
      setImagesLibrary(Array.isArray(data.images) ? data.images : []);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  useEffect(() => {
    return () => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    };
  }, [rawPreviewUrl]);

  const clearImageEditor = () => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    setRawPreviewUrl("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const openAdd = () => {
    setForm(empty);
    setUploadMode("path");
    setAdding(true);
    setEditing(null);
    setError("");
    clearImageEditor();
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setUploadMode("path");
    setEditing(p);
    setAdding(false);
    setError("");
    clearImageEditor();
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    clearImageEditor();
  };

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      try {
        if (editing) {
          await updateProduct(editing.id, form);
        } else {
          await createProduct(form);
        }
        closeForm();
        refresh();
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        setDeleteId(null);
        refresh();
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      }
    });
  };

  const handleImageFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);

    const objectUrl = URL.createObjectURL(file);
    setRawPreviewUrl(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleUploadCropped = async () => {
    if (!rawPreviewUrl || !croppedAreaPixels) {
      setError("Select and crop an image before uploading.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const blob = await getCroppedBlob(rawPreviewUrl, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", new File([blob], `product-${Date.now()}.jpg`, { type: "image/jpeg" }));

      const res = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      setForm((prev) => ({ ...prev, image: data.path }));
      setUploadMode("path");
      clearImageEditor();
      await loadImages();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    try {
      const res = await fetch(`/api/admin/images?path=${encodeURIComponent(imagePath)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      if (form.image === imagePath) {
        setForm((prev) => ({ ...prev, image: "" }));
      }
      await loadImages();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const handleUseImage = (imagePath: string) => {
    if (!adding && !editing) {
      setForm({ ...empty, image: imagePath });
      setAdding(true);
      setEditing(null);
      setUploadMode("path");
      return;
    }

    setForm((prev) => ({ ...prev, image: imagePath }));
    setUploadMode("path");
  };

  const field = (key: keyof ProductInput, label: string, type = "text", listId?: string) => (
    <div>
      <label className="admin-kicker mb-1 block">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[key] as string}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          className="admin-textarea"
        />
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          checked={form[key] as boolean}
          onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
          className="w-4 h-4 accent-pink-500"
        />
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={(e) =>
            setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })
          }
          className="admin-field"
          list={listId}
        />
      )}
    </div>
  );

  const checkboxField = (key: "featured" | "bestseller", label: string) => (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
        className="h-4 w-4 accent-pink-500"
      />
      {label}
    </label>
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-copy">{products.length} items in catalogue</p>
        </div>
        <button
          onClick={openAdd}
          className="admin-button-primary"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && (
        <div className="admin-banner-error">{error}</div>
      )}

      {/* Form Panel */}
      {(adding || editing) && (
        <div className="admin-panel admin-panel-body">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">{editing ? "Edit Product" : "New Product"}</h2>
            <button onClick={closeForm} className="admin-button-ghost p-2"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("name", "Name")}
            <div>
              {field("category", "Category", "text", "category-suggestions")}
              <datalist id="category-suggestions">
                {categoryOptions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            {field("price", "Price ($)", "number")}
            {field("quantity", "Quantity", "number")}
            <div className="sm:col-span-2">
              <label className="admin-kicker mb-2 block">Product Image</label>
              <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("path")}
                  className={`rounded-lg px-3 py-1.5 text-sm ${uploadMode === "path" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Use Path
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("upload")}
                  className={`rounded-lg px-3 py-1.5 text-sm ${uploadMode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Upload Image
                </button>
              </div>

              {uploadMode === "path" ? (
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/images/products/example.jpg"
                  className="admin-field"
                />
              ) : (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileSelect(e.target.files?.[0] ?? null)}
                    className="admin-field"
                  />

                  {rawPreviewUrl && (
                    <>
                      <div className="relative h-64 overflow-hidden rounded-xl bg-slate-950">
                        <Cropper
                          image={rawPreviewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                        />
                      </div>
                      <div>
                        <label className="admin-kicker mb-1 block">Zoom</label>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadCropped}
                        disabled={uploadingImage}
                        className="admin-button-primary"
                      >
                        {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        Upload Cropped Image
                      </button>
                    </>
                  )}
                </div>
              )}

              {form.image && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={form.image} alt="Selected product" fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="admin-kicker">Selected image</p>
                    <p className="truncate text-xs text-slate-500">{form.image}</p>
                  </div>
                </div>
              )}
            </div>
            {field("imageAlt", "Image Alt Text", "text")}
            <div className="col-span-full">{field("description", "Description", "textarea")}</div>
            <div className="col-span-full flex flex-wrap items-center gap-3">
              {checkboxField("featured", "Featured")}
              {checkboxField("bestseller", "Bestseller")}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={closeForm} className="admin-button-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="admin-button-primary disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {editing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-panel overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 px-5 py-4">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-field max-w-xs"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="admin-table-wrap">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Flags</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((p) =>
                (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())) &&
                (!categoryFilter || p.category === categoryFilter)
              )
              .map((p) => (
              <tr key={p.id}>
                <td>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="mt-0.5 max-w-50 truncate text-xs text-slate-400">{p.description}</p>
                </td>
                <td>
                  <span className="admin-badge admin-badge-purple">{p.category}</span>
                </td>
                <td className="font-semibold text-slate-800">${p.price}</td>
                <td>{p.quantity}</td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    {p.featured && <span className="admin-badge admin-badge-pink">Featured</span>}
                    {p.bestseller && <span className="admin-badge admin-badge-amber">Bestseller</span>}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-purple-50 hover:text-purple-600"
                    >
                      <Pencil size={15} />
                    </button>
                    {deleteId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                        >
                          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        </button>
                        <button onClick={() => setDeleteId(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {products.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No products yet. Add one above.</p>
        )}
      </div>

      {/* Media Library */}
      <div className="admin-panel admin-panel-body mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Uploaded Images</h2>
            <p className="text-sm text-slate-500">View, select, delete, or upload product images.</p>
          </div>
          <button onClick={() => void loadImages()} className="admin-button-secondary" type="button">
            <RefreshCcw size={15} /> Refresh
          </button>
        </div>

        {imagesLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <Loader2 className="animate-spin" size={18} />
          </div>
        ) : imagesLibrary.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No uploaded images yet. Upload one from the product form.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {imagesLibrary.map((imagePath) => (
              <div key={imagePath} className="rounded-xl border border-slate-200 bg-white p-2">
                <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={imagePath} alt={imagePath} fill className="object-cover" />
                </div>
                <p className="mb-2 truncate text-xs text-slate-500">{imagePath}</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleUseImage(imagePath)}
                    className="admin-button-secondary px-2 py-1 text-xs"
                  >
                    Use
                  </button>
                  <a
                    href={imagePath}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-button-secondary px-2 py-1 text-xs"
                  >
                    <Eye size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDeleteImage(imagePath)}
                    className="admin-button-secondary px-2 py-1 text-xs text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
