
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Product = {
  id?: string | number;
  slug?: string;
  name?: string;
  title?: string;
  price?: number | string;
  currentPrice?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  avgPrice?: number | string;
  category?: string;
  unit?: string;
  description?: string;
};

const API_URL = "https://api.api-store.workers.dev/api/bazardor";

function getNumber(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function ProductDetailsContent() {
  const pathname = usePathname();
  const slug = decodeURIComponent(pathname.split("/").pop() || "");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
        }

        const data = await response.json();
        const item = data.product ?? data.data ?? data;

        if (!item || typeof item !== "object" || Array.isArray(item)) {
          throw new Error("পণ্যের তথ্য সঠিক নয়");
        }

        setProduct(item as Product);
      } catch {
        setError("পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const currentPrice = getNumber(
    product?.currentPrice ?? product?.price
  );
  const minPrice = getNumber(product?.minPrice);
  const maxPrice = getNumber(product?.maxPrice);
  const avgPrice = getNumber(product?.avgPrice);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 px-5 py-5 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            বাজার দর
          </Link>
          <Link href="/" className="rounded-lg bg-white/15 px-4 py-2">
            হোম
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-green-700">
          ← হোম পেজে ফিরে যান
        </Link>

        {loading ? (
          <div className="animate-pulse space-y-5">
            <div className="h-10 w-2/3 rounded bg-gray-200" />
            <div className="h-36 rounded-xl bg-gray-200" />
            <div className="h-48 rounded-xl bg-gray-200" />
          </div>
        ) : error || !product ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-gray-800">
              পণ্যের তথ্য পাওয়া যায়নি
            </h1>
            <p className="mt-3 text-gray-600">
              {error || "এই পণ্যটি খুঁজে পাওয়া যায়নি।"}
            </p>
            <Link href="/" className="mt-5 inline-block text-green-700">
              হোম পেজে ফিরে যান
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-sm text-green-700">
                {product.category || "বাজারের পণ্য"}
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                {product.name || product.title || "পণ্যের বিস্তারিত"}
              </h1>

              {product.description && (
                <p className="mt-3 text-gray-600">
                  {product.description}
                </p>
              )}

              <div className="mt-6 rounded-xl bg-green-50 p-6">
                <p className="text-sm text-gray-600">বর্তমান বাজারদর</p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  {currentPrice !== null
                    ? `${currentPrice} টাকা`
                    : "দাম পাওয়া যায়নি"}
                </p>
                {product.unit && (
                  <p className="mt-1 text-sm text-gray-500">
                    প্রতি {product.unit}
                  </p>
                )}
              </div>
            </div>

            <h2 className="mb-4 mt-8 text-xl font-bold text-gray-900">
              দামের পরিসংখ্যান
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "সর্বনিম্ন দাম", value: minPrice, color: "text-green-700" },
                { label: "সর্বোচ্চ দাম", value: maxPrice, color: "text-red-600" },
                { label: "গড় দাম", value: avgPrice, color: "text-blue-700" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={`mt-3 text-2xl font-bold ${item.color}`}>
                    {item.value !== null
                      ? `${item.value} টাকা`
                      : "তথ্য নেই"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}