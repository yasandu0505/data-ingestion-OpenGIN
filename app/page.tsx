"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApiUrls, IKindPair } from "@/lib/api-urls-context";

type ConnectionPhase = 'idle' | 'saving' | 'saved' | 'validating' | 'success' | 'failed';

export default function Home() {

  const router = useRouter();
  const { setApiUrls } = useApiUrls();
  const [readApiUrl, setReadApiUrl] = useState("");
  const [updateApiUrl, setUpdateApiUrl] = useState("");
  const [kindPairs, setKindPairs] = useState<IKindPair[]>([{ majorKind: "", minorKind: "" }]);
  const [phase, setPhase] = useState<ConnectionPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    // Validate inputs
    if (!readApiUrl.trim() || !updateApiUrl.trim()) {
      setErrorMessage('Please fill in both API URLs');
      return;
    }

    // Filter out empty kind pairs and validate
    const validKindPairs = kindPairs.filter(
      (pair) => pair.majorKind.trim() && pair.minorKind.trim()
    );

    // Start the process - unmount form and show loading
    setPhase('saving');
    setErrorMessage(null);

    const requestBody = {
      readApiUrl: readApiUrl.trim(),
      updateApiUrl: updateApiUrl.trim(),
      kindPairs: validKindPairs.map((pair) => ({
        majorKind: pair.majorKind.trim(),
        minorKind: pair.minorKind.trim(),
      })),
    };

    console.log('Sending request with kindPairs:', JSON.stringify(requestBody, null, 2));

    try {
      // Step 1: Save endpoints
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Step 2: Show saved message
        setPhase('saved');
        
        // Wait a moment before starting validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Start validation
        setPhase('validating');
        
        try {
          const validateResponse = await fetch('/api/endpoint/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              readApiUrl: data.data.readApiUrl,
              updateApiUrl: data.data.updateApiUrl,
            }),
          });

          const validateData = await validateResponse.json();

          if (validateResponse.ok && validateData.success) {
            // Step 4: Connection successful - store URLs and kindPairs in context and show success message
            setApiUrls(
              data.data.readApiUrl,
              data.data.updateApiUrl,
              data.data.kindPairs || []
            );
            setPhase('success');
            
            // Navigate to /create after showing success message for 1.5 seconds
            setTimeout(() => {
              router.push('/create');
            }, 1500);
          } else {
            // Step 4: Connection failed
            const errors = [];
            if (!validateData.data?.readApi?.success) {
              errors.push(`Read API: ${validateData.data?.readApi?.error || 'Failed'}`);
            }
            if (!validateData.data?.updateApi?.success) {
              errors.push(`Update API: ${validateData.data?.updateApi?.error || 'Failed'}`);
            }
            setErrorMessage(`Validation failed: ${errors.join(', ')}`);
            setPhase('failed');
          }
        } catch (validateError) {
          setErrorMessage(validateError instanceof Error ? validateError.message : 'Failed to validate connection');
          setPhase('failed');
        }
      } else {
        setErrorMessage(data.message || 'Failed to save endpoints');
        setPhase('failed');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while saving');
      setPhase('failed');
    }
  }

  const handleReset = () => {
    setPhase('idle');
    setReadApiUrl("");
    setUpdateApiUrl("");
    setKindPairs([{ majorKind: "", minorKind: "" }]);
    setErrorMessage(null);
  }

  const addKindPair = () => {
    setKindPairs([...kindPairs, { majorKind: "", minorKind: "" }]);
  };

  const removeKindPair = (index: number) => {
    if (kindPairs.length > 1) {
      setKindPairs(kindPairs.filter((_, i) => i !== index));
    }
  };

  const updateKindPair = (index: number, field: 'majorKind' | 'minorKind', value: string) => {
    const updated = [...kindPairs];
    updated[index] = { ...updated[index], [field]: value };
    setKindPairs(updated);
  };

  // Loading component that shows different states
  const LoadingComponent = () => {
    const getMessage = () => {
      switch (phase) {
        case 'saving':
          return 'Saving...';
        case 'saved':
          return 'Endpoints saved successfully';
        case 'validating':
          return 'Validating the endpoints...';
        case 'success':
          return 'Connection successful';
        case 'failed':
          return 'Connection unsuccessful';
        default:
          return '';
      }
    };

    const showSpinner = phase === 'saving' || phase === 'validating';
    const isSuccess = phase === 'success' || phase === 'saved';
    const isError = phase === 'failed';

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          {showSpinner && (
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
          {(isSuccess || isError) && (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isSuccess ? (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}
          <p className={`text-lg font-medium ${
            isSuccess ? 'text-green-800' : isError ? 'text-red-800' : 'text-blue-800'
          }`}>
            {getMessage()}
          </p>
          {errorMessage && phase === 'failed' && (
            <p className="text-sm text-red-600 text-center mt-2">{errorMessage}</p>
          )}
          {(phase === 'failed') && (
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Connect Again
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render form or loading component based on phase
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 py-8 px-4">
        <h1 className="text-2xl font-bold">Connect to OpenGIN</h1>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              className="border-2 border-gray-300 rounded-md p-2" 
              placeholder="Read API" 
              value={readApiUrl} 
              onChange={(e) => setReadApiUrl(e.target.value)}
            />
            <input 
              type="text" 
              className="border-2 border-gray-300 rounded-md p-2" 
              placeholder="Update API" 
              value={updateApiUrl} 
              onChange={(e) => setUpdateApiUrl(e.target.value)}
            />
          </div>

          {/* Kind Pairs Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">Kind Pairs</label>
            {kindPairs.map((pair, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="border-2 border-gray-300 rounded-md p-2 flex-1"
                  placeholder="Major Kind"
                  value={pair.majorKind}
                  onChange={(e) => updateKindPair(index, 'majorKind', e.target.value)}
                />
                <input
                  type="text"
                  className="border-2 border-gray-300 rounded-md p-2 flex-1"
                  placeholder="Minor Kind"
                  value={pair.minorKind}
                  onChange={(e) => updateKindPair(index, 'minorKind', e.target.value)}
                />
                {kindPairs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKindPair(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                    title="Remove pair"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addKindPair}
              className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Add Kind Pair</span>
            </button>
          </div>

          <button 
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors" 
            onClick={handleConnect}
          >
            Connect
          </button>
          {errorMessage && phase === 'idle' && (
            <div className="p-3 rounded-md bg-red-100 text-red-800 border border-red-300">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <LoadingComponent />;
}
