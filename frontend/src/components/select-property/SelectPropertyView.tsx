import type { GaPropertyOption } from "@/components/PropertySelector";
import PropertySelector from "@/components/PropertySelector";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import SelectPropertyHeader from "@/components/select-property/SelectPropertyHeader";
import SelectPropertySecurityFooter from "@/components/select-property/SelectPropertySecurityFooter";
import SelectPropertyActions from "@/components/select-property/SelectPropertyActions";

type SelectPropertyViewProps = {
  properties: GaPropertyOption[];
  selectedId?: string;
  defaultPropertyId?: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onSave: () => void;
  onBack: () => void;
  onRetry: () => void;
};

export default function SelectPropertyView({
  properties,
  selectedId,
  defaultPropertyId,
  loading,
  saving,
  error,
  onSelect,
  onSave,
  onBack,
  onRetry,
}: SelectPropertyViewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <SelectPropertyHeader />
      <ErrorMessage message={error} onRetry={onRetry} />
      {loading ? (
        <LoadingSpinner label="Loading properties…" />
      ) : (
        <PropertySelector
          properties={properties}
          selectedId={selectedId}
          defaultPropertyId={defaultPropertyId}
          onSelect={onSelect}
        />
      )}
      <SelectPropertySecurityFooter />
      <SelectPropertyActions
        onBack={onBack}
        onSave={onSave}
        disabled={!selectedId || saving || loading}
        saving={saving}
      />
    </div>
  );
}
