
export const instant = false;
import Link from "next/link";
import { notFound } from "next/navigation";

type Market = {
  name?: string;
  market?: string;
  price?: number;
  today?: number;
  unit?: string;
};

type Product = {
  id: string | number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit?: string;
  image?: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change?: {
    dir?: string;
    pct?: number;
  };
  markets?: Market[];
};

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

function bnNumber(value: number | string | undefined) {
  return Number(value ?? 0).toLocaleString("bn-BD");
}

function taka(value: number | undefined) {
  return `৳${bnNumber(value)}`;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Product API request failed");
    }

    const data = await response.json();

    const products: Product[] = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

    return products.find((product) => product.slug === slug) ?? null;
  } catch (error) {
    console.error("Product fetch error:", error);
    return null;
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const change = product.change?.pct ?? 0;
  const isUp =
    product.change?.dir === "up" ||
    (product.change?.dir !== "down" && change > 0);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-green-700 sm:text-2xl"
          >
            🛒 বাজার দর
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            ← হোম পেজ
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-700">
            হোম
          </Link>
          {" / "}
          <Link
            href={`/categories/${product.category}`}
            className="hover:text-green-700"
          >
            {product.categoryNameBn || product.category}
          </Link>
          {" / "}
          <span className="text-gray-800">{product.nameBn}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-white p-8 sm:min-h-96">
            <span className="text-8xl sm:text-9xl" role="img" aria-label={product.nameBn}>
              {product.image || product.categoryIcon || "🛒"}
            </span>
          </div>

          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              {product.categoryIcon || "🛒"}{" "}
              {product.categoryNameBn || "পণ্য"}
            </span>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              {product.nameBn}
            </h1>

            <p className="mt-2 text-gray-500">
              একক: {product.unit || "প্রতি কেজি"}
            </p>

            <div className="mt-6 rounded-xl bg-green-50 p-5">
              <p className="text-sm text-gray-600">আজকের দাম</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {taka(product.today)}
                <span className="ml-2 text-base font-normal text-gray-600">
                  / {product.unit || "একক"}
                </span>
              </p>

              <p
                className={`mt-3 text-sm font-semibold ${
                  isUp ? "text-red-600" : change < 0 ? "text-green-700" : "text-gray-600"
                }`}
              >
                {change > 0
                  ? `গত দিনের তুলনায় ${bnNumber(change)}% দাম বেড়েছে`
                  : change < 0
                    ? `গত দিনের তুলনায় ${bnNumber(Math.abs(change))}% দাম কমেছে`
                    : "দামের পরিবর্তন নেই"}
              </p>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              এই পণ্যের আজকের দাম, আগের দিনের দাম এবং বিভিন্ন সময়ের দামের
              তুলনা এখানে দেখতে পারবে।
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-5 sm:p-7">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">
            📊 দামের তুলনা
          </h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "আজকের দাম", price: product.today },
              { label: "গতকালের দাম", price: product.yesterday },
              { label: "গত সপ্তাহের দাম", price: product.lastWeek },
              { label: "গত মাসের দাম", price: product.lastMonth },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border bg-gray-50 p-4"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-gray-800">
                  {taka(item.price)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  / {product.unit || "একক"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-5 sm:p-7">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">
            🏪 বাজারভিত্তিক দাম
          </h2>

          {product.markets && product.markets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-80 text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm text-gray-600">
                    <th className="px-4 py-3">বাজারের নাম</th>
                    <th className="px-4 py-3 text-right">দাম</th>
                  </tr>
                </thead>
                <tbody>
                  {product.markets.map((market, index) => {
                    const marketName =
                      market.name || market.market || `বাজার ${index + 1}`;
                    const marketPrice =
                      market.price ?? market.today ?? product.today;

                    return (
                      <tr
                        key={`${marketName}-${index}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4">{marketName}</td>
                        <td className="px-4 py-4 text-right font-semibold text-green-700">
                          {taka(marketPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-gray-50 p-4 text-gray-500">
              এই পণ্যের জন্য আলাদা বাজারভিত্তিক দাম পাওয়া যায়নি।
            </p>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/#সব-পণ্য"
            className="inline-block rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            ← সব পণ্য দেখুন
          </Link>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-gray-500">
          বাজারদর পরিবর্তনশীল। কেনাকাটার আগে স্থানীয় বাজার থেকে দাম যাচাই
          করে নিন।
        </p>
      </section>
    </main>
  );
}
