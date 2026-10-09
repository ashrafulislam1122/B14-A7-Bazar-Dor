
"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number | string;
  name: string;
  category: string;
  price: number;
  unit: string;
  change: number;
  emoji: string;
};

const demoProducts: Product[] = [
  { id: 1, name: "মিনিকেট চাল", category: "চাল", price: 72, unit: "কেজি", change: -2, emoji: "🌾" },
  { id: 2, name: "আলু", category: "সবজি", price: 35, unit: "কেজি", change: 5, emoji: "🥔" },
  { id: 3, name: "পেঁয়াজ", category: "সবজি", price: 60, unit: "কেজি", change: 3, emoji: "🧅" },
  { id: 4, name: "সয়াবিন তেল", category: "তেল", price: 170, unit: "লিটার", change: -1, emoji: "🫗" },
  { id: 5, name: "মসুর ডাল", category: "ডাল", price: 120, unit: "কেজি", change: 2, emoji: "🫘" },
  { id: 6, name: "ডিম", category: "নিত্যপণ্য", price: 55, unit: "৪টি", change: 0, emoji: "🥚" },
  { id: 7, name: "টমেটো", category: "সবজি", price: 45, unit: "কেজি", change: -3, emoji: "🍅" },
  { id: 8, name: "রসুন", category: "মসলা", price: 180, unit: "কেজি", change: 2, emoji: "🧄" },
];

const categoryList = ["সব পণ্য", "চাল", "সবজি", "তেল", "ডাল", "মসলা", "নিত্যপণ্য"];

