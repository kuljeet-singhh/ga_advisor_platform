"use client";

export type GaPropertyOption = {
  id?: string;
  propertyId?: string;
  displayName?: string;
  name?: string;
};

type PropertySelectorProps = {
  properties?: GaPropertyOption[];
  onSelect?: (id: string) => void;
  selectedId?: string;
};

export default function PropertySelector({
  properties = [],
  onSelect,
  selectedId,
}: PropertySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {properties.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No properties loaded. Wire to backend GET /ga/properties.
        </p>
      ) : (
        properties.map((p) => {
          const pid = p.id ?? p.propertyId ?? "";
          return (
            <label
              key={pid}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
            >
              <input
                type="radio"
                name="property"
                checked={pid === selectedId}
                onChange={() => onSelect?.(pid)}
              />
              <span className="text-sm text-zinc-800">{p.displayName ?? p.name}</span>
            </label>
          );
        })
      )}
    </div>
  );
}
