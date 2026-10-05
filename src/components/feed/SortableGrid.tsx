"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { moveItem } from "@/lib/feed";
import { AnimatedCard, ContentCard } from "@/components/cards/ContentCard";
import { GRID_CLASS } from "@/components/cards/CardSkeleton";

/**
 * Drag-and-drop grid built on dnd-kit.
 * Why dnd-kit over React DnD: it supports pointer, touch AND keyboard dragging
 * (Space to lift, arrows to move, Space to drop) with screen-reader
 * announcements out of the box — important for WCAG compliance.
 */
export function SortableGrid({ items, onReorder }: { items: ContentItem[]; onReorder: (ids: string[]) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    // A small distance threshold keeps normal clicks/taps working.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map((i) => i.id);
  const activeItem = activeId ? items.find((i) => i.id === activeId) : undefined;

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onReorder(moveItem(ids, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ul className={GRID_CLASS} data-testid="sortable-grid">
          {items.map((item, index) => (
            <SortableCard key={item.id} item={item} index={index} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
        {activeItem ? <ContentCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableCard({ item, index }: { item: ContentItem; index: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-30" : undefined}
    >
      <AnimatedCard index={index}>
        <ContentCard
          item={item}
          priority={index < 3}
          dragHandle={{ ref: setActivatorNodeRef, attributes, listeners }}
        />
      </AnimatedCard>
    </li>
  );
}
