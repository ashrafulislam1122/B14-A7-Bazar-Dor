
import { Suspense } from "react";
import CategoryContent from "./CategoryContent";

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-6xl">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-40 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </main>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}