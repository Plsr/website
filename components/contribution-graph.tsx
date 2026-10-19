"use client";

import { useState, type KeyboardEvent } from "react";
import {
  formatContributionDay,
  weekdayIndex,
  type ContributionCalendar,
  type ContributionDay,
} from "@/lib/contribution-calendar";

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

type CellPosition = {
  week: number;
  row: number;
};

export function ContributionGraph({ calendar }: { calendar: ContributionCalendar }) {
  const positions = indexDays(calendar);
  const latest = positions.at(-1);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    above: boolean;
  } | null>(null);

  const tabDate = activeDate ?? latest?.day.date ?? null;
  const captionDay =
    positions.find((position) => position.day.date === activeDate)?.day ?? latest?.day ?? null;
  const monthLabels = getMonthLabels(calendar.weeks);

  function show(day: ContributionDay, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const above = rect.top > 48;
    setActiveDate(day.date);
    setTooltip({
      x: rect.left + rect.width / 2,
      y: above ? rect.top : rect.bottom,
      above,
    });
  }

  function focusDate(date: string) {
    document
      .querySelector<HTMLButtonElement>(`[data-contribution-date="${date}"]`)
      ?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = document.activeElement?.getAttribute("data-contribution-date");
    if (!current) return;

    const start = positions.find((position) => position.day.date === current);
    if (!start) return;

    let next: (typeof positions)[number] | null = null;

    if (event.key === "ArrowLeft") next = findOffset(positions, start, -1, 0);
    if (event.key === "ArrowRight") next = findOffset(positions, start, 1, 0);
    if (event.key === "ArrowUp") next = findOffset(positions, start, 0, -1);
    if (event.key === "ArrowDown") next = findOffset(positions, start, 0, 1);
    if (event.key === "Home" || event.key === "End") {
      const inRow = positions.filter((position) => position.row === start.row);
      next = event.key === "Home" ? (inRow[0] ?? null) : (inRow.at(-1) ?? null);
    }

    if (!next || next.day.date === current) return;
    event.preventDefault();
    focusDate(next.day.date);
  }

  const columns = `repeat(${calendar.weeks.length}, var(--contrib-cell))`;

  return (
    <div>
      <div className="flex">
        <div aria-hidden="true" className="shrink-0 pr-1.5 pt-5">
          <div
            className="grid"
            style={{
              gridTemplateRows: "repeat(7, var(--contrib-cell))",
              rowGap: "var(--contrib-gap)",
            }}
          >
            {DAY_LABELS.map((label, row) => (
              <span
                key={row}
                className="flex w-6 items-center text-[10px] leading-none text-zinc-400 dark:text-zinc-500"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div
          dir="rtl"
          className="contrib-scroll min-w-0 flex-1 overflow-x-auto pb-1"
          onScroll={() => setTooltip(null)}
        >
          <div dir="ltr" className="w-max">
            <div
              aria-hidden="true"
              className="mb-1 grid h-4 items-end"
              style={{
                gridTemplateColumns: columns,
                columnGap: "var(--contrib-gap)",
              }}
            >
              {monthLabels.map((label) => (
                <span
                  key={`${label.index}-${label.text}`}
                  className="whitespace-nowrap text-[10px] leading-none text-zinc-400 dark:text-zinc-500"
                  style={{ gridColumn: label.index + 1 }}
                >
                  {label.text}
                </span>
              ))}
            </div>
            <div
              role="grid"
              aria-label="Contributions in the last year. Use arrow keys to move between days."
              onKeyDown={onKeyDown}
              className="grid"
              style={{
                gridTemplateColumns: columns,
                gridTemplateRows: `repeat(7, var(--contrib-cell))`,
                columnGap: "var(--contrib-gap)",
                rowGap: "var(--contrib-gap)",
              }}
            >
            {positions.map((position) => (
              <button
                key={position.day.date}
                type="button"
                role="gridcell"
                data-level={position.day.level}
                data-contribution-date={position.day.date}
                data-active={position.day.date === activeDate ? "true" : undefined}
                aria-label={formatContributionDay(position.day)}
                tabIndex={position.day.date === tabDate ? 0 : -1}
                className="contrib-cell"
                style={{
                  gridColumn: position.week + 1,
                  gridRow: position.row + 1,
                }}
                onMouseEnter={(event) => show(position.day, event.currentTarget)}
                onMouseLeave={() => setTooltip(null)}
                onFocus={(event) => show(position.day, event.currentTarget)}
                onBlur={() => setTooltip(null)}
                onClick={(event) => show(position.day, event.currentTarget)}
              />
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-gray-500">
        <p aria-live="polite" className="min-h-4">
          {captionDay ? formatContributionDay(captionDay) : null}
        </p>
        <div className="flex items-center gap-1" aria-hidden="true">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} data-level={level} className="contrib-cell" />
          ))}
          <span>More</span>
        </div>
      </div>

      {tooltip && captionDay ? (
        <span
          role="tooltip"
          className={tooltip.above ? "contrib-tooltip" : "contrib-tooltip is-below"}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {formatContributionDay(captionDay)}
        </span>
      ) : null}
    </div>
  );
}

function indexDays(calendar: ContributionCalendar) {
  const positions: Array<CellPosition & { day: ContributionDay }> = [];

  calendar.weeks.forEach((week, weekIndex) => {
    week.forEach((day) => {
      positions.push({ week: weekIndex, row: weekdayIndex(day.date), day });
    });
  });

  return positions;
}

function findOffset(
  positions: Array<CellPosition & { day: ContributionDay }>,
  start: CellPosition,
  weekDelta: number,
  rowDelta: number,
) {
  const stepWeek = Math.sign(weekDelta);
  const stepRow = Math.sign(rowDelta);
  let week = start.week;
  let row = start.row;

  for (let guard = 0; guard < positions.length + 7; guard += 1) {
    if (stepWeek !== 0) week += stepWeek;
    if (stepRow !== 0) row += stepRow;
    if (week < 0 || row < 0 || row > 6 || week > 60) return null;

    const match = positions.find((position) => position.week === week && position.row === row);
    if (match) return match;
    if (stepWeek === 0 && stepRow === 0) return null;
  }

  return null;
}

function getMonthLabels(weeks: ContributionDay[][]) {
  const starts: { index: number; text: string }[] = [];
  const seen = new Set<string>();

  weeks.forEach((week, index) => {
    for (const day of week) {
      const monthKey = day.date.slice(0, 7);
      if (seen.has(monthKey)) continue;
      if (!day.date.endsWith("-01") && index !== 0) continue;

      seen.add(monthKey);
      starts.push({
        index,
        text: new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
      });
    }
  });

  const labels: { index: number; text: string }[] = [];
  let lastIndex = -2;

  for (const [position, start] of starts.entries()) {
    const next = starts[position + 1];
    const index = Math.max(start.index, lastIndex + 2);
    if (index >= weeks.length) continue;
    if (next && index >= next.index) continue;

    labels.push({ index, text: start.text });
    lastIndex = index;
  }

  return labels;
}
