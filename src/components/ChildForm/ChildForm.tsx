"use client";

import React, { useState } from "react";
import type { CreateChildInput } from "@/lib/validations/child";

export interface ChildFormData {
  name: string;
  date_of_birth: string;
  gender: "male" | "female" | "diverse";
  is_premature: boolean;
  allergies?: string;
  notes?: string;
}

interface ChildFormProps {
  onSubmit: (data: ChildFormData) => void;
  initialData?: Partial<ChildFormData>;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  date_of_birth?: string;
  gender?: string;
}

function validate(data: ChildFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.date_of_birth) errors.date_of_birth = "Date of birth is required";
  if (!data.gender) errors.gender = "Gender is required";
  return errors;
}

export function ChildForm({
  onSubmit,
  initialData,
  isLoading = false,
}: ChildFormProps) {
  const [form, setForm] = useState<ChildFormData>({
    name: initialData?.name ?? "",
    date_of_birth: initialData?.date_of_birth ?? "",
    gender: initialData?.gender ?? ("" as ChildFormData["gender"]),
    is_premature: initialData?.is_premature ?? false,
    allergies: initialData?.allergies ?? "",
    notes: initialData?.notes ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <FieldGroup
        label="Name"
        htmlFor="name"
        error={errors.name}
      >
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md p-3 min-h-[44px] text-base"
        />
      </FieldGroup>

      <FieldGroup
        label="Date of Birth"
        htmlFor="date_of_birth"
        error={errors.date_of_birth}
      >
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={handleChange}
          className="w-full border rounded-md p-3 min-h-[44px] text-base"
        />
      </FieldGroup>

      <FieldGroup
        label="Gender"
        htmlFor="gender"
        error={errors.gender}
      >
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border rounded-md p-3 min-h-[44px] text-base"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="diverse">Diverse</option>
        </select>
      </FieldGroup>

      <div className="flex items-center gap-3 min-h-[44px]">
        <input
          id="is_premature"
          name="is_premature"
          type="checkbox"
          checked={form.is_premature}
          onChange={handleChange}
          className="w-5 h-5"
          aria-label="Premature birth"
        />
        <label htmlFor="is_premature" className="text-base">
          Premature birth
        </label>
      </div>

      <FieldGroup label="Allergies" htmlFor="allergies">
        <textarea
          id="allergies"
          name="allergies"
          value={form.allergies}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded-md p-3 text-base"
        />
      </FieldGroup>

      <FieldGroup label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded-md p-3 text-base"
        />
      </FieldGroup>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full min-h-[44px] rounded-md text-white font-medium text-base
                   bg-[#5B8C5A] hover:bg-[#4a7349] disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

function FieldGroup({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[#C45C3E] text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
