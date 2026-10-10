
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
  change?: number | string;
  priceChange?: number | string;
};

const API_URL = "https://api.api-store.workers.dev/api/bazardor";

export default function CategoryContent() {
  const pathname = usePathname();
  const slug = decodeURIComponent(pathname.split("/").pop() || "");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/products?category=${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : [];

        setProducts(list);

        if (list.length === 0) {
          setError("এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।");
        }
      } catch {
        setError("পণ্যের তথ্য লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProducts();
    }
  }, [slug]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 px-5 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            বাজার দর
          </Link>
          <Link href="/" className="rounded-lg bg-white/15 px-4 py-2">
            হোম
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-2 text-3xl font-bold capitalize text-gray-900">
          {slug.replace(/-/g, " ")}
        </h1>

        <p className="mb-8 text-gray-600">
          এই ক্যাটাগরির পণ্যের বর্তমান বাজারদর।
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => {
              const name = product.name || product.title || "পণ্য";
              const price = product.price ?? product.currentPrice;
              const change = Number(
                product.change ?? product.priceChange ?? 0
              );
              const productSlug =
                product.slug || String(product.id ?? index + 1);

              return (
                <Link
                  key={product.id ?? product.slug ?? index}
                  href={`/product/${encodeURIComponent(productSlug)}`}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h2 className="mb-3 text-lg font-semibold text-gray-800">
                    {name}
                  </h2>

                  <p className="text-2xl font-bold text-green-700">
                    {price !== undefined && price !== null
                      ? `${price} টাকা`
                      : "দাম পাওয়া যায়নি"}
                  </p>

                  <p
                    className={`mt-2 text-sm ${
                      change > 0
                        ? "text-red-600"
                        : change < 0
                          ? "text-green-600"
                          : "text-gray-500"
                    }`}
                  >
                    {change > 0 ? "▲" : change < 0 ? "▼" : "—"}{" "}
                    {Math.abs(change)}%
                  </p>

                  <p className="mt-4 text-sm font-medium text-green-700">
                    বিস্তারিত দেখুন →
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="text-gray-600">{error || "কোনো পণ্য পাওয়া যায়নি।"}</p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 text-white"
            >
              হোম পেজে ফিরে যান
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}