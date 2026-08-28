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
import type { QuizOption } from "@/src/store/api/quizApi";
import { useState } from "react";

export interface QuizQuestionFormValues {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuizOption;
}

interface QuizQuestionFormProps {
  initialValues?: QuizQuestionFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: QuizQuestionFormValues) => void;
  onCancel?: () => void;
}

const EMPTY: QuizQuestionFormValues = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
};

export function QuizQuestionForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: QuizQuestionFormProps) {
  const [values, setValues] = useState<QuizQuestionFormValues>(
    initialValues ?? EMPTY,
  );
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof QuizQuestionFormValues>(
    key: K,
    value: QuizQuestionFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    setError(null);
    if (values.question.trim().length < 5) {
      setError("The question must be at least 5 characters.");
      return;
    }
    if (
      !values.option_a.trim() ||
      !values.option_b.trim() ||
      !values.option_c.trim() ||
      !values.option_d.trim()
    ) {
      setError("All four options are required.");
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          placeholder="e.g., What does HTML stand for?"
          value={values.question}
          onChange={(e) => setField("question", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["A", "B", "C", "D"] as const).map((option) => (
          <div key={option} className="space-y-2">
            <Label htmlFor={`option_${option.toLowerCase()}`}>
              Option {option}
            </Label>
            <Input
              id={`option_${option.toLowerCase()}`}
              placeholder={`Option ${option}`}
              value={
                values[
                  `option_${option.toLowerCase() as "a" | "b" | "c" | "d"}`
                ]
              }
              onChange={(e) =>
                setField(
                  `option_${option.toLowerCase() as "a" | "b" | "c" | "d"}`,
                  e.target.value,
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Correct Answer</Label>
        <Select
          value={values.correct_answer}
          onValueChange={(value) => {
            if (
              value === "A" ||
              value === "B" ||
              value === "C" ||
              value === "D"
            ) {
              setField("correct_answer", value);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the correct option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Option A</SelectItem>
            <SelectItem value="B">Option B</SelectItem>
            <SelectItem value="C">Option C</SelectItem>
            <SelectItem value="D">Option D</SelectItem>
          </SelectContent>
        </Select>
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
