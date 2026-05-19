import {
  ACTIVE_CLUBS,
  CLUB_ACCENTS,
  CLUB_COLORS,
  CLUB_LOGOS,
  CLUB_SHORT_NAMES,
  CLUB_WEEKLY_GOALS,
  DEFAULT_FILTERS,
  GLOBAL_WEEKLY_GOAL,
  HIDDEN_CLUBS
} from "@/lib/constants";
import {
  addDays,
  getISOWeekInfo,
  getWeekKey,
  startOfISOWeek,
  toISODate
} from "@/lib/normalizeData";
import type {
  CountryUniverse,
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
  logo: string;
  shortName: string;
};

export type RankingItem = {
  name: string;
  count: number;
};

export type CountryRankingItem = RankingItem & {
  club: string;
  color: string;
  logo: string;
  shortName: string;
};

export type CountryStreakItem = {
  team: string;
  club: string;
  streak: number;
  color: string;
  logo: string;
  shortName: string;
};

export type ClubParticipationItem = {
  club: string;
  goal: number;
  logo: string;
  color: string;
  accent: string;
  shortName: string;
  lastCompletedWeekLabel: string;
  lastCompletedWeekStart: string;
  lastWeekCount: number;
  goalCompliance: number;
  activeTeams: number;
  totalTeams: number;
  countryCompliance: number;
  previousMonthLabel: string;
  monthlyCompliantTeams: number;
  monthlyTotalTeams: number;
  monthlyCountryCompliance: number;
  monthlyWeeks: string[];
};

export type ParticipationMatrixWeek = {
  weekKey: string;
  weekLabel: string;
  weekStart: string;
};

export type ParticipationMatrixRow = {
  team: string;
  activeWeeks: number;
  cells: Array<{
    weekKey: string;
    count: number;
    active: boolean;
  }>;
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
  topCountries: CountryRankingItem[];
  topCountryStreaks: CountryStreakItem[];
  categoryTotals: RankingItem[];
  latest: Improvement[];
  streaks: StreakItem[];
  clubParticipation: ClubParticipationItem[];
  matrixWeeks: ParticipationMatrixWeek[];
  participationMatrix: ParticipationMatrixRow[];
  dayActivity: ActivityDay[];
};

function isActiveFilter(value?: string) {
  return Boolean(value && value !== "all");
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function uniqueNormalized(values: string[]) {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const clean = value.replace(/\s+/g, " ").trim();
    const key = normalizeKey(clean);
    if (!clean || seen.has(key)) {
      return [];
    }
    seen.add(key);
    return [clean];
  });
}

function isValidTeamName(value: string, club?: string) {
  const normalized = normalizeKey(value);
  const invalid = [
    "",
    "sucursal",
    "club",
    "pais",
    "paises",
    "equipo",
    "semana",
    "area",
    "departamento",
    "gourmeteria",
    "naciones unidas",
    "valle real",
    "oficina central",
    "gmt",
    "nac",
    "vr"
  ];

  return !invalid.includes(normalized) && (!club || normalized !== normalizeKey(club));
}

export function isVisibleClub(club: string) {
  return ACTIVE_CLUBS.includes(club as (typeof ACTIVE_CLUBS)[number]);
}

