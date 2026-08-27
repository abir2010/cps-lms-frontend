"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export interface LessonFormValues {
  title: string;
  type: "text" | "video";
  content: string; // text_content or video_url, depending on `type`
}

interface LessonFormProps {
  initialValues?: LessonFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: LessonFormValues) => void;
  onCancel?: () => void;
}

/**
 * One form, reused for both "add a lesson" and "edit a lesson" — the two
 * flows only differ in initial values and what the submit handler does with
 * them, so there's no reason to keep two near-identical forms in sync.
 */
export function LessonForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: LessonFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [type, setType] = useState<"text" | "video">(
    initialValues?.type ?? "text",
  );
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (title.trim().length < 3) {
      setError("Lesson title must be at least 3 characters.");
      return;
    }
    if (!content.trim()) {
      setError(
        type === "text"
          ? "Please add the lesson's text content."
          : "Please add a video URL.",
      );
      return;
    }
    onSubmit({ title, type, content });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lessonTitle">Lesson Title</Label>
        <Input
          id="lessonTitle"
          placeholder="e.g., Getting Started with Variables"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Lesson Type</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            if (value === "text" || value === "video") {
              setType(value);
              setContent("");
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a lesson type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {type === "text" ? (
          <>
            <Label htmlFor="lessonContent">Lesson Content</Label>
            <Textarea
              id="lessonContent"
              className="min-h-30"
              placeholder="Write the lesson content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <>
            <Label htmlFor="lessonContent">Video URL</Label>
            <Input
              id="lessonContent"
              placeholder="https://..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        )}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
