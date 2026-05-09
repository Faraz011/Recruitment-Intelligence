"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { batchUpload } from "@/lib/api";

interface BatchUploaderProps {
  onSuccess: () => void;
}

interface CompletionResult {
  succeeded: number;
  failed: number;
  skipped: number;
}

export default function BatchUploader({ onSuccess }: BatchUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    setProgress({ current: 0, total: 1 });

    try {
      const result = await batchUpload(file);

      toast.success(
        `Processed ${result.succeeded} JDs successfully${
          result.failed > 0 ? `, ${result.failed} failed` : ""
        }${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}`,
      );

      setCompletionResult({
        succeeded: result.succeeded,
        failed: result.failed,
        skipped: result.skipped,
      });

      setProgress(null);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsLoading(false);
      setProgress(null);
      e.target.value = "";
    }
  };

  const downloadSampleCSV = () => {
    const csv = "raw_text,source_url\nEnter job description here,...\n";
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv),
    );
    element.setAttribute("download", "sample_jds_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="csv-upload"
          className="block text-sm font-medium text-gray-700"
        >
          Upload CSV File
        </label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-center">
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isLoading ? "Processing..." : "Click to upload CSV"}
              </p>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadSampleCSV}
            className="px-4 py-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            Download Sample
          </button>
        </div>
      </div>

      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing...</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {completionResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-900 text-lg mb-3">
                ✓ Batch Processing Complete
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded p-3 border border-green-100">
                  <p className="text-xs text-gray-600 font-medium">Succeeded</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completionResult.succeeded}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-yellow-100">
                  <p className="text-xs text-gray-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {completionResult.failed}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-gray-100">
                  <p className="text-xs text-gray-600 font-medium">Skipped</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {completionResult.skipped}
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-700 mt-3">
                All {completionResult.succeeded + completionResult.failed + completionResult.skipped} records have been processed.
                {completionResult.succeeded > 0 && (
                  <> Successfully added <strong>{completionResult.succeeded}</strong> job descriptions to your dashboard.</>
                )}
              </p>
            </div>
            <button
              onClick={() => setCompletionResult(null)}
              className="text-green-600 hover:text-green-700 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
