import {
  CLUB_COLORS,
  CLUB_WEEKLY_GOALS,
  DEFAULT_FILTERS,
  GLOBAL_WEEKLY_GOAL
} from "@/lib/constants";
import {
  addDays,
  getISOWeekInfo,
  getWeekKey,
  startOfISOWeek,
  toISODate
} from "@/lib/normalizeData";
import type {
  DashboardFilters,
  FilterOptions,
  Improvement,
  SelectOption
} from "@/types/improvement";

type CountMap = Map<string, number>;

export type WeeklyPoint = {
  weekKey: string;
  weekLabel: string;
  weekStart: string;
  count: number;
  goal: number;
  compliance: number;
};

export type ClubTotal = {
  club: string;
  count: number;
  goal: number | null;
  compliance: number | null;
  color: string;
};

export type RankingItem = {
  name: string;
  count: number;
};

export type StreakItem = {
  club: string;
  goal: number | null;
  streak: number | null;
  currentWeekCount: number;
  currentWeekCompliance: number | null;
  fulfilledWeeks: number;
  missedWeeks: number;
  accumulatedCompliance: number | null;
  color: string;
};

export type ActivityDay = {
  day: string;
  count: number;
  intensity: number;
};

export type DashboardMetrics = {
  totalYtd: number;
  currentMonth: number;
  currentWeek: number;
  weeklyCompliance: number | null;
  weeklyGoal: number | null;
  leadingClub: ClubTotal | null;
  longestStreak: StreakItem | null;
  accumulatedCompliance: number;
  fulfilledWeeks: number;
  missedWeeks: number;
  weeklySeries: WeeklyPoint[];
  clubTotals: ClubTotal[];
  clubWeekSeries: Array<Record<string, string | number>>;
  clubWeekKeys: string[];
  topCollaborators: RankingItem[];
  topTeams: RankingItem[];
  categoryTotals: RankingItem[];
  latest: Improvement[];
  streaks: StreakItem[];
  dayActivity: ActivityDay[];
};

function isActiveFilter(value?: string) {
  return Boolean(value && value !== "all");
}

