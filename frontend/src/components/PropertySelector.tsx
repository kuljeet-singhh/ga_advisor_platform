"use client";

export type GaPropertyOption = {
  id?: string;
  propertyId?: string;
  displayName?: string;
  name?: string;
  accountDisplayName?: string | null;
};

const ICON_PALETTE = [
  "bg-violet-100 text-violet-600",
  "bg-teal-100 text-teal-600",
  "bg-amber-100 text-amber-600",
  "bg-pink-100 text-pink-600",
] as const;

type PropertySelectorProps = {
  properties?: GaPropertyOption[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  defaultPropertyId?: string | null;
};

export default function PropertySelector({
  properties = [],
  onSelect,
  selectedId,
  defaultPropertyId,
}: PropertySelectorProps) {
  if (properties.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No properties found. Check your Google Analytics access and try again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="GA4 properties">
      {properties.map((p, index) => {
        const pid = p.id ?? p.propertyId ?? "";
        const selected = pid === selectedId;
        const isDefault = defaultPropertyId != null && pid === defaultPropertyId;
        const iconClass = ICON_PALETTE[index % ICON_PALETTE.length];
        const name = p.displayName ?? p.name ?? pid;

        return (
          <label
            key={pid}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
              selected
                ? "border-2 border-blue-600 bg-blue-50/30"
                : "border border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="property"
              className="sr-only"
              checked={selected}
              onChange={() => onSelect?.(pid)}
            />
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
              aria-hidden
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900">{name}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Property ID: {pid}
                {p.accountDisplayName ? ` · Account: ${p.accountDisplayName}` : ""}
              </span>
            </span>
            {isDefault ? (
              <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                Default
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