function bengaliNumber(value: number | string): string {
  const digits = "০১২৩৪৫৬৭৮৯";
  return String(value).replace(/[0-9]/g, (digit) => digits[Number(digit)]);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [category, setCategory] = useState("সব পণ্য");
  const [search, setSearch] = useState("");
  const [apiStatus, setApiStatus] = useState("ডেমো বাজারদর");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch(
          "https://api.api-store.workers.dev/api/bazardor/products"
        );

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const result: unknown = await response.json();

        let items: unknown[] = [];

        if (Array.isArray(result)) {
          items = result;
        } else if (result && typeof result === "object") {
          const data = result as Record<string, unknown>;
          if (Array.isArray(data.products)) items = data.products;
          else if (Array.isArray(data.data)) items = data.data;
          else if (Array.isArray(data.results)) items = data.results;
        }

        const mapped = items.map((item, index) => {
          const p = item as Record<string, unknown>;
          const priceValue = Number(p.price ?? p.current_price ?? 0);
          const changeValue = Number(p.change ?? p.price_change ?? 0);

          return {
            id: (p.id as number | string) ?? index + 1,
            name: String(p.name_bn ?? p.name ?? p.title ?? "নাম নেই"),
            category: String(p.category_bn ?? p.category ?? "নিত্যপণ্য"),
            price: Number.isFinite(priceValue) ? priceValue : 0,
            unit: String(p.unit_bn ?? p.unit ?? "কেজি"),
            change: Number.isFinite(changeValue) ? changeValue : 0,
            emoji: "🛍️",
          };
        });

        if (!cancelled && mapped.length > 0) {
          setProducts(mapped);
          setApiStatus("API থেকে প্রাপ্ত তথ্য");
        }
      } catch {
        if (!cancelled) {
          setApiStatus("নমুনা বাজারদর");
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      category === "সব পণ্য" || product.category.includes(category);

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const rising = [...products]
    .filter((product) => product.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  const falling = [...products]
    .filter((product) => product.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 3);

  const today = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <main>
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>বাংলাদেশের দৈনিক বাজারদর</span>
          <span>আজ: {today}</span>
        </div>
      </div>

      <header className="navbar">
        <div className="container nav-inner">
          <a className="brand" href="#">
            <span className="brand-mark">ব</span>
            <span className="brand-name">
              বাজার<span>দর</span>
            </span>
          </a>

          <nav className="desktop-nav">
            <a className="nav-link active" href="#">হোম</a>
            <a className="nav-link" href="#products">বাজারদর</a>
            <a className="nav-link" href="#trends">দামের পরিবর্তন</a>
            <a className="nav-link" href="#about">আমাদের সম্পর্কে</a>
          </nav>

          <div className="nav-actions">
            <a className="login-link" href="#login">লগইন</a>
            <a className="button button-small" href="#products">দাম দেখুন ↗</a>
          </div>
        </div>
      </header>

      <div className="ticker">
        <div className="ticker-label">বাজারদর</div>
        <div className="ticker-track">
          {[...products, ...products].map((product, index) => (
            <span className="ticker-item" key={`${product.id}-${index}`}>
              {product.name} <strong>৳{bengaliNumber(product.price)}</strong>
              <span className={product.change > 0 ? "ticker-up" : "ticker-down"}>
                {product.change > 0 ? "↑" : "↓"}
              </span>
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              সঠিক বাজারদর, প্রতিদিন
            </div>
            <h1>
              বাজারের খবর রাখুন,
              <br />
              <span>সাশ্রয়ী থাকুন।</span>
            </h1>
            <p className="hero-description">
              প্রতিদিনের নিত্যপ্রয়োজনীয় পণ্যের বাজারদর জানুন এক জায়গায়।
              কেনাকাটার আগে দাম যাচাই করুন, সিদ্ধান্ত নিন নিশ্চিন্তে।
            </p>
            <div className="hero-actions">
              <a className="button" href="#products">আজকের বাজারদর দেখুন ↗</a>
              <a className="text-link" href="#trends">দামের পরিবর্তন →</a>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <span>🌾</span><span>🥬</span><span>🛒</span>
              </div>
              <p>
                <strong>প্রতিদিনের বাজারের সঙ্গী</strong>
                <br />
                <span>সহজ, স্বচ্ছ ও নির্ভরযোগ্য তথ্য</span>
              </p>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-art-glow" />
            <div className="hero-image-frame">
              <div className="market-illustration">
                <div className="illustration-sun" />
                <span className="food food-one">🥬</span>
                <span className="food food-two">🥕</span>
                <span className="food food-three">🍅</span>
                <span className="food food-four">🌽</span>
                <span className="food food-five">🥦</span>
                <span className="food food-six">🧅</span>
                <div className="basket">
                  <div className="basket-handle" />
                  <div className="basket-body">
                    <span>বাজার</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-sticker sticker-top">✓ দৈনিক আপডেট</div>
            <div className="hero-sticker sticker-bottom">
              <span className="sticker-icon">৳</span>
              <div>
                <strong>স্মার্ট কেনাকাটা</strong>
                <small>দাম জানুন আগে</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom container">
          <span><i /> সহজে দাম তুলনা করুন</span>
          <span><i /> প্রতিদিনের বাজার আপডেট</span>
          <span><i /> আপনার বাজেট, আপনার সিদ্ধান্ত</span>
        </div>
      </section>

      <section className="category-section">
        <div className="container">
          <div className="section-heading compact-heading">
            <div>
              <p className="section-kicker">ক্যাটাগরি অনুসারে</p>
              <h2>কী কিনতে চান?</h2>
            </div>
            <a className="text-link" href="#products">সব পণ্য দেখুন →</a>
          </div>

          <div className="category-list">
            {categoryList.map((item, index) => (
              <button
                className={`category-chip ${category === item ? "selected" : ""}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                <span className="category-icon">
                  {["🛒", "🌾", "🥬", "🫗", "🫘", "🌶️", "🥚"][index]}
                </span>
                <span>{item}</span>
                <span className="chip-arrow">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="trends-section" id="trends">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-kicker">বাজারের হালচাল</p>
              <h2>দামের পরিবর্তন</h2>
              <p className="section-subtitle">
                কোন পণ্যের দাম বাড়ছে, কোনটির কমছে—এক নজরে দেখুন।
              </p>
            </div>
            <span className="updated-pill"><span /> {apiStatus}</span>
          </div>

          <div className="trend-grid">
            <div className="trend-panel">
              <div className="trend-panel-title">
                <span className="trend-symbol up-symbol">↗</span>
                <div><h3>দাম বেড়েছে</h3><p>দাম ঊর্ধ্বমুখী পণ্য</p></div>
              </div>
              {rising.length ? rising.map((product) => (
                <div className="trend-row" key={product.id}>
                  <span className="trend-product-icon">{product.emoji}</span>
                  <span className="trend-name">{product.name}</span>
                  <strong>৳{bengaliNumber(product.price)}</strong>
                  <span className="change up">↑ {bengaliNumber(product.change)}%</span>
                </div>
              )) : <p className="trend-empty">দাম বাড়ার তথ্য পাওয়া যায়নি।</p>}
            </div>

            <div className="trend-panel">
              <div className="trend-panel-title">
                <span className="trend-symbol down-symbol">↘</span>
                <div><h3>দাম কমেছে</h3><p>দাম নিম্নমুখী পণ্য</p></div>
              </div>
              {falling.length ? falling.map((product) => (
                <div className="trend-row" key={product.id}>
                  <span className="trend-product-icon">{product.emoji}</span>
                  <span className="trend-name">{product.name}</span>
                  <strong>৳{bengaliNumber(product.price)}</strong>
                  <span className="change down">↓ {bengaliNumber(Math.abs(product.change))}%</span>
                </div>
              )) : <p className="trend-empty">দাম কমার তথ্য পাওয়া যায়নি।</p>}
            </div>
          </div>
          <p className="data-note">* দামের পরিবর্তন নমুনা বা API ডেটার ওপর নির্ভরশীল।</p>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="container">
          <div className="section-heading product-heading">
            <div>
              <p className="section-kicker">আজকের তালিকা</p>
              <h2>নিত্যপণ্যের বাজারদর</h2>
              <p className="section-subtitle">
                কেনাকাটার আগে জেনে নিন প্রয়োজনীয় পণ্যের দাম।
              </p>
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                aria-label="পণ্য খুঁজুন"
                placeholder="পণ্যের নাম লিখুন..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="product-filter-row">
            <div className="filter-chips">
              {categoryList.map((item) => (
                <button
                  className={`filter-chip ${category === item ? "filter-active" : ""}`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <span className="product-count">{bengaliNumber(visibleProducts.length)}টি পণ্য</span>
          </div>

          <div className="products-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-visual">
                  <span>{product.emoji}</span>
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="unit-label">প্রতি {product.unit}</p>
                  <div className="price-row">
                    <p className="price">৳{bengaliNumber(product.price)}</p>
                    {product.change > 0 ? (
                      <span className="change up">↑ {bengaliNumber(product.change)}%</span>
                    ) : product.change < 0 ? (
                      <span className="change down">↓ {bengaliNumber(Math.abs(product.change))}%</span>
                    ) : (
                      <span className="change stable">— স্থির</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="empty-state">
              <span>🔎</span>
              <h3>কোনো পণ্য পাওয়া যায়নি</h3>
              <p>অন্য নাম বা ক্যাটাগরি দিয়ে খুঁজে দেখুন।</p>
              <button
                className="button"
                onClick={() => { setSearch(""); setCategory("সব পণ্য"); }}
                type="button"
              >
                সব পণ্য দেখুন
              </button>
            </div>
          )}

          <div className="products-bottom">
            <span>আপনার দৈনন্দিন বাজার, আরও সহজে।</span>
            <a href="#" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              উপরে ফিরে যান ↑
            </a>
          </div>
        </div>
      </section>

      <section className="cta-section" id="about">
        <div className="container cta-card">
          <div>
            <p className="section-kicker">বাজার করুন বুদ্ধিমত্তার সঙ্গে</p>
            <h2>দাম জেনে কিনুন,<br />সাশ্রয় করুন প্রতিদিন।</h2>
            <p>সঠিক তথ্যের মাধ্যমে আপনার বাজারের পরিকল্পনা হোক আরও সহজ।</p>
          </div>
          <a className="button button-light" href="#products">বাজারদর দেখুন ↗</a>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a className="brand" href="#">
              <span className="brand-mark">ব</span>
              <span className="brand-name">বাজার<span>দর</span></span>
            </a>
            <p>প্রতিদিনের বাজারদর জানুন সহজে।<br />সঠিক তথ্য, সাশ্রয়ী কেনাকাটা।</p>
          </div>
          <div className="footer-links">
            <h4>দ্রুত লিংক</h4>
            <a href="#">হোম</a>
            <a href="#products">বাজারদর</a>
            <a href="#trends">দামের পরিবর্তন</a>
          </div>
          <div className="footer-links">
            <h4>আমাদের লক্ষ্য</h4>
            <p>বাজারের তথ্য সহজলভ্য করা এবং সচেতন কেনাকাটায় সহায়তা করা।</p>
          </div>
          <div className="footer-contact">
            <span className="footer-leaf">✳</span>
            <h4>বাজার থাকুক হাতের মুঠোয়</h4>
            <p>প্রতিদিন ফিরে আসুন নতুন বাজারদরের খোঁজে।</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {bengaliNumber(new Date().getFullYear())} বাজার দর। সর্বস্বত্ব সংরক্ষিত।</span>
          <span>বাংলাদেশের বাজারের জন্য ভালোবাসা দিয়ে তৈরি ♥</span>
        </div>
      </footer>
    </main>
  );
}