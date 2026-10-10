

export const instant = false;

type Market = {
  market: string;
  division?: string;
  min: number;
  max: number;
};

type Product = {
  id: string | number;
  slug: string;
  nameBn: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  image?: string;
  unit: string;
  today: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
  markets?: Market[];
};

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor/products";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function money(value?: number) {
  if (value === undefined || !Number.isFinite(Number(value))) {
    return "তথ্য নেই";
  }

  return "৳" + new Intl.NumberFormat("bn-BD").format(value);
}

function unitName(unit?: string) {
  const units: Record<string, string> = {
    kg: "কেজি",
    litre: "লিটার",
    liter: "লিটার",
    dozen: "ডজন",
    piece: "টি",
    gram: "গ্রাম",
    packet: "প্যাকেট",
  };

  return units[unit?.toLowerCase() || ""] || unit || "একক";
}

async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!response.ok) return undefined;

    const result = await response.json();

    const products: Product[] = Array.isArray(result)
      ? result
      : Array.isArray(result?.products)
        ? result.products
        : [];

    return products.find((product) => product.slug === slug);
  } catch {
    return undefined;
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <a href="/" className="text-emerald-700 hover:underline">
          ← সব পণ্যে ফিরে যান
        </a>

        <h1 className="mt-8 text-2xl font-bold">
          পণ্যটি পাওয়া যায়নি
        </h1>

        <p className="mt-2 text-gray-600">
          পণ্যের তথ্য লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </p>
      </main>
    );
  }

  const markets = Array.isArray(product.markets)
    ? product.markets
    : [];

  const change = Number(
    product.change?.pct ??
      (product.yesterday
        ? ((product.today - product.yesterday) / product.yesterday) * 100
        : 0)
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="font-medium text-emerald-700 hover:underline"
        >
          ← সব পণ্যে ফিরে যান
        </a>

        <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">
              {product.image || product.categoryIcon || "🛒"}
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {product.categoryNameBn || "নিত্যপ্রয়োজনীয় পণ্য"}
              </p>

              <h1 className="mt-1 text-3xl font-extrabold">
                {product.nameBn}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                প্রতি {unitName(product.unit)}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm text-emerald-800">আজকের দাম</p>

            <p className="mt-1 text-4xl font-extrabold text-emerald-900">
              {money(product.today)}
              <span className="ml-2 text-base font-medium">
                / {unitName(product.unit)}
              </span>
            </p>

            <p
              className={`mt-3 text-sm font-semibold ${
                change > 0
                  ? "text-red-600"
                  : change < 0
                    ? "text-emerald-700"
                    : "text-gray-600"
              }`}
            >
              {change > 0 ? "▲ দাম বেড়েছে" : change < 0 ? "▼ দাম কমেছে" : "— দামে পরিবর্তন নেই"}{" "}
              ({new Intl.NumberFormat("bn-BD", {
                maximumFractionDigits: 2,
              }).format(Math.abs(change))}%)
            </p>
          </div>

          <h2 className="mt-8 text-xl font-bold">
            আগের দামের তুলনা
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["গতকাল", product.yesterday],
              ["গত সপ্তাহে", product.lastWeek],
              ["গত মাসে", product.lastMonth],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-gray-200 p-4"
              >
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 text-xl font-bold">
                  {money(typeof value === "number" ? value : undefined)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-extrabold">
            বিভিন্ন বাজারের দাম
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            বাজারভেদে সর্বনিম্ন ও সর্বোচ্চ দাম
          </p>

          {markets.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {markets.map((market, index) => (
                <article
                  key={`${market.market}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-bold">
                    {market.market}
                  </h3>

                  {market.division && (
                    <p className="mt-1 text-sm text-gray-500">
                      বিভাগ: {market.division}
                    </p>
                  )}

                  <div className="mt-4 flex justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        সর্বনিম্ন
                      </p>
                      <p className="mt-1 font-bold text-emerald-700">
                        {money(market.min)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        সর্বোচ্চ
                      </p>
                      <p className="mt-1 font-bold text-red-600">
                        {money(market.max)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border bg-white p-5 text-gray-600">
              এই পণ্যের বাজারভিত্তিক তথ্য পাওয়া যায়নি।
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
