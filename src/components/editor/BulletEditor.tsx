import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import { IconButton, AutoTextarea } from "../common/ui";

export function BulletEditor({
  bullets,
  onChange,
  placeholder = "Describe an achievement…",
  addLabel = "Add bullet",
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const update = (i: number, v: string) =>
    onChange(bullets.map((b, idx) => (idx === i ? v : b)));
  const remove = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const add = () => onChange([...bullets, ""]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onChange(arrayMove(bullets, Number(active.id), Number(over.id)));
  };

  const draggable = bullets.length > 1;

  return (
    <div className="space-y-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={bullets.map((_, i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {bullets.map((b, i) => (
              <BulletRow
                key={i}
                id={String(i)}
                value={b}
                placeholder={placeholder}
                draggable={draggable}
                onChange={(v) => update(i, v)}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={add}
        className="ml-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

function BulletRow({
  id,
  value,
  placeholder,
  draggable,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  placeholder: string;
  draggable: boolean;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-1.5 ${isDragging ? "opacity-90" : ""}`}
    >
      {draggable ? (
        <button
          type="button"
          className="mt-1.5 cursor-grab text-muted/50 transition-colors hover:text-accent active:cursor-grabbing"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
      ) : (
        <span className="mt-2 text-accent">•</span>
      )}
      <AutoTextarea
        className="min-h-[34px] py-1.5 leading-snug"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <IconButton onClick={onRemove} title="Remove" className="mt-1">
        <X size={14} />
      </IconButton>
    </div>
  );
}
