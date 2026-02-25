"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
}

interface ExtractedItem {
  vaccine_name?: string;
  exam_type?: string;
  dose_number?: number;
  administered_date?: string;
  exam_date?: string;
  physician_name?: string;
  confidence: number;
}

interface ScanResult {
  document_type: "vaccination_record" | "u_exam_record";
  confidence: number;
  extracted_items: ExtractedItem[];
  low_confidence_fields: Array<{ field: string; confidence: number }>;
}

type PageState = "upload" | "scanning" | "review" | "confirming" | "success" | "error";

export default function ScanPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState<"vaccination_record" | "u_exam_record">("vaccination_record");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageState, setPageState] = useState<PageState>("upload");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmResult, setConfirmResult] = useState<{ inserted: number; skipped: number } | null>(null);

  const fetchChild = useCallback(async () => {
    try {
      const res = await fetch(`/api/children/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChild(data.child);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChild();
  }, [fetchChild]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  async function handleScan() {
    if (!selectedFile) return;

    setPageState("scanning");
    setErrorMsg("");

    try {
      const base64 = await fileToBase64(selectedFile);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, document_type: docType }),
      });

      if (!res.ok) {
        setPageState("error");
        setErrorMsg("Could not scan document. The AI service may be temporarily unavailable.");
        return;
      }

      const result: ScanResult = await res.json();
      setScanResult(result);
      setPageState("review");
    } catch {
      setPageState("error");
      setErrorMsg("Could not scan document. Please check your connection and try again.");
    }
  }

  async function handleConfirm() {
    if (!scanResult || !child) return;

    setPageState("confirming");

    const isVax = scanResult.document_type === "vaccination_record";
    const body = isVax
      ? {
          confirm_type: "vaccination",
          child_id: child.id,
          items: scanResult.extracted_items.map((item) => ({
            vaccine_name: item.vaccine_name,
            dose_number: item.dose_number,
            administered_date: item.administered_date,
            physician_name: item.physician_name,
          })),
        }
      : {
          confirm_type: "u_exam",
          child_id: child.id,
          items: scanResult.extracted_items.map((item) => ({
            exam_type: item.exam_type,
            exam_date: item.exam_date,
            physician_name: item.physician_name,
          })),
        };

    try {
      const res = await fetch("/api/scan/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmResult({ inserted: data.inserted ?? 0, skipped: data.skipped ?? 0 });
        setPageState("success");
      } else {
        setPageState("error");
        setErrorMsg("Failed to save scanned records.");
      }
    } catch {
      setPageState("error");
      setErrorMsg("Failed to save scanned records.");
    }
  }

  function handleReset() {
    setPageState("upload");
    setScanResult(null);
    setSelectedFile(null);
    setConfirmResult(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
        <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
        <div className="rounded-xl border border-sage-100 bg-white p-6">
          <div className="h-40 animate-pulse rounded bg-gray-50" />
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8 text-center">
        <p className="text-terracotta-500">Child not found</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-sage-600 hover:text-sage-700"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/children/${id}`)}
          className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
        >
          ← Back
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Scan Document</h1>
        <p className="text-sm text-gray-500">for {child.name}</p>
      </div>

      {/* Upload state */}
      {pageState === "upload" && (
        <div className="space-y-4">
          {/* Document type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDocType("vaccination_record")}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                  docType === "vaccination_record"
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-gray-200 text-gray-600 hover:border-sage-300"
                }`}
              >
                Vaccination Record
              </button>
              <button
                onClick={() => setDocType("u_exam_record")}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                  docType === "u_exam_record"
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-gray-200 text-gray-600 hover:border-sage-300"
                }`}
              >
                U-Exam Record
              </button>
            </div>
          </div>

          {/* File upload */}
          <div className="rounded-xl border-2 border-dashed border-sage-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Take a photo or select an image of your paper record
            </p>
            <input
              ref={fileInputRef}
              data-testid="file-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0
                         file:bg-sage-100 file:px-4 file:py-2 file:text-sm file:font-medium
                         file:text-sage-700 hover:file:bg-sage-200"
            />
            {selectedFile && (
              <p className="mt-2 text-xs text-sage-600">{selectedFile.name}</p>
            )}
          </div>

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={!selectedFile}
            className="w-full min-h-[44px] rounded-lg bg-sage-500 px-4 py-2.5
                       text-sm font-semibold text-white hover:bg-sage-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Scan Document
          </button>
        </div>
      )}

      {/* Scanning state */}
      {pageState === "scanning" && (
        <div className="rounded-xl border border-sage-100 bg-white p-8 text-center">
          <div className="mb-3 text-2xl animate-pulse">📷</div>
          <p className="text-sm font-medium text-gray-900">Scanning document...</p>
          <p className="mt-1 text-xs text-gray-500">
            AI is extracting records from your photo
          </p>
        </div>
      )}

      {/* Review state */}
      {pageState === "review" && scanResult && (
        <div className="space-y-4">
          <div className="rounded-xl border border-sage-100 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Found {scanResult.extracted_items.length} item{scanResult.extracted_items.length !== 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-gray-400">
                {Math.round(scanResult.confidence * 100)}% confidence
              </span>
            </div>

            <div className="space-y-2">
              {scanResult.extracted_items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.vaccine_name || item.exam_type || "Record"}
                      {item.dose_number ? ` (Dose ${item.dose_number})` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.administered_date || item.exam_date}
                      {item.physician_name ? ` · ${item.physician_name}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      item.confidence >= 0.8
                        ? "text-sage-600"
                        : item.confidence >= 0.6
                          ? "text-warm-amber-600"
                          : "text-terracotta-500"
                    }`}
                  >
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>

            {scanResult.low_confidence_fields.length > 0 && (
              <div className="mt-3 rounded-lg bg-warm-amber-50 p-3">
                <p className="text-xs font-medium text-warm-amber-700">
                  Some fields have low confidence. Please review before confirming.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 min-h-[44px] rounded-lg border border-gray-200
                         px-4 py-2.5 text-sm font-medium text-gray-600
                         hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 min-h-[44px] rounded-lg bg-sage-500 px-4 py-2.5
                         text-sm font-semibold text-white hover:bg-sage-600 transition-colors"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      )}

      {/* Confirming state */}
      {pageState === "confirming" && (
        <div className="rounded-xl border border-sage-100 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-900">Saving records...</p>
        </div>
      )}

      {/* Success state */}
      {pageState === "success" && confirmResult && (
        <div className="rounded-xl border border-sage-100 bg-white p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="text-sm font-medium text-gray-900">
            {confirmResult.inserted} item{confirmResult.inserted !== 1 ? "s" : ""} added to {child.name}&apos;s records
          </p>
          {confirmResult.skipped > 0 && (
            <p className="text-xs text-gray-500">
              {confirmResult.skipped} duplicate{confirmResult.skipped !== 1 ? "s" : ""} skipped
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 min-h-[44px] rounded-lg border border-gray-200
                         px-4 py-2.5 text-sm font-medium text-gray-600
                         hover:bg-gray-50 transition-colors"
            >
              Scan Another
            </button>
            <button
              onClick={() => router.push(`/children/${id}`)}
              className="flex-1 min-h-[44px] rounded-lg bg-sage-500 px-4 py-2.5
                         text-sm font-semibold text-white hover:bg-sage-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {pageState === "error" && (
        <div className="rounded-xl border border-terracotta-200 bg-terracotta-50 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-terracotta-600">
            {errorMsg || "Could not scan document."}
          </p>
          <p className="text-xs text-gray-500">
            The AI service may be temporarily unavailable. Your records are safe.
          </p>
          <button
            onClick={handleReset}
            className="min-h-[44px] rounded-lg border border-terracotta-200
                       px-4 py-2.5 text-sm font-medium text-terracotta-600
                       hover:bg-terracotta-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
