"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadGroupImage } from "@/app/actions/images";
import { Button } from "@/components/ui/Button";

export function ImageUploadForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        await uploadGroupImage(groupId, formData);
      }
      router.refresh();
    } catch {
      setError("Hochladen fehlgeschlagen.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        disabled={isUploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Wird hochgeladen…" : "+ Bild hinzufügen"}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
