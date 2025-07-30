// 📁 src/components/ui/FormField/CheckboxField.tsx
import { FieldWrapper } from './FieldWrapper';
import { Checkbox } from '@components/ui/checkbox';

interface CheckboxFieldProps {
  label: string;
  description?: string;
  error?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CheckboxField({
  label,
  description,
  error,
  checked,
  onCheckedChange,
  disabled,
}: CheckboxFieldProps) {
  return (
    <FieldWrapper label="" error={error}>
      <div className="flex items-start space-x-3">
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">{label}</label>
          {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
      </div>
    </FieldWrapper>
  );
}
