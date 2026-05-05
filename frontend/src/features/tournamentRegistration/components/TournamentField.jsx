import React from "react";

export default function TournamentField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  helpText,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-brandDark">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-brandDark shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
      />
      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </label>
  );
}