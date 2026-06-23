import type { ReactNode } from "react";
import { ReorderArrows } from "./ui";

interface HasId {
  id: string;
}

/**
 * A list whose items can be reordered with up/down arrows (click to reorder).
 * Same API as before — `onReorder(from, to)` moves an item.
 */
export function SortableList<T extends HasId>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="relative rounded-xl border border-line bg-elevated p-3"
        >
          {items.length > 1 && (
            <ReorderArrows
              index={i}
              count={items.length}
              onMove={onReorder}
              className="absolute left-1 top-2.5"
            />
          )}
          <div className={items.length > 1 ? "pl-5" : ""}>{renderItem(item, i)}</div>
        </div>
      ))}
    </div>
  );
}
