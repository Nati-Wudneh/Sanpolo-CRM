"use client";

export function ConfirmDeleteButton({
  label = "Delete",
  confirmText = "Are you sure?",
  className,
}: {
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className={
        className ??
        "text-xs text-red-500 hover:text-red-700 hover:underline"
      }
    >
      {label}
    </button>
  );
}
