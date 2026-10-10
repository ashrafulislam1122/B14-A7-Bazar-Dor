
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/app/lib/auth-client";

type Market = {
  market: string;
  division?: string;
  min: number;
  max: number;
};

type ApiProduct = {
  id: string | number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit: string;
  image?: string;
  today: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: { dir?: string; pct?: number };
  markets?: Market[];
};

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  icon: string;
  unit: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  changePct: number;
  direction: "up" | "down" | "same";
  markets: Market[];
};

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

const CATEGORIES = [
  { id: "all", name: "সব পণ্য", icon: "🛒" },
  { id: "chal", name: "চাল", icon: "🍚" },
  { id: "dal", name: "ডাল", icon: "🫘" },
  { id: "tel", name: "তেল", icon: "🫗" },
  { id: "sobji", name: "সবজি", icon: "🥬" },
  { id: "mach", name: "মাছ", icon: "🐟" },
  { id: "mangsho", name: "মাংস", icon: "🍗" },
  { id: "dim-dui", name: "ডিম ও দুগ্ধ", icon: "🥚" },
  { id: "mosla", name: "মসলা", icon: "🌶️" },
];

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(value: number) {
  return "৳" + bnNumber(value);
}

function formatUnit(unit: string) {
  const units: Record<string, string> = {
    kg: "কেজি",
    litre: "লিটার",
    liter: "লিটার",
    dozen: "ডজন",
    piece: "টি",
    gram: "গ্রাম",
    packet: "প্যাকেট",
  };

  return units[unit?.toLowerCase()] || unit || "একক";
}

function mapApiProduct(item: ApiProduct): Product {
  const today = Number(item.today) || 0;
  const yesterday = Number(item.yesterday ?? today);

  const calculatedChange =
    yesterday !== 0
      ? ((today - yesterday) / yesterday) * 100
      : 0;

  const changePct = Number(
    item.change?.pct ?? calculatedChange,
  );

  let direction: Product["direction"] = "same";

  if (item.change?.dir === "up" || changePct > 0) {
    direction = "up";
  } else if (item.change?.dir === "down" || changePct < 0) {
    direction = "down";
  }

  const category = item.category || "other";
  const categoryInfo = CATEGORIES.find(
    (entry) => entry.id === category,
  );

  return {
    id: String(item.id),
    slug: item.slug || String(item.id),
    name: item.nameBn || "নাম পাওয়া যায়নি",
    category,
    categoryName:
      item.categoryNameBn || categoryInfo?.name || "অন্যান্য",
    icon:
      item.image ||
      item.categoryIcon ||
      categoryInfo?.icon ||
      "🛍️",
    unit: item.unit || "kg",
    today,
    yesterday,
    lastWeek: Number(item.lastWeek ?? today),
    lastMonth: Number(item.lastMonth ?? today),
    changePct,
    direction,
    markets: Array.isArray(item.markets) ? item.markets : [],
  };
}