function parseISODateLocal(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function sortByDateDesc(a: Improvement, b: Improvement) {
  return b.date.localeCompare(a.date) || b.sourceRow - a.sourceRow;
}

function countBy(records: Improvement[], accessor: (record: Improvement) => string) {
  return records.reduce<CountMap>((map, record) => {
    const key = accessor(record).trim();
    if (!key) {
      return map;
    }
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map());
}

function rankBy(
  records: Improvement[],
  accessor: (record: Improvement) => string | undefined,
  limit = 8
): RankingItem[] {
  return Array.from(
    countBy(records, (record) => accessor(record) ?? "").entries()
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function optionize(values: string[], descending = false): SelectOption[] {
  const sorted = Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    descending ? b.localeCompare(a) : a.localeCompare(b)
  );

  return sorted.map((value) => ({
    label: value,
    value
  }));
}

function getWeekLabelFromStart(weekStart: string) {
  const date = parseISODateLocal(weekStart);
  const info = getISOWeekInfo(date);
  return `S${String(info.isoWeek).padStart(2, "0")} ${info.isoYear}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric"
  })
    .format(new Date(year, month - 1, 1))
    .replace(".", "");
}

function getWeekStartsBetween(first: Date, last: Date) {
  const starts: string[] = [];
  const cursor = startOfISOWeek(first);
  cursor.setHours(0, 0, 0, 0);
  const end = startOfISOWeek(last);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    starts.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  return starts;
}

function getRecordsWeekRange(records: Improvement[]) {
  if (!records.length) {
    return null;
  }

  const starts = records.map((record) => parseISODateLocal(record.weekStart).getTime());
  return {
    first: new Date(Math.min(...starts)),
    last: new Date(Math.max(...starts))
  };
}

function buildWeeklySeries(records: Improvement[]): WeeklyPoint[] {
  const range = getRecordsWeekRange(records);
  if (!range) {
    return [];
  }

  const byWeek = countBy(records, (record) => record.weekStart);
  return getWeekStartsBetween(range.first, range.last)
    .map((weekStart) => {
      const weekKey = getWeekKey(parseISODateLocal(weekStart));
      const count = byWeek.get(weekStart) ?? 0;
      return {
        weekKey,
        weekStart,
        weekLabel: getWeekLabelFromStart(weekStart),
        count,
        goal: GLOBAL_WEEKLY_GOAL,
        compliance: count / GLOBAL_WEEKLY_GOAL
      };
    })
    .slice(-20);
}

function buildClubTotals(records: Improvement[]): ClubTotal[] {
  return Array.from(countBy(records, (record) => record.club).entries())
    .map(([club, count]) => {
      const goal = CLUB_WEEKLY_GOALS[club] ?? null;
      return {
        club,
        count,
        goal,
        compliance: goal ? count / goal : null,
        color: CLUB_COLORS[club] ?? "#111827"
      };
    })
    .sort((a, b) => b.count - a.count || a.club.localeCompare(b.club));
}

function buildClubWeekSeries(records: Improvement[]) {
  const weeklySeries = buildWeeklySeries(records).slice(-12);
  const clubs = Array.from(new Set(records.map((record) => record.club))).sort();
  const byWeekClub = records.reduce<Map<string, CountMap>>((map, record) => {
    const byClub = map.get(record.weekStart) ?? new Map<string, number>();
    byClub.set(record.club, (byClub.get(record.club) ?? 0) + 1);
    map.set(record.weekStart, byClub);
    return map;
  }, new Map());

  return {
    clubWeekKeys: clubs,
    clubWeekSeries: weeklySeries.map((week) => {
      const row: Record<string, string | number> = {
        weekLabel: week.weekLabel,
        weekStart: week.weekStart
      };
      clubs.forEach((club) => {
        row[club] = byWeekClub.get(week.weekStart)?.get(club) ?? 0;
      });
      return row;
    })
  };
}

function getLastCompletedWeekStart(now: Date) {
  return addDays(startOfISOWeek(now), -7);
}

function buildStreaks(records: Improvement[], now: Date): StreakItem[] {
  const currentWeekKey = getWeekKey(now);
  const currentWeekCounts = countBy(
    records.filter((record) => record.weekKey === currentWeekKey),
    (record) => record.club
  );
  // Rachas: la semana en curso se excluye para no castigar avances incompletos.
  const lastCompletedWeekStart = getLastCompletedWeekStart(now);
  const completedRecords = records.filter(
    (record) => parseISODateLocal(record.weekStart) <= lastCompletedWeekStart
  );
  const clubs = Array.from(
    new Set([
      ...Object.keys(CLUB_WEEKLY_GOALS),
      ...records.map((record) => record.club)
    ])
  ).sort();

  return clubs.map((club) => {
    const goal = CLUB_WEEKLY_GOALS[club] ?? null;
    const currentWeekCount = currentWeekCounts.get(club) ?? 0;

    if (!goal) {
      return {
        club,
        goal,
        streak: null,
        currentWeekCount,
        currentWeekCompliance: null,
        fulfilledWeeks: 0,
        missedWeeks: 0,
        accumulatedCompliance: null,
        color: CLUB_COLORS[club] ?? "#111827"
      };
    }

    const clubRecords = completedRecords.filter((record) => record.club === club);
    if (!clubRecords.length) {
      return {
        club,
        goal,
        streak: 0,
        currentWeekCount,
        currentWeekCompliance: currentWeekCount / goal,
        fulfilledWeeks: 0,
        missedWeeks: 0,
        accumulatedCompliance: 0,
        color: CLUB_COLORS[club] ?? "#111827"
      };
    }

    const firstWeek = new Date(
      Math.min(...clubRecords.map((record) => parseISODateLocal(record.weekStart).getTime()))
    );
    const weekStarts = getWeekStartsBetween(firstWeek, lastCompletedWeekStart);
    const counts = countBy(clubRecords, (record) => record.weekStart);
    const fulfilledFlags = weekStarts.map((weekStart) => (counts.get(weekStart) ?? 0) >= goal);

    let streak = 0;
    for (let index = fulfilledFlags.length - 1; index >= 0; index -= 1) {
      if (!fulfilledFlags[index]) {
        break;
      }
      streak += 1;
    }

    const fulfilledWeeks = fulfilledFlags.filter(Boolean).length;
    const totalCount = weekStarts.reduce(
      (sum, weekStart) => sum + (counts.get(weekStart) ?? 0),
      0
    );

    return {
      club,
      goal,
      streak,
      currentWeekCount,
      currentWeekCompliance: currentWeekCount / goal,
      fulfilledWeeks,
      missedWeeks: weekStarts.length - fulfilledWeeks,
      accumulatedCompliance: totalCount / (weekStarts.length * goal),
      color: CLUB_COLORS[club] ?? "#111827"
    };
  });
}

function buildGlobalCompletion(records: Improvement[], now: Date) {
  const lastCompletedWeekStart = getLastCompletedWeekStart(now);
  const completedRecords = records.filter(
    (record) => parseISODateLocal(record.weekStart) <= lastCompletedWeekStart
  );

  if (!completedRecords.length) {
    return {
      accumulatedCompliance: 0,
      fulfilledWeeks: 0,
      missedWeeks: 0
    };
  }

  const firstWeek = new Date(
    Math.min(...completedRecords.map((record) => parseISODateLocal(record.weekStart).getTime()))
  );
  const weekStarts = getWeekStartsBetween(firstWeek, lastCompletedWeekStart);
  const counts = countBy(completedRecords, (record) => record.weekStart);
  const fulfilledWeeks = weekStarts.filter(
    (weekStart) => (counts.get(weekStart) ?? 0) >= GLOBAL_WEEKLY_GOAL
  ).length;
  const totalCount = weekStarts.reduce(
    (sum, weekStart) => sum + (counts.get(weekStart) ?? 0),
    0
  );

  return {
    accumulatedCompliance: totalCount / (weekStarts.length * GLOBAL_WEEKLY_GOAL),
    fulfilledWeeks,
    missedWeeks: weekStarts.length - fulfilledWeeks
  };
}

function buildDayActivity(records: Improvement[]): ActivityDay[] {
  const labels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const counts = new Array(7).fill(0) as number[];
  records.forEach((record) => {
    const day = parseISODateLocal(record.date).getDay();
    const mondayIndex = (day + 6) % 7;
    counts[mondayIndex] += 1;
  });
  const max = Math.max(...counts, 1);

  return labels.map((day, index) => ({
    day,
    count: counts[index],
    intensity: counts[index] / max
  }));
}

export function applyDashboardFilters(
  records: Improvement[],
  filters: DashboardFilters
) {
  return records.filter((record) => {
    if (filters.dateFrom && record.date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && record.date > filters.dateTo) {
      return false;
    }
    if (isActiveFilter(filters.club) && record.club !== filters.club) {
      return false;
    }
    if (isActiveFilter(filters.team) && record.team !== filters.team) {
      return false;
    }
    if (
      isActiveFilter(filters.collaborator) &&
      record.collaborator !== filters.collaborator
    ) {
      return false;
    }
    if (isActiveFilter(filters.category) && record.category !== filters.category) {
      return false;
    }
    if (isActiveFilter(filters.week) && record.weekKey !== filters.week) {
      return false;
    }
    if (isActiveFilter(filters.month) && record.monthKey !== filters.month) {
      return false;
    }
    if (isActiveFilter(filters.year) && String(record.year) !== filters.year) {
      return false;
    }
    return true;
  });
}

export function buildFilterOptions(records: Improvement[]): FilterOptions {
  const weeks = Array.from(new Map(records.map((record) => [
    record.weekKey,
    record.weekLabel
  ])).entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([value, label]) => ({ value, label }));
  const months = Array.from(new Set(records.map((record) => record.monthKey)))
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: getMonthLabel(value) }));

  return {
    clubs: optionize(records.map((record) => record.club)),
    teams: optionize(records.map((record) => record.team ?? "")),
    collaborators: optionize(records.map((record) => record.collaborator ?? "")),
    categories: optionize(records.map((record) => record.category ?? "")),
    weeks,
    months,
    years: optionize(
      records.map((record) => String(record.year)),
      true
    )
  };
}

export function calculateDashboardMetrics(
  records: Improvement[],
  filters: DashboardFilters = DEFAULT_FILTERS,
  now = new Date()
): DashboardMetrics {
  const currentYear = now.getFullYear();
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentWeekKey = getWeekKey(now);
  const currentWeekRecords = records.filter((record) => record.weekKey === currentWeekKey);
  const hasSelectedClubGoal =
    isActiveFilter(filters.club) &&
    Object.prototype.hasOwnProperty.call(CLUB_WEEKLY_GOALS, filters.club);
  const selectedClubGoal = hasSelectedClubGoal ? CLUB_WEEKLY_GOALS[filters.club] : undefined;
  const weeklyGoal = hasSelectedClubGoal ? selectedClubGoal ?? null : GLOBAL_WEEKLY_GOAL;
  const clubTotals = buildClubTotals(records);
  const streaks = buildStreaks(records, now);
  const globalCompletion = buildGlobalCompletion(records, now);
  const clubWeek = buildClubWeekSeries(records);
  const longestStreak =
    streaks
      .filter((item) => typeof item.streak === "number")
      .sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0))[0] ?? null;

  return {
    totalYtd: records.filter((record) => record.year === currentYear).length,
    currentMonth: records.filter((record) => record.monthKey === currentMonthKey).length,
    currentWeek: currentWeekRecords.length,
    weeklyCompliance: weeklyGoal ? currentWeekRecords.length / weeklyGoal : null,
    weeklyGoal,
    leadingClub: clubTotals[0] ?? null,
    longestStreak,
    accumulatedCompliance: globalCompletion.accumulatedCompliance,
    fulfilledWeeks: globalCompletion.fulfilledWeeks,
    missedWeeks: globalCompletion.missedWeeks,
    weeklySeries: buildWeeklySeries(records),
    clubTotals,
    clubWeekSeries: clubWeek.clubWeekSeries,
    clubWeekKeys: clubWeek.clubWeekKeys,
    topCollaborators: rankBy(records, (record) => record.collaborator),
    topTeams: rankBy(records, (record) => record.team),
    categoryTotals: rankBy(records, (record) => record.category),
    latest: [...records].sort(sortByDateDesc).slice(0, 12),
    streaks,
    dayActivity: buildDayActivity(records)
  };
}
