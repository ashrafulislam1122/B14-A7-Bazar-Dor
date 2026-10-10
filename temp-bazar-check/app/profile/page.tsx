
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/signin");
    }
  }, [isPending, user, router]);

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");

    try {
      setPhoto(localStorage.getItem(`bazar-profile-photo-${user.id}`) || user.image || "");
    } catch {
      setPhoto(user.image || "");
    }
  }, [user]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("একটি image ফাইল নির্বাচন করো।");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("ছবির সাইজ সর্বোচ্চ ২ MB হতে পারবে।");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setError("");
        setMessage("ছবি নির্বাচন করা হয়েছে। পরিবর্তনগুলো সংরক্ষণ করতে Update চাপো।");
      }
    };

    reader.onerror = () => setError("ছবিটি পড়া যায়নি। আবার চেষ্টা করো।");
    reader.readAsDataURL(file);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        setError(result.error.message || "নাম আপডেট করা যায়নি।");
        return;
      }

      try {
        if (photo) {
          localStorage.setItem(`bazar-profile-photo-${user.id}`, photo);
        }
      } catch {
        setError("ছবিটি ব্রাউজারে সংরক্ষণ করা যায়নি। ছোট ছবি দিয়ে চেষ্টা করো।");
        return;
      }

      setMessage("প্রোফাইল আপডেট হয়েছে।");
      await authClient.getSession();
    } catch (err) {
      console.error("Profile update error:", err);
      setError("প্রোফাইল আপডেট করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(result.error.message || "Logout করা যায়নি।");
        return;
      }

      router.replace("/signin");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  if (isPending || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">প্রোফাইল লোড হচ্ছে...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <Link href="/" className="text-sm text-green-700 hover:underline">
          ← হোম পেজ
        </Link>

        <h1 className="mb-2 mt-4 text-2xl font-bold text-gray-900">
          আমার প্রোফাইল
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          আপনার অ্যাকাউন্টের তথ্য দেখুন ও পরিবর্তন করুন।
        </p>

        <div className="mb-6 flex flex-col items-center">
          {photo ? (
            <img
              src={photo}
              alt="প্রোফাইল ছবি"
              className="h-28 w-28 rounded-full border-4 border-green-100 object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
              {name.trim().charAt(0).toUpperCase() || "👤"}
            </div>
          )}

          <label
            htmlFor="profile-photo"
            className="mt-3 cursor-pointer rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            ছবি নির্বাচন করুন
          </label>

          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />

          <p className="mt-2 text-xs text-gray-500">
            Image ফাইল, সর্বোচ্চ ২ MB
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              আপনার নাম
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="আপনার নাম লিখুন"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={user.email || ""}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? "অপেক্ষা করো..." : "Logout / Sign Out"}
        </button>
      </div>
    </main>
  );
}