export function filterVisibleRecords(records: Improvement[]) {
  return records.filter(
    (record) => isVisibleClub(record.club) && !HIDDEN_CLUBS.includes(record.club)
  );
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
  return Array.from(countBy(records, (record) => accessor(record) ?? "").entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function optionize(values: string[], descending = false): SelectOption[] {
  const sorted = uniqueNormalized(values.filter(Boolean)).sort((a, b) =>
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

export function getLastCompletedWeekStart(now: Date) {
  return addDays(startOfISOWeek(now), -7);
}

function getLastCompletedWeek(now: Date) {
  const weekStart = toISODate(getLastCompletedWeekStart(now));
  return {
    weekStart,
    weekKey: getWeekKey(parseISODateLocal(weekStart)),
    weekLabel: getWeekLabelFromStart(weekStart)
  };
}

function getLastCompletedWeeks(now: Date, count = 12) {
  const last = getLastCompletedWeekStart(now);
  const first = addDays(last, -(count - 1) * 7);
  return getWeekStartsBetween(first, last).map((weekStart) => ({
    weekStart,
    weekKey: getWeekKey(parseISODateLocal(weekStart)),
    weekLabel: getWeekLabelFromStart(weekStart)
  }));
}

function getPreviousMonthInfo(now: Date) {
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
  const label = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric"
  }).format(firstDay);

  return {
    firstDay,
    lastDay,
    label: label.charAt(0).toUpperCase() + label.slice(1)
  };
}

function getCompleteWeekStartsInsideMonth(now: Date) {
  const previousMonth = getPreviousMonthInfo(now);
  const starts: string[] = [];
  const cursor = startOfISOWeek(previousMonth.firstDay);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= previousMonth.lastDay) {
    const weekEnd = addDays(cursor, 6);
    if (cursor >= previousMonth.firstDay && weekEnd <= previousMonth.lastDay) {
      starts.push(toISODate(cursor));
    }
    cursor.setDate(cursor.getDate() + 7);
  }

  return {
    label: previousMonth.label,
    weekStarts: starts
  };
}

function getClubMeta(club: string) {
  return {
    color: CLUB_COLORS[club] ?? "#111827",
    accent: CLUB_ACCENTS[club] ?? CLUB_COLORS[club] ?? "#111827",
    logo: CLUB_LOGOS[club] ?? CLUB_LOGOS["Vivo 47"],
    shortName: CLUB_SHORT_NAMES[club] ?? club
  };
}

function getOfficialTeams(
  club: string,
  baseRecords: Improvement[],
  countryUniverse: CountryUniverse = {}
) {
  const configured = uniqueNormalized(countryUniverse[club] ?? []).filter((team) =>
    isValidTeamName(team, club)
  );
  const fallback = baseRecords
    .filter((record) => record.club === club)
    .map((record) => record.team ?? "")
    .filter((team) => isValidTeamName(team, club));
  const source = configured.length >= 3 ? configured : fallback;

  return uniqueNormalized(source).sort((a, b) => a.localeCompare(b));
}

function getTeamKey(team: string) {
  return normalizeKey(team);
}

function buildWeeklySeries(
  records: Improvement[],
  goal = GLOBAL_WEEKLY_GOAL,
  now?: Date
): WeeklyPoint[] {
  const range = getRecordsWeekRange(records);
  if (!range) {
    return [];
  }

  const lastAllowedWeekStart = now ? getLastCompletedWeekStart(now) : range.last;
  const lastWeek = range.last > lastAllowedWeekStart ? lastAllowedWeekStart : range.last;
  const byWeek = countBy(records, (record) => record.weekStart);
  return getWeekStartsBetween(range.first, lastWeek)
    .map((weekStart) => {
      const weekKey = getWeekKey(parseISODateLocal(weekStart));
      const count = byWeek.get(weekStart) ?? 0;
      return {
        weekKey,
        weekStart,
        weekLabel: getWeekLabelFromStart(weekStart),
        count,
        goal,
        compliance: count / goal
      };
    })
    .slice(-20);
}

function buildClubTotals(records: Improvement[]): ClubTotal[] {
  return ACTIVE_CLUBS.map((club) => {
    const goal = CLUB_WEEKLY_GOALS[club] ?? null;
    const count = records.filter((record) => record.club === club).length;
    return {
      club,
      count,
      goal,
      compliance: goal ? count / goal : null,
      ...getClubMeta(club)
    };
  })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.club.localeCompare(b.club));
}

