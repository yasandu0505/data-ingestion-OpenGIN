"use client";
import { useState, useEffect } from "react";
import { useApiUrls } from "@/lib/api-urls-context";

export default function DataInsertion() {
  const { kindPairs, readApiUrl } = useApiUrls();
  const [counts, setCounts] = useState<{ [key: string]: number | null }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (kindPairs.length === 0 || !readApiUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Create promises for all kindPairs concurrently
      const promises = kindPairs.map(async (pair) => {
        const key = `${pair.majorKind}-${pair.minorKind}`;
        try {
          const response = await fetch('/api/endpoint/getEntity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              readApiUrl,
              majorKind: pair.majorKind,
              minorKind: pair.minorKind,
            }),
          });

          const data = await response.json();
          
          if (response.ok && data.success) {
            return { key, count: data.count || 0 };
          } else {
            return { key, count: null };
          }
        } catch (error) {
          console.error(`Error fetching count for ${key}:`, error);
          return { key, count: null };
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Convert results to object
      const countsMap: { [key: string]: number | null } = {};
      results.forEach(({ key, count }) => {
        countsMap[key] = count;
      });
      
      setCounts(countsMap);
      setLoading(false);
    };

    fetchCounts();
  }, [kindPairs, readApiUrl]);

  const handleEntitySelect = (majorKind: string, minorKind: string) => {
    // TODO: Handle entity selection
    console.log('Selected entity:', { majorKind, minorKind });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-8">Select an Entity Type</h1>
        
        {kindPairs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No kind pairs available. Please add them from the home page.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading counts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindPairs.map((pair, index) => {
              const key = `${pair.majorKind}-${pair.minorKind}`;
              const count = counts[key];
              
              return (
                <div
                  key={index}
                  onClick={() => handleEntitySelect(pair.majorKind, pair.minorKind)}
                  className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-600">Major Kind</p>
                      <p className="text-lg font-semibold text-gray-800">{pair.majorKind}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-600">Minor Kind</p>
                      <p className="text-lg font-semibold text-gray-800">{pair.minorKind}</p>
                    </div>
                    <div className="border-t border-gray-200 w-full pt-3 mt-2">
                      <p className="text-4xl font-bold text-blue-600">
                        {count !== null ? count : '—'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Entities</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}