"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApiUrls } from "@/lib/api-urls-context";

type EntityRelation = {
  id: string;
  relatedEntityId: string;
  name: string;
  startTime?: string;
  endTime?: string;
  direction?: string;
};

export default function InsertPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { readApiUrl, updateApiUrl } = useApiUrls();
  const entityId = searchParams.get("entityId");

  const [relations, setRelations] = useState<EntityRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    categoryId: "",
    categoryMinorKind: "parentCategory",
    categoryName: "",
    date: "",
  });

  useEffect(() => {
    const fetchRelations = async () => {
      if (!entityId) {
        setError("Missing entityId in URL");
        return;
      }
      if (!readApiUrl) {
        setError("Missing readApiUrl. Please configure API URLs first.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/endpoint/getEntityRelations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityId, readApiUrl }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load relations");
        }

        setRelations(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, [entityId, readApiUrl]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-black">
            Entity Relations
          </h1>
          <div className="flex gap-3">
            <div className="relative group">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Insert Data
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                insert data directly to the entity
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div className="relative group">
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={() => setShowCategoryModal(true)}
              >
                Add Categories
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                add categories and insert data
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
        {entityId && (
          <p className="text-gray-700 mb-6">Entity ID: {entityId}</p>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-100 text-green-800 px-4 py-3">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="text-gray-600">Loading relations...</div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && relations.length === 0 && (
          <div className="text-gray-600">No relations found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relations.map((relation) => (
            <div
              key={relation.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-semibold text-gray-800">
                  {relation.name}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {relation.direction || "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Relation ID: {relation.id}
              </p>
              <p className="text-sm text-gray-600">
                Related Entity: {relation.relatedEntityId}
              </p>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>Start: {formatDate(relation.startTime)}</p>
                <p>End: {formatDate(relation.endTime)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCategoryModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold text-black mb-4">Add Category</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!entityId) {
                  setSubmitError("Missing entityId in URL");
                  return;
                }
                if (!updateApiUrl) {
                  setSubmitError("Missing updateApiUrl. Please configure API URLs first.");
                  return;
                }

                const { categoryId, categoryMinorKind, categoryName, date } = categoryForm;
                setSubmitLoading(true);
                setSubmitError(null);
                setSuccessMessage(null);

                fetch("/api/endpoint/createCategoryAndLink", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    updateApiUrl,
                    entityId,
                    categoryId,
                    categoryMinorKind,
                    categoryName,
                    date,
                  }),
                })
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      throw new Error(data.error || data.message || "Failed to create category");
                    }
                    setSuccessMessage(`Category created: ${categoryId}`);
                    setCategoryForm({
                      categoryId: "",
                      categoryMinorKind: "parentCategory",
                      categoryName: "",
                      date: "",
                    });
                    setShowCategoryModal(false);
                  })
                  .catch((err: unknown) => {
                    setSubmitError(err instanceof Error ? err.message : "Unknown error");
                  })
                  .finally(() => {
                    setSubmitLoading(false);
                  });
              }}
            >
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Category ID</label>
                <input
                  type="text"
                  value={categoryForm.categoryId}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Category Minor Kind</label>
                <select
                  value={categoryForm.categoryMinorKind}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, categoryMinorKind: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="parentCategory">parentCategory</option>
                  <option value="childCategory">childCategory</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.categoryName}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, categoryName: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={categoryForm.date}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowCategoryModal(false)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitLoading}
                >
                  Save
                </button>
              </div>
            </form>
            {submitError && (
              <div className="mt-3 rounded-md bg-red-100 text-red-700 px-4 py-3">
                {submitError}
              </div>
            )}
            {submitLoading && (
              <div className="mt-3 text-sm text-gray-600">Saving...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}