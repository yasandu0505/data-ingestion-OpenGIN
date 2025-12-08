"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Function to decode protobuf StringValue
function decodeProtobufStringValue(encodedString: string): string {
  try {
    // Parse the JSON string
    const parsed = JSON.parse(encodedString);
    
    // Check if it's a protobuf StringValue
    if (parsed.typeUrl === 'type.googleapis.com/google.protobuf.StringValue' && parsed.value) {
      // Convert hex string to text
      const hexString = parsed.value;
      let decoded = '';
      
      // Process hex pairs
      for (let i = 0; i < hexString.length; i += 2) {
        const hexByte = hexString.substr(i, 2);
        const charCode = parseInt(hexByte, 16);
        decoded += String.fromCharCode(charCode);
      }
      
      return decoded;
    }
    
    // If not protobuf format, return as is
    return encodedString;
  } catch (error) {
    // If parsing fails, return the original string
    console.error('Error decoding protobuf string:', error);
    return encodedString;
  }
}

function EntitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const majorKind = searchParams.get('majorKind') || '';
  const minorKind = searchParams.get('minorKind') || '';
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Load entities from localStorage
    try {
      const stored = localStorage.getItem('selectedEntities');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.majorKind === majorKind && parsed.minorKind === minorKind) {
          setEntities(parsed.entities || []);
        }
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  }, [majorKind, minorKind]);

  // Filter entities based on search query and date range
  const filteredEntities = entities.filter((entity) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const id = (entity.id || '').toLowerCase();
      const decodedName = entity.name ? decodeProtobufStringValue(entity.name).toLowerCase() : '';
      
      if (!id.includes(query) && !decodedName.includes(query)) {
        return false;
      }
    }
    
    // Date range filter
    if (entity.created) {
      const entityDate = new Date(entity.created);
      entityDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (startDate) {
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        if (entityDate < fromDate) {
          return false;
        }
      }
      
      if (endDate) {
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (entityDate > toDate) {
          return false;
        }
      }
    } else if (startDate || endDate) {
      // If entity has no created date but filters are set, exclude it
      return false;
    }
    
    return true;
  });

  // Reset to page 1 when search query or date filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  // Pagination calculations
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading entities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">
            {majorKind} - {minorKind}
          </h1>
          <p className="text-gray-600 mb-4">
            {filteredEntities.length} of {entities.length} {entities.length === 1 ? 'entity' : 'entities'} found
          </p>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 text-black"
            />
          </div>
          
          {/* Date Range Filter */}
          <div className="mb-4 flex gap-4 flex-wrap">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 text-black"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 text-black"
              />
            </div>
            {(startDate || endDate) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear Dates
                </button>
              </div>
            )}
          </div>
        </div>

        {entities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No entities found.</p>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No entities match your search.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {paginatedEntities.map((entity, index) => (
                <div
                  key={entity.id || index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-800">
                        ID: {entity.id}
                      </p>
                      {entity.created && (
                        <p className="text-sm text-gray-500">
                          Created: {new Date(entity.created).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {entity.name && (
                      <p className="text-sm text-gray-600">
                        Name: {decodeProtobufStringValue(entity.name)}
                      </p>
                    )}
                    {entity.kind && (
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          Major: <span className="font-medium">{entity.kind.major}</span>
                        </span>
                        <span>
                          Minor: <span className="font-medium">{entity.kind.minor}</span>
                        </span>
                      </div>
                    )}
                    {entity.terminated && (
                      <p className="text-sm text-red-600">
                        Terminated: {entity.terminated}
                      </p>
                    )}
                  </div>
                </div>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EntitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <EntitiesContent />
    </Suspense>
  );
}

