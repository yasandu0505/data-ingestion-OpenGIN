"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CreateContent() {
  const searchParams = useSearchParams();
  const readApiUrl = searchParams.get('readApiUrl') || '';
  const updateApiUrl = searchParams.get('updateApiUrl') || '';

  const handleOrgCreation = () => {
    // TODO: Handle organization creation
    console.log('Organization creation clicked');
  };

  const handleDataInsertion = () => {
    // TODO: Handle data insertion
    console.log('Data insertion clicked');
  };

  return (
    <div className="flex items-center justify-center min-h-screen gap-6 p-4">
      {/* Organization Creation Box */}
      <div 
        onClick={handleOrgCreation}
        className="bg-white rounded-lg shadow-lg p-12 border-2 border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all text-center w-[350px] flex items-center justify-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800">Organization Creation</h2>
      </div>

      {/* Data Insertion Box */}
      <div 
        onClick={handleDataInsertion}
        className="bg-white rounded-lg shadow-lg p-12 border-2 border-gray-200 cursor-pointer hover:border-green-500 hover:shadow-xl transition-all text-center w-[350px] flex items-center justify-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800">Data Insertion for Organization</h2>
      </div>
    </div>
  );
}

export default function Create() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <CreateContent />
    </Suspense>
  );
}