"use client";
import { useRouter } from "next/navigation";
import { useApiUrls } from "@/lib/api-urls-context";

export default function Create() {
  const router = useRouter();
  const { readApiUrl, updateApiUrl } = useApiUrls();

  const handleOrgCreation = () => {
    // TODO: Handle organization creation
    console.log('Organization creation clicked');
  };

  const handleDataInsertion = () => {
    router.push('/data-insertion');
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