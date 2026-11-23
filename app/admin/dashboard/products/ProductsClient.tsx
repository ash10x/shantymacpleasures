"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, importProducts, type ProductInput } from "@/server/actions/adminProducts";
import { Pencil, Trash2, Plus, X, Check, Loader2, Download, FileUp } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  colors: string[];
  featured: boolean;
  bestseller: boolean;
};

const empty: ProductInput = {
  name: "", price: 0, quantity: 0, description: "", image: "", imageAlt: "", category: "", colors: [],
  featured: false, bestseller: false,
};

function absoluteImageUrl(image: string) {
  try {
    const base = window.location.protocol === "https:" ? window.location.origin : "https://www.shantymacpleasures.com";
    return new URL(image, base).toString();
  } catch {
    return image;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

const inventoryColumns = ["id", "name", "price", "quantity", "description", "image", "imageAlt", "category", "colors", "featured", "bestseller"] as const;

function parseInventoryCsv(source: string): Array<{ id?: number; product: ProductInput }> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const csv = source.replace(/^\uFEFF/, "");

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (quoted) {
      if (char === '"' && csv[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === "") quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && csv[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (field || row.length) { row.push(field); rows.push(row); }

  const header = rows.shift()?.map((value) => value.trim());
  if (!header || inventoryColumns.some((column) => column !== "colors" && !header.includes(column)) || (!header.includes("colors") && !header.includes("color"))) {
    throw new Error(`CSV must include these columns: ${inventoryColumns.join(", ")}`);
  }
  const index = (column: string) => header.indexOf(column);
  const dataRows = rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
  if (dataRows.length === 0 || dataRows.length > 1000) throw new Error("CSV must contain between 1 and 1,000 product rows.");

  return dataRows.map((cells, rowIndex) => {
    if (cells.length !== header.length) throw new Error(`Row ${rowIndex + 2} has a different number of fields than the header.`);
    const value = (column: string) => cells[index(column)] ?? "";
    const number = (column: string) => {
      const raw = value(column).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${rowIndex + 2}: ${column} must be a whole number.`);
      return Number(raw);
    };
    const bool = (column: string) => {
      const raw = value(column).trim().toLowerCase();
      if (raw === "true") return true;
      if (raw === "false") return false;
      throw new Error(`Row ${rowIndex + 2}: ${column} must be true or false.`);
    };
    const rawId = value("id").trim();
    if (rawId && !/^\d+$/.test(rawId)) throw new Error(`Row ${rowIndex + 2}: id must be a whole number or blank.`);
    return {
      ...(rawId ? { id: Number(rawId) } : {}),
      product: {
        name: value("name"), price: number("price"), quantity: number("quantity"),
        description: value("description"), image: value("image"), imageAlt: value("imageAlt"),
        category: value("category"),
        colors: (value("colors") || value("color")).split("|").map((color) => color.trim()).filter(Boolean),
        featured: bool("featured"), bestseller: bool("bestseller"),
      },
    };
  });
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ProductInput>(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const importInput = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const refresh = () => router.refresh();

  const handleExport = () => {
    const escape = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const csv = [inventoryColumns.join(","), ...products.map((product) => inventoryColumns.map((column) => escape(column === "colors" ? product.colors.join(" | ") : column === "image" ? absoluteImageUrl(product.image) : product[column])).join(","))].join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setImportMessage("");
    try {
      if (!file.name.toLowerCase().endsWith(".csv") || file.size > 2 * 1024 * 1024) {
        throw new Error("Choose a CSV file smaller than 2 MB.");
      }
      const imported = parseInventoryCsv(await file.text());
      const result = await importProducts(imported);
      setImportMessage(`Import complete: ${result.created} added, ${result.updated} updated.`);
      refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  };

  const openAdd = () => {
    setForm(empty);
    setAdding(true);
    setEditing(null);
    setError("");
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      description: p.description,
      image: absoluteImageUrl(p.image),
      imageAlt: p.imageAlt,
      category: p.category,
      colors: p.colors ?? [],
      featured: p.featured,
      bestseller: p.bestseller,
    });
    setEditing(p);
    setAdding(false);
    setError("");
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
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
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} className="admin-button-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button type="button" onClick={() => importInput.current?.click()} className="admin-button-secondary" disabled={isPending}>
            <FileUp size={16} /> Import CSV
          </button>
          <input ref={importInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => void handleImportFile(e.target.files?.[0])} />
          <button onClick={openAdd} className="admin-button-primary">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {importMessage && <div className="admin-banner-success">{importMessage}</div>}
      <p className="mb-4 text-xs text-slate-500">CSV import updates products with a matching ID and adds rows with a blank or unknown ID. Export includes the full catalogue.</p>

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
            {field("price", "Price (JMD)", "number")}
            {field("quantity", "Quantity", "number")}
            <div>
              <label className="admin-kicker mb-1 block" htmlFor="product-colors">Available Colors</label>
              <textarea
                id="product-colors"
                value={form.colors.join("\n")}
                onChange={(e) => setForm({ ...form, colors: e.target.value.split("\n").map((color) => color.trim()).filter(Boolean) })}
                rows={3}
                placeholder={"Black\nRose\nLavender"}
                className="admin-textarea"
              />
              <p className="mt-1 text-xs text-slate-500">Enter one option per line. Leave blank if the product has no color options.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="admin-kicker mb-1 block" htmlFor="product-image-url">Image URL</label>
              <input
                id="product-image-url"
                type="url"
                required
                maxLength={2048}
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/product-image.jpg"
                className="admin-field"
              />
              <p className="mt-1 text-xs text-slate-500">Enter a public HTTPS link to the product image.</p>
              {form.image && /^https:\/\//i.test(form.image) && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={form.image} alt="Product preview" fill unoptimized className="object-cover" />
                  </div>
                  <p className="min-w-0 truncate text-xs text-slate-500">{form.image}</p>
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
              <th>Available Colors</th>
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
                <td>{p.colors.length ? p.colors.join(", ") : <span className="text-slate-400">—</span>}</td>
                <td className="font-semibold text-slate-800">JMD {p.price}</td>
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

    </div>
  );
}
