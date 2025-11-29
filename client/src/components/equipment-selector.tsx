// CHANGE SUMMARY (2025-11-29):
// - Created reusable EquipmentSelector component for consistent equipment UI.
// - Used across onboarding and profile/settings screens.
// - Multi-select with icon-based cards from centralized EQUIPMENT_OPTIONS.
// - Dynamically imports lucide-react icons based on equipment config.

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EQUIPMENT_OPTIONS, type EquipmentId } from "@shared/equipment";
import * as LucideIcons from "lucide-react";

interface EquipmentSelectorProps {
  value: EquipmentId[];
  onChange: (value: EquipmentId[]) => void;
  mode?: 'onboarding' | 'settings';
}

/**
 * Reusable equipment selector component with multi-select functionality.
 * Displays equipment options in a grid with icons and labels.
 * Ensures consistent UX across onboarding and settings.
 */
export function EquipmentSelector({ value, onChange, mode = 'onboarding' }: EquipmentSelectorProps) {
  const handleToggle = (id: EquipmentId) => {
    const isSelected = value.includes(id);

    if (isSelected) {
      // Deselect - but never allow empty selection (always keep at least bodyweight)
      const newValue = value.filter((x) => x !== id);
      onChange(newValue.length > 0 ? newValue : ['bodyweight']);
    } else {
      // Select
      onChange([...value, id]);
    }
  };

  return (
    <div className={cn(
      "grid gap-3",
      mode === 'onboarding' ? "grid-cols-2 overflow-y-auto max-h-[calc(100vh-22rem)] pr-1" : "grid-cols-2"
    )}>
      {EQUIPMENT_OPTIONS.map((equipment) => {
        // Dynamically get the icon component from lucide-react
        const IconComponent = (LucideIcons as any)[equipment.iconName] || LucideIcons.Circle;
        const isSelected = value.includes(equipment.id);

        return (
          <Card
            key={equipment.id}
            className={cn(
              "p-4 border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2",
              mode === 'onboarding' ? "aspect-square" : "min-h-[100px]",
              isSelected
                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                : "border-border/50 bg-card/50 hover:border-primary/50"
            )}
            onClick={() => handleToggle(equipment.id)}
            data-testid={`option-equipment-${equipment.id}`}
          >
            <IconComponent
              className={cn(
                "w-8 h-8",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-sm font-bold text-center leading-tight">
              {equipment.label}
            </span>
            {mode === 'settings' && equipment.description && (
              <span className="text-xs text-muted-foreground text-center">
                {equipment.description}
              </span>
            )}
          </Card>
        );
      })}
    </div>
  );
}
