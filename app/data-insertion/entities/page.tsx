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
          <p className="text-gray-600">
            {entities.length} {entities.length === 1 ? 'entity' : 'entities'} found
          </p>
        </div>

        {entities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No entities found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {entities.map((entity, index) => (
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