function ProductCard({ product }: { product: Product }) {
  const isUp = product.direction === "up";
  const isDown = product.direction === "down";

  return (
    <Link
      href={"/product/" + product.slug}
      className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
          {product.icon}
        </div>

        <span
          className={
            "rounded-full px-2.5 py-1 text-xs font-semibold " +
            (isUp
              ? "bg-red-50 text-red-600"
              : isDown
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-600")
          }
        >
          {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
          {bnNumber(Math.abs(product.changePct))}%
        </span>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-gray-900 group-hover:text-emerald-700">
          {product.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {product.categoryName} · প্রতি {formatUnit(product.unit)}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(product.today)}
          </p>

          <span className="text-sm font-semibold text-emerald-700">
            বিস্তারিত →
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
      <div className="h-14 w-14 rounded-2xl bg-gray-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
      <div className="mt-5 h-7 w-2/3 rounded bg-gray-200" />
    </div>
  );
}

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [todayDate, setTodayDate] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const now = new Date();

    setTodayDate(
      new Intl.DateTimeFormat("bn-BD", {
        dateStyle: "full",
        timeZone: "Asia/Dhaka",
      }).format(now),
    );

    setCurrentYear(
      new Intl.DateTimeFormat("bn-BD", {
        year: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(now),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
        }

        const result = await response.json();

        const rawProducts: ApiProduct[] = Array.isArray(result)
          ? result
          : Array.isArray(result?.products)
            ? result.products
            : [];

        if (rawProducts.length === 0) {
          throw new Error("কোনো পণ্য পাওয়া যায়নি");
        }

        if (!cancelled) {
          setProducts(rawProducts.map(mapApiProduct));
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.slice();

    if (activeCategory !== "all") {
      result = result.filter(
        (product) => product.category === activeCategory,
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.categoryName.toLowerCase().includes(query),
      );
    }

    if (sort === "low") {
      result.sort((a, b) => a.today - b.today);
    } else if (sort === "high") {
      result.sort((a, b) => b.today - a.today);
    } else if (sort === "change") {
      result.sort((a, b) => b.changePct - a.changePct);
    }

    return result;
  }, [products, activeCategory, search, sort]);

  const risingProducts = useMemo(
    () =>
      products
        .filter((product) => product.changePct > 0)
        .sort((a, b) => b.changePct - a.changePct)
        .slice(0, 6),
    [products],
  );

  const fallingProducts = useMemo(
    () =>
      products
        .filter((product) => product.changePct < 0)
        .sort((a, b) => a.changePct - b.changePct)
        .slice(0, 6),
    [products],
  );

  async function handleSignOut() {
    try {
      const result = await authClient.signOut();

      if (result.error) {
        alert("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      window.location.href = "/";
    } catch {
      alert("লগআউট করার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-emerald-800 px-4 py-2 text-center text-sm text-white">
        {todayDate || "প্রতিদিনের বাজারদর"} · সঠিক সিদ্ধান্ত নিন, সাশ্রয় করুন
      </div>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo-icon.png"
              alt="বাজার দর লোগো"
              className="h-11 w-11 rounded-xl object-contain"
            />

            <span>
              <span className="block text-xl font-extrabold text-emerald-800">
                বাজার দর
              </span>
              <span className="block text-xs text-gray-500">
                প্রতিদিনের বাজারদর
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href="/" className="text-emerald-700">
              হোম
            </Link>
            <a href="#দাম-বাড়ছে" className="hover:text-emerald-700">
              দাম বাড়ছে
            </a>
            <a href="#দাম-কমছে" className="hover:text-emerald-700">
              দাম কমছে
            </a>
            <a href="#সব-পণ্য" className="hover:text-emerald-700">
              সব পণ্য
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isPending ? (
              <span className="text-sm text-gray-500">
                লোড হচ্ছে...
              </span>
            ) : session?.user ? (
              <>
                <Link
                  href="/profile"
                  title="আমার প্রোফাইল"
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 px-2 py-2 hover:bg-emerald-50 sm:px-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="প্রোফাইল"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      session.user.name?.trim()?.charAt(0)?.toUpperCase() || "👤"
                    )}
                  </span>

                  <span className="hidden max-w-28 truncate text-sm font-semibold text-emerald-800 sm:block">
                    {session.user.name || "আমার প্রোফাইল"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  লগআউট
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-xl border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 sm:px-4"
                >
                  লগইন
                </Link>

                <Link
                  href="/signup"
                  className="hidden rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 sm:inline-flex"
                >
                  নিবন্ধন
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setActiveCategory(category.id);
                  document.getElementById("সব-পণ্য")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium " +
                  (activeCategory === category.id
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-50")
                }
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!loading && products.length > 0 && (
        <div className="ticker-container overflow-hidden border-b border-emerald-100 bg-emerald-50 py-3">
          <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap px-4">
            {[...products, ...products].map((product, index) => (
              <Link
                key={product.id + "-" + index}
                href={"/product/" + product.slug}
                className="flex items-center gap-2 text-sm"
              >
                <span>{product.icon}</span>
                <span className="font-medium">{product.name}</span>
                <span className="font-bold text-emerald-800">
                  {formatPrice(product.today)}/{formatUnit(product.unit)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm">
              🌿 বাংলাদেশের প্রতিদিনের বাজারদর
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              বাজারের দাম জানুন,
              <span className="mt-2 block text-lime-300">
                সাশ্রয়ী কেনাকাটা করুন
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50">
              চাল, ডাল, তেল, সবজি, মাছ ও মাংসসহ নিত্যপ্রয়োজনীয় পণ্যের
              দাম এক জায়গায় দেখুন। দাম তুলনা করে সচেতন কেনাকাটার সিদ্ধান্ত নিন।
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#সব-পণ্য"
                className="rounded-xl bg-lime-300 px-6 py-3 font-bold text-emerald-950 hover:bg-lime-200"
              >
                সব পণ্যের দাম দেখুন →
              </a>
              <a
                href="#দাম-বাড়ছে"
                className="rounded-xl border border-white/40 px-6 py-3 font-semibold hover:bg-white/10"
              >
                বাজারের পরিবর্তন
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg">
            <img
              src="/bazar-hero.png"
              alt="বাজার দর ব্যানার"
              className="h-auto w-full rounded-3xl border border-white/20 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            লাইভ পণ্যের তথ্য পাওয়া যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
          </p>
        </div>
      )}

      <section
        id="দাম-বাড়ছে"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <p className="text-sm font-semibold text-red-600">▲ ঊর্ধ্বমুখী দাম</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          যেসব পণ্যের দাম বাড়ছে
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : risingProducts.length ? (
            risingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="rounded-2xl border bg-white p-6 text-gray-500">
              দাম বাড়ার তথ্য পাওয়া যায়নি।
            </p>
          )}
        </div>
      </section>

      <section id="দাম-কমছে" className="bg-emerald-50/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-emerald-700">
            ▼ নিম্নমুখী দাম
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            যেসব পণ্যের দাম কমছে
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : fallingProducts.length ? (
              fallingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="rounded-2xl border bg-white p-6 text-gray-500">
                দাম কমার তথ্য পাওয়া যায়নি।
              </p>
            )}
          </div>
        </div>
      </section>

      <section
        id="সব-পণ্য"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              🛍️ পণ্যের তালিকা
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              সব নিত্যপ্রয়োজনীয় পণ্য
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              পণ্য খুঁজুন এবং দাম তুলনা করুন
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            {loading
              ? "লোড হচ্ছে..."
              : bnNumber(filteredProducts.length) + "টি পণ্য"}
          </span>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="পণ্যের নাম লিখে খুঁজুন..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="পণ্যের দাম অনুযায়ী সাজান"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <option value="default">ডিফল্ট সাজানো</option>
            <option value="low">দাম: কম থেকে বেশি</option>
            <option value="high">দাম: বেশি থেকে কম</option>
            <option value="change">দাম বৃদ্ধির হার</option>
          </select>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium " +
                (activeCategory === category.id
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400")
              }
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : filteredProducts.length ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <h3 className="text-xl font-bold">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="mt-2 text-sm text-gray-500">
                অন্য নাম দিয়ে খুঁজুন অথবা অন্য ক্যাটাগরি বেছে নিন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                  setSort("default");
                }}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
              >
                সব পণ্য দেখুন
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold"
            >
              <img
                src="/logo-icon.png"
                alt=""
                className="h-8 w-8 object-contain"
              />
              বাজার দর
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
            </p>
          </div>

          <div className="max-w-xl text-sm leading-6 text-gray-400 md:text-right">
            <p>
              সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
              কেনার আগে স্থানীয় বাজারে দাম যাচাই করুন।
            </p>
            <p className="mt-2">
              © {currentYear || "২০২৬"} বাজার দর। সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
