"use client";

import React, { useState } from "react";
import { formatDateDE } from "@/lib/age-utils";

export interface TimelineItemData {
  id: string;
  name: string;
  type: "u_exam" | "vaccination";
  status: "completed" | "upcoming" | "overdue" | "scheduled" | "skipped";
  scheduled_date: string;
  details: string;
  administered_date: string | null;
  physician: string | null;
}

export interface TimelineItemProps {
  item: TimelineItemData;
  onMarkComplete: (id: string) => void;
}

export function TimelineItem({
  item,
  onMarkComplete,
}: TimelineItemProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = getBadgeClass(item);
  const isActionable = item.status === "upcoming" || item.status === "overdue";

  return (
    <div data-testid="timeline-item">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-3 p-3
                   min-h-[44px]"
      >
        <StatusBadge className={badgeClass} />
        <ItemName name={item.name} status={item.status} />
        <span className="ml-auto text-xs text-gray-400">
          {formatDateDE(item.scheduled_date)}
        </span>
      </button>
      <ExpandedDetails
        item={item}
        expanded={expanded}
        isActionable={isActionable}
        onMarkComplete={onMarkComplete}
      />
    </div>
  );
}

function StatusBadge({ className }: { className: string }) {
  return (
    <span
      data-testid="status-badge"
      className={`w-3 h-3 rounded-full shrink-0 ${className}`}
    />
  );
}

function ItemName({
  name,
  status,
}: {
  name: string;
  status: TimelineItemData["status"];
}) {
  const cls = status === "skipped" ? "line-through text-gray-400" : "text-gray-900";
  return <span className={`text-sm font-medium ${cls}`}>{name}</span>;
}

function getBadgeClass(item: TimelineItemData): string {
  if (item.status === "completed") return "bg-sage-500";
  if (item.status === "overdue") return "bg-terracotta-500";
  if (item.status === "skipped") return "bg-gray-300";
  if (item.status === "upcoming") {
    const days = daysUntil(item.scheduled_date);
    if (days <= 30) return "bg-warm-amber-500";
  }
  return "bg-gray-300";
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function ExpandedDetails({
  item,
  expanded,
  isActionable,
  onMarkComplete,
}: {
  item: TimelineItemData;
  expanded: boolean;
  isActionable: boolean;
  onMarkComplete: (id: string) => void;
}) {
  if (!expanded) return null;

  return (
    <div className="px-3 pb-3 text-sm text-gray-600 space-y-1">
      <p>{item.details}</p>
      {item.administered_date && (
        <p>Administered: {formatDateDE(item.administered_date)}</p>
      )}
      {item.physician && <p>Physician: {item.physician}</p>}
      {isActionable && (
        <button
          onClick={() => onMarkComplete(item.id)}
          className="mt-2 min-h-[44px] px-4 rounded-md bg-sage-500
                     text-white text-sm font-medium hover:bg-sage-600"
        >
          Mark as completed
        </button>
      )}
    </div>
  );
}
