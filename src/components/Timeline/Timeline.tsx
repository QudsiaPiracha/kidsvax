"use client";

import React, { useMemo, useState } from "react";
import { TimelineItem, type TimelineItemData } from "./TimelineItem";

export interface TimelineProps {
  items: TimelineItemData[];
  childName: string;
  children?: Array<{ id: string; name: string }>;
  onChildSelect: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

interface GroupedItems {
  group: string;
  items: TimelineItemData[];
}

export function Timeline({
  items,
  childName,
  children: childrenList,
  onChildSelect,
  onMarkComplete,
}: TimelineProps): React.JSX.Element {
  const [view, setView] = useState<"list" | "calendar">("list");
  const grouped = useMemo(() => groupByAgePhase(items), [items]);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Header
        childName={childName}
        childrenList={childrenList}
        onChildSelect={onChildSelect}
        view={view}
        onToggleView={() => setView(view === "list" ? "calendar" : "list")}
      />
      {view === "list" ? (
        <ListView groups={grouped} onMarkComplete={onMarkComplete} />
      ) : (
        <CalendarPlaceholder />
      )}
    </div>
  );
}

function Header({
  childName,
  childrenList,
  onChildSelect,
  view,
  onToggleView,
}: {
  childName: string;
  childrenList?: Array<{ id: string; name: string }>;
  onChildSelect: (id: string) => void;
  view: "list" | "calendar";
  onToggleView: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Schedule
        </h1>
        {childrenList && childrenList.length > 1 && (
          <ChildSelector
            children={childrenList}
            onSelect={onChildSelect}
          />
        )}
      </div>
      <button
        onClick={onToggleView}
        aria-label={view === "list" ? "Calendar" : "List"}
        className="min-h-[44px] min-w-[44px] text-sage-600
                   text-sm font-medium"
      >
        {view === "list" ? "Calendar" : "List"}
      </button>
    </div>
  );
}

function ChildSelector({
  children,
  onSelect,
}: {
  children: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <select
      onChange={(e) => onSelect(e.target.value)}
      className="text-sm border rounded p-1 min-h-[44px]"
    >
      {children.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function ListView({
  groups,
  onMarkComplete,
}: {
  groups: GroupedItems[];
  onMarkComplete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.group}>
          <h2 className="text-sm font-semibold text-sage-600 mb-2">
            {g.group}
          </h2>
          <div className="border-l-2 border-sage-100 ml-1.5 space-y-1">
            {g.items.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onMarkComplete={onMarkComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarPlaceholder() {
  return (
    <div className="text-center text-gray-400 py-8">
      Calendar view coming soon
    </div>
  );
}

function groupByAgePhase(items: TimelineItemData[]): GroupedItems[] {
  const map = new Map<string, TimelineItemData[]>();
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  for (const item of sorted) {
    const group = (item as TimelineItemData & { age_group?: string }).age_group ?? "Other";
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(item);
  }

  return Array.from(map.entries()).map(([group, items]) => ({
    group,
    items,
  }));
}