function buildClubLineSeries(records: Improvement[], now: Date) {
  const weeklySeries = buildWeeklySeries(records, GLOBAL_WEEKLY_GOAL, now).slice(-12);
  const byWeekClub = records.reduce<Map<string, CountMap>>((map, record) => {
    const byClub = map.get(record.weekStart) ?? new Map<string, number>();
    byClub.set(record.club, (byClub.get(record.club) ?? 0) + 1);
    map.set(record.weekStart, byClub);
    return map;
  }, new Map());

  return {
    clubWeekKeys: [...ACTIVE_CLUBS],
    clubWeekSeries: weeklySeries.map((week) => {
      const row: Record<string, string | number> = {
        weekLabel: week.weekLabel,
        weekStart: week.weekStart
      };
      ACTIVE_CLUBS.forEach((club) => {
        row[club] = byWeekClub.get(week.weekStart)?.get(club) ?? 0;
      });
      return row;
    })
  };
}

function buildCountryRankings(records: Improvement[], limit = 10): CountryRankingItem[] {
  const grouped = records.reduce<Map<string, CountryRankingItem>>((map, record) => {
    if (
      !record.team ||
      !isVisibleClub(record.club) ||
      !isValidTeamName(record.team, record.club)
    ) {
      return map;
    }

    const key = `${record.club}::${getTeamKey(record.team)}`;
    const meta = getClubMeta(record.club);
    const current =
      map.get(key) ??
      ({
        name: record.team,
        club: record.club,
        count: 0,
        color: meta.color,
        logo: meta.logo,
        shortName: meta.shortName
      } as CountryRankingItem);
    current.count += 1;
    map.set(key, current);
    return map;
  }, new Map());

  return Array.from(grouped.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function buildCountryStreaks(
  records: Improvement[],
  baseRecords: Improvement[],
  countryUniverse: CountryUniverse,
  now: Date,
  limit = 5
): CountryStreakItem[] {
  const lastCompletedWeekStart = getLastCompletedWeekStart(now);
  const completedWeeksRange = getRecordsWeekRange(
    baseRecords.filter(
      (record) => parseISODateLocal(record.weekStart) <= lastCompletedWeekStart
    )
  );

  if (!completedWeeksRange) {
    return [];
  }

  const weekStarts = getWeekStartsBetween(completedWeeksRange.first, lastCompletedWeekStart);
  const counts = records.reduce<Map<string, CountMap>>((map, record) => {
    if (!record.team || parseISODateLocal(record.weekStart) > lastCompletedWeekStart) {
      return map;
    }
    if (!isValidTeamName(record.team, record.club)) {
      return map;
    }

    const key = `${record.club}::${getTeamKey(record.team)}`;
    const byWeek = map.get(key) ?? new Map<string, number>();
    byWeek.set(record.weekStart, (byWeek.get(record.weekStart) ?? 0) + 1);
    map.set(key, byWeek);
    return map;
  }, new Map());

  const candidates = ACTIVE_CLUBS.flatMap((club) =>
    getOfficialTeams(club, baseRecords, countryUniverse).map((team) => ({ club, team }))
  );

  return candidates
    .map(({ club, team }) => {
      const byWeek = counts.get(`${club}::${getTeamKey(team)}`) ?? new Map<string, number>();
      let streak = 0;

      for (let index = weekStarts.length - 1; index >= 0; index -= 1) {
        if ((byWeek.get(weekStarts[index]) ?? 0) === 0) {
          break;
        }
        streak += 1;
      }

      return {
        team,
        club,
        streak,
        ...getClubMeta(club)
      };
    })
    .filter((item) => item.streak > 0)
    .sort((a, b) => b.streak - a.streak || a.team.localeCompare(b.team))
    .slice(0, limit);
}

function buildClubParticipation(
  records: Improvement[],
  baseRecords: Improvement[],
  countryUniverse: CountryUniverse,
  now: Date
): ClubParticipationItem[] {
  const lastCompleted = getLastCompletedWeek(now);
  const previousMonth = getCompleteWeekStartsInsideMonth(now);
  const lastWeekRecords = records.filter(
    (record) => record.weekStart === lastCompleted.weekStart
  );

  return ACTIVE_CLUBS.map((club) => {
    const goal = CLUB_WEEKLY_GOALS[club] ?? 1;
    const teams = getOfficialTeams(club, baseRecords, countryUniverse);
    const teamKeys = new Set(teams.map(getTeamKey));
    const rawActiveTeams = uniqueNormalized(
      lastWeekRecords
        .filter((record) => record.club === club)
        .map((record) => record.team ?? "")
    );
    const activeTeams = teams.length
      ? rawActiveTeams.filter((team) => teamKeys.has(getTeamKey(team)))
      : rawActiveTeams;
    const lastWeekCount = lastWeekRecords.filter((record) => record.club === club).length;
    const monthlyRecords = records.filter(
      (record) =>
        record.club === club &&
        record.team &&
        previousMonth.weekStarts.includes(record.weekStart) &&
        isValidTeamName(record.team, club)
    );
    const monthlyByTeam = monthlyRecords.reduce<Map<string, Set<string>>>((map, record) => {
      const teamKey = getTeamKey(record.team ?? "");
      if (teams.length && !teamKeys.has(teamKey)) {
        return map;
      }
      const weeks = map.get(teamKey) ?? new Set<string>();
      weeks.add(record.weekStart);
      map.set(teamKey, weeks);
      return map;
    }, new Map());
    const monthlyCompliantTeams = teams.filter(
      (team) =>
        previousMonth.weekStarts.length > 0 &&
        previousMonth.weekStarts.every((weekStart) =>
          monthlyByTeam.get(getTeamKey(team))?.has(weekStart)
        )
    ).length;

    return {
      club,
      goal,
      ...getClubMeta(club),
      lastCompletedWeekLabel: lastCompleted.weekLabel,
      lastCompletedWeekStart: lastCompleted.weekStart,
      lastWeekCount,
      goalCompliance: lastWeekCount / goal,
      activeTeams: activeTeams.length,
      totalTeams: teams.length,
      countryCompliance: teams.length ? activeTeams.length / teams.length : 0,
      previousMonthLabel: previousMonth.label,
      monthlyCompliantTeams,
      monthlyTotalTeams: teams.length,
      monthlyCountryCompliance:
        teams.length && previousMonth.weekStarts.length
          ? monthlyCompliantTeams / teams.length
          : 0,
      monthlyWeeks: previousMonth.weekStarts
    };
  });
}

function buildParticipationMatrix(
  records: Improvement[],
  baseRecords: Improvement[],
  countryUniverse: CountryUniverse,
  club: string,
  now: Date
) {
  const weeks = getLastCompletedWeeks(now, 12);
  const teams = getOfficialTeams(club, baseRecords, countryUniverse);
  const counts = records.reduce<Map<string, CountMap>>((map, record) => {
    if (record.club !== club || !record.team) {
      return map;
    }
    if (!isValidTeamName(record.team, club)) {
      return map;
    }

    const teamKey = getTeamKey(record.team);
    const byWeek = map.get(teamKey) ?? new Map<string, number>();
    byWeek.set(record.weekKey, (byWeek.get(record.weekKey) ?? 0) + 1);
    map.set(teamKey, byWeek);
    return map;
  }, new Map());

  return {
    matrixWeeks: weeks,
    participationMatrix: teams.map((team) => {
      const byWeek = counts.get(getTeamKey(team)) ?? new Map<string, number>();
      const cells = weeks.map((week) => {
        const count = byWeek.get(week.weekKey) ?? 0;
        return {
          weekKey: week.weekKey,
          count,
          active: count > 0
        };
      });

      return {
        team,
        activeWeeks: cells.filter((cell) => cell.active).length,
        cells
      };
    })
  };
}

function buildStreaks(records: Improvement[], now: Date): StreakItem[] {
  const currentWeekKey = getWeekKey(now);
  const currentWeekCounts = countBy(
    records.filter((record) => record.weekKey === currentWeekKey),
    (record) => record.club
  );

  return ACTIVE_CLUBS.map((club) => {
    const goal = CLUB_WEEKLY_GOALS[club] ?? null;
    const currentWeekCount = currentWeekCounts.get(club) ?? 0;

    return {
      club,
      goal,
      streak: null,
      currentWeekCount,
      currentWeekCompliance: goal ? currentWeekCount / goal : null,
      fulfilledWeeks: 0,
      missedWeeks: 0,
      accumulatedCompliance: null,
      color: CLUB_COLORS[club] ?? "#111827"
    };
  });
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
  const weeks = Array.from(
    new Map(records.map((record) => [record.weekKey, record.weekLabel])).entries()
  )
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
  now = new Date(),
  countryUniverse: CountryUniverse = {},
  baseRecords = records
): DashboardMetrics {
  const visibleRecords = filterVisibleRecords(records);
  const visibleBaseRecords = filterVisibleRecords(baseRecords);
  const currentYear = now.getFullYear();
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastCompleted = getLastCompletedWeek(now);
  const lastCompletedWeekRecords = visibleRecords.filter(
    (record) => record.weekStart === lastCompleted.weekStart
  );
  const selectedClub =
    isActiveFilter(filters.club) && isVisibleClub(filters.club) ? filters.club : undefined;
  const selectedClubGoal = selectedClub ? CLUB_WEEKLY_GOALS[selectedClub] : undefined;
  const weeklyGoal = selectedClubGoal ?? GLOBAL_WEEKLY_GOAL;
  const clubTotals = buildClubTotals(visibleRecords);
  const clubWeek = buildClubLineSeries(visibleRecords, now);
  const streaks = buildStreaks(visibleRecords, now);
  const activeClubForMatrix = selectedClub ?? (ACTIVE_CLUBS.find((club) =>
    visibleRecords.some((record) => record.club === club)
  ) as string | undefined);
  const matrix = activeClubForMatrix
    ? buildParticipationMatrix(
        visibleRecords,
        visibleBaseRecords,
        countryUniverse,
        activeClubForMatrix,
        now
      )
    : { matrixWeeks: [], participationMatrix: [] };

  return {
    totalYtd: visibleRecords.filter((record) => record.year === currentYear).length,
    currentMonth: visibleRecords.filter((record) => record.monthKey === currentMonthKey).length,
    currentWeek: lastCompletedWeekRecords.length,
    weeklyCompliance: weeklyGoal ? lastCompletedWeekRecords.length / weeklyGoal : null,
    weeklyGoal,
    leadingClub: clubTotals[0] ?? null,
    longestStreak: null,
    accumulatedCompliance: 0,
    fulfilledWeeks: 0,
    missedWeeks: 0,
    weeklySeries: buildWeeklySeries(visibleRecords, weeklyGoal, now),
    clubTotals,
    clubWeekSeries: clubWeek.clubWeekSeries,
    clubWeekKeys: clubWeek.clubWeekKeys,
    topCollaborators: rankBy(visibleRecords, (record) => record.collaborator),
    topTeams: rankBy(visibleRecords, (record) => record.team),
    topCountries: buildCountryRankings(visibleRecords, 10),
    topCountryStreaks: buildCountryStreaks(
      visibleRecords,
      visibleBaseRecords,
      countryUniverse,
      now,
      5
    ),
    categoryTotals: rankBy(visibleRecords, (record) => record.category),
    latest: [...visibleRecords].sort(sortByDateDesc).slice(0, 12),
    streaks,
    clubParticipation: buildClubParticipation(
      visibleRecords,
      visibleBaseRecords,
      countryUniverse,
      now
    ),
    matrixWeeks: matrix.matrixWeeks,
    participationMatrix: matrix.participationMatrix,
    dayActivity: buildDayActivity(visibleRecords)
  };
}
