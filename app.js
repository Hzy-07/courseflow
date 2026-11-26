(() => {
  'use strict';

  const DATA = window.COURSEFLOW_DATA;
  const COURSES = DATA.courses;
  const MAX_WEEK = DATA.maxWeek;
  const STORAGE_KEY = 'courseflow.settings.v1';
  const DEFAULT_SETTINGS = {
    startDate: '2026-09-07',
    termName: '2026 秋季学期',
    theme: 'light',
  };

  // 大节时间按用户提供的学校作息设置；内部单节时间按 45 分钟一节、课间 10 分钟拆分，可在设置中修改。
  const DEFAULT_PERIOD_TIMES = [
    { start: '08:00', end: '08:45' },
    { start: '08:55', end: '09:40' },
    { start: '10:00', end: '10:45' },
    { start: '10:55', end: '11:40' },
    { start: '14:10', end: '14:55' },
    { start: '15:05', end: '15:50' },
    { start: '16:10', end: '16:55' },
    { start: '17:05', end: '17:50' },
    { start: '18:40', end: '19:25' },
    { start: '19:35', end: '20:20' },
    { start: '20:30', end: '21:15' },
    { start: '21:25', end: '22:10' },
  ];

  // 旧版内置的通用作息。首次升级时，仅在用户从未改过时间的情况下替换为新作息。
  const LEGACY_DEFAULT_PERIOD_TIMES = [
    { start: '08:00', end: '08:45' },
    { start: '08:55', end: '09:40' },
    { start: '10:00', end: '10:45' },
    { start: '10:55', end: '11:40' },
    { start: '14:00', end: '14:45' },
    { start: '14:55', end: '15:40' },
    { start: '16:00', end: '16:45' },
    { start: '16:55', end: '17:40' },
    { start: '19:00', end: '19:45' },
    { start: '19:55', end: '20:40' },
    { start: '20:50', end: '21:35' },
    { start: '21:45', end: '22:30' },
  ];
  const SETTINGS_VERSION = 2;

  const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const WEEKDAYS_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const WEEKDAYS_EN = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const ROW_HEIGHT = 54;
  const MS_PER_DAY = 86400000;
  const COURSE_ALIASES = {
    '高等数学I': ['高数', '数学'],
    'C语言程序设计': ['C语言', 'C', '编程'],
    '计算机科学导论（全英）': ['计导', '计算机导论', '计算机'],
    '大学生心理健康教育': ['心理', '心理健康'],
    '国家安全教育': ['国安', '国家安全'],
    '英语阅读I': ['阅读', '英语阅读'],
    '英语写作I': ['写作', '英语写作'],
    '英语听力I': ['听力', '英语听力'],
    '英语口语I': ['口语', '英语口语'],
    '形势与政策（走在前列的广东实践）': ['形势', '形势与政策', '广东实践'],
    '孙子兵法与现代企业谋略': ['孙子兵法', '企业谋略'],
    '职业生涯与发展规划': ['职业规划', '生涯规划', '职业生涯'],
    '阅读与写作': ['读写', '阅读写作'],
    '党史': ['党史'],
    '足球': ['足球', '体育'],
  };
  const pad2 = (value) => String(value).padStart(2, '0');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const el = {
    pageTitle: $('#pageTitle'),
    weekDigits: $('#weekDigits'),
    weekStatus: $('#weekStatus'),
    weekAnnouncement: $('#weekAnnouncement'),
    todayText: $('#todayText'),
    termText: $('#termText'),
    weekRange: $('#weekRange'),
    weekSummary: $('#weekSummary'),
    weekJump: $('#weekJump'),
    prevWeek: $('#prevWeek'),
    nextWeek: $('#nextWeek'),
    todayButton: $('#todayButton'),
    termPill: $('#termPill'),
    termPillText: $('#termPillText'),
    themeButton: $('#themeButton'),
    settingsButton: $('#settingsButton'),
    footerSettings: $('#footerSettings'),
    footerStartDate: $('#footerStartDate'),
    footerTimeRange: $('#footerTimeRange'),
    calendarWeek: $('#calendarWeek'),
    metricDays: $('#metricDays'),
    metricCourses: $('#metricCourses'),
    weekGrid: $('#weekGrid'),
    emptyWeek: $('#emptyWeek'),
    emptyWeekNumber: $('#emptyWeekNumber'),
    emptyCoursesButton: $('#emptyCoursesButton'),
    mobileDays: $('#mobileDays'),
    mobileAgenda: $('#mobileAgenda'),
    dayEyebrow: $('#dayEyebrow'),
    dayTitle: $('#dayTitle'),
    dayCount: $('#dayCount'),
    dayList: $('#dayList'),
    sideToday: $('#sideToday'),
    rhythmTotal: $('#rhythmTotal'),
    rhythmChart: $('#rhythmChart'),
    rhythmNote: $('#rhythmNote'),
    semesterWeek: $('#semesterWeek'),
    semesterMax: $('#semesterMax'),
    semesterTerm: $('#semesterTerm'),
    semesterProgress: $('#semesterProgress'),
    semesterPercent: $('#semesterPercent'),
    semesterRemain: $('#semesterRemain'),
    navWeek: $('#navWeek'),
    navCourses: $('#navCourses'),
    navCourseCount: $('#navCourseCount'),
    catalogDialog: $('#catalogDialog'),
    catalogSummary: $('#catalogSummary'),
    courseCatalog: $('#courseCatalog'),
    courseSearch: $('#courseSearch'),
    searchCount: $('#searchCount'),
    settingsDialog: $('#settingsDialog'),
    settingsForm: $('#settingsForm'),
    termNameInput: $('#termNameInput'),
    startDateInput: $('#startDateInput'),
    settingsPreview: $('#settingsPreview'),
    previewWeekLabel: $('#previewWeekLabel'),
    previewDateLabel: $('#previewDateLabel'),
    timeSettings: $('#timeSettings'),
    timeGrid: $('#timeGrid'),
    timeSummaryRange: $('#timeSummaryRange'),
    resetTimes: $('#resetTimes'),
    resetSettings: $('#resetSettings'),
    detailDialog: $('#detailDialog'),
    detailContent: $('#detailContent'),
    weekPopover: $('#weekPopover'),
    closeWeekPopover: $('#closeWeekPopover'),
    weekPicker: $('#weekPicker'),
    toast: $('#toast'),
    themeMeta: $('meta[name="theme-color"]'),
  };

  /* =======================================================
     Date helpers
     ======================================================= */

  function parseISODate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parts = value.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
    if (
      date.getFullYear() !== parts[0] ||
      date.getMonth() !== parts[1] - 1 ||
      date.getDate() !== parts[2]
    ) {
      return null;
    }
    return date;
  }

  function toISODate(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function atNoon(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  }

  function addDays(date, count) {
    const next = new Date(date);
    next.setDate(next.getDate() + count);
    return next;
  }

  function mondayOf(date) {
    const next = atNoon(date);
    const offset = (next.getDay() + 6) % 7;
    next.setDate(next.getDate() - offset);
    return next;
  }

  function diffDays(from, to) {
    return Math.round((atNoon(to) - atNoon(from)) / MS_PER_DAY);
  }

  function isoWeekday(date) {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }

  function normalizeStartDate(value) {
    const parsed = parseISODate(value);
    if (!parsed) return DEFAULT_SETTINGS.startDate;
    return toISODate(mondayOf(parsed));
  }

  function getWeekNumber(date, startISO) {
    const start = mondayOf(parseISODate(startISO) || parseISODate(DEFAULT_SETTINGS.startDate));
    const monday = mondayOf(date);
    return Math.floor(diffDays(start, monday) / 7) + 1;
  }

  function getWeekStart(week, startISO = settings.startDate) {
    const start = mondayOf(parseISODate(startISO) || parseISODate(DEFAULT_SETTINGS.startDate));
    return addDays(start, (week - 1) * 7);
  }

  function getWeekDate(week, weekday, startISO = settings.startDate) {
    return addDays(getWeekStart(week, startISO), weekday - 1);
  }

  function formatShortDate(date) {
    return `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
  }

  function formatMonthDay(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatFullDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatWeekRange(week, startISO = settings.startDate) {
    const start = getWeekStart(week, startISO);
    const end = addDays(start, 6);
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 — ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
    }
    if (start.getMonth() === end.getMonth()) {
      return `${start.getMonth() + 1}月${start.getDate()}日 — ${end.getDate()}日`;
    }
    return `${start.getMonth() + 1}月${start.getDate()}日 — ${end.getMonth() + 1}月${end.getDate()}日`;
  }

  function formatDotDate(date) {
    return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
  }

  /* =======================================================
     Time helpers
     ======================================================= */

  function cloneDefaultPeriodTimes() {
    return DEFAULT_PERIOD_TIMES.map((period) => ({ ...period }));
  }

  function isValidTimeString(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function timeToMinutes(value) {
    if (!isValidTimeString(value)) return null;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function normalizePeriodTimes(value) {
    const fallback = cloneDefaultPeriodTimes();
    if (!Array.isArray(value)) return fallback;

    const normalized = DEFAULT_PERIOD_TIMES.map((defaultPeriod, index) => {
      const candidate = value[index];
      if (!candidate || typeof candidate !== 'object') return { ...defaultPeriod };
      const start = isValidTimeString(candidate.start) ? candidate.start : defaultPeriod.start;
      const end = isValidTimeString(candidate.end) ? candidate.end : defaultPeriod.end;
      if (timeToMinutes(start) >= timeToMinutes(end)) return { ...defaultPeriod };
      return { start, end };
    });

    for (let index = 1; index < normalized.length; index += 1) {
      if (timeToMinutes(normalized[index].start) < timeToMinutes(normalized[index - 1].end)) {
        return fallback;
      }
    }
    return normalized;
  }

  function samePeriodTimes(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    return left.every((period, index) =>
      period && period.start === right[index].start && period.end === right[index].end
    );
  }

  function getPeriodTime(period) {
    return settings.periods[period - 1] || DEFAULT_PERIOD_TIMES[period - 1] || { start: '--:--', end: '--:--' };
  }

  function getTimeRange(startPeriod, endPeriod) {
    const start = getPeriodTime(startPeriod).start;
    const end = getPeriodTime(endPeriod).end;
    return `${start}–${end}`;
  }

  function getCourseTime(course) {
    return getTimeRange(course.start, course.end);
  }

  function getSavedScheduleRange() {
    return `${settings.periods[0].start}–${settings.periods[settings.periods.length - 1].end}`;
  }

  function getCurrentPeriodInfo(date = new Date()) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    for (let index = 0; index < settings.periods.length; index += 1) {
      const start = timeToMinutes(settings.periods[index].start);
      const end = timeToMinutes(settings.periods[index].end);
      if (minutes >= start && minutes <= end) {
        return {
          period: index + 1,
          progress: end === start ? 0 : (minutes - start) / (end - start),
        };
      }
    }
    return null;
  }

  /* =======================================================
     Settings & initial state
     ======================================================= */

  function loadSettings() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_) {
      saved = null;
    }

    const next = {
      ...DEFAULT_SETTINGS,
      periods: cloneDefaultPeriodTimes(),
    };
    if (saved && typeof saved === 'object') {
      next.startDate = normalizeStartDate(saved.startDate);
      next.termName = typeof saved.termName === 'string' && saved.termName.trim()
        ? saved.termName.trim().slice(0, 24)
        : DEFAULT_SETTINGS.termName;
      next.theme = saved.theme === 'dark' ? 'dark' : 'light';

      // v1 中没有 settingsVersion；若仍是旧版默认作息，迁移到学校实际作息。
      const isVersioned = Number(saved.settingsVersion) >= SETTINGS_VERSION;
      if (Array.isArray(saved.periods)) {
        if (!isVersioned && samePeriodTimes(saved.periods, LEGACY_DEFAULT_PERIOD_TIMES)) {
          next.periods = cloneDefaultPeriodTimes();
        } else {
          next.periods = normalizePeriodTimes(saved.periods);
        }
      }
    }
    return next;
  }

  let settings = loadSettings();
  document.documentElement.dataset.theme = settings.theme;

  let now = new Date();
  let realWeek = getWeekNumber(now, settings.startDate);
  const initialCurrentInTerm = realWeek >= 1 && realWeek <= MAX_WEEK;

  const state = {
    selectedWeek: initialCurrentInTerm ? realWeek : realWeek < 1 ? 1 : MAX_WEEK,
    activeDay: initialCurrentInTerm ? isoWeekday(now) : 1,
    realWeek,
    realWeekday: isoWeekday(now),
    todayKey: toISODate(now),
    catalogQuery: '',
  };

  function persistSettings() {
    const payload = {
      startDate: settings.startDate,
      termName: settings.termName,
      theme: settings.theme,
      settingsVersion: SETTINGS_VERSION,
      periods: settings.periods.map((period) => ({ ...period })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // 本地存储不可用时，App 依然可以正常展示。
    }
  }

  function applyTheme(theme, options = {}) {
    settings.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = settings.theme;
    if (el.themeMeta) {
      el.themeMeta.setAttribute('content', settings.theme === 'dark' ? '#121712' : '#f3efe6');
    }
    if (el.themeButton) {
      el.themeButton.setAttribute(
        'aria-label',
        settings.theme === 'dark' ? '切换浅色外观' : '切换深色外观'
      );
    }
    persistSettings();
    if (options.announce) {
      showToast(settings.theme === 'dark' ? '已切换到深色外观' : '已切换到浅色外观');
    }
  }

  /* =======================================================
     Data helpers
     ======================================================= */

  const courseGroups = (() => {
    const map = new Map();
    COURSES.forEach((course) => {
      if (!map.has(course.name)) {
        map.set(course.name, {
          name: course.name,
          color: course.color,
          badge: course.badge,
          sessions: [],
        });
      }
      const group = map.get(course.name);
      group.sessions.push(course);
      if (!group.badge && course.badge) group.badge = course.badge;
    });
    return Array.from(map.values())
      .map((group) => {
        group.sessions.sort((a, b) => a.weekday - b.weekday || a.start - b.start);
        group.teachers = Array.from(new Set(group.sessions.flatMap((course) => course.teachers)));
        group.first = group.sessions[0];
        return group;
      })
      .sort((a, b) => a.first.weekday - b.first.weekday || a.first.start - b.first.start);
  })();

  function getSessionsForWeek(week) {
    return COURSES.filter((course) => course.weeks.includes(week));
  }

  function getSessionsForDay(week, weekday) {
    return getSessionsForWeek(week)
      .filter((course) => course.weekday === weekday)
      .sort((a, b) => a.start - b.start || a.name.localeCompare(b.name, 'zh-CN'));
  }

  function getWeekStats(week) {
    const sessions = getSessionsForWeek(week);
    const days = new Set(sessions.map((course) => course.weekday));
    const courses = new Set(sessions.map((course) => course.name));
    const periods = sessions.reduce((sum, course) => sum + course.span, 0);
    return {
      sessions,
      dayCount: days.size,
      courseCount: courses.size,
      sessionCount: sessions.length,
      periods,
    };
  }

  function getPeriodTotals(week) {
    return WEEKDAYS.map((_, index) => {
      const day = index + 1;
      return getSessionsForDay(week, day).reduce((sum, course) => sum + course.span, 0);
    });
  }

  function getWeekdayDate(weekday) {
    return getWeekDate(state.selectedWeek, weekday);
  }

  function getGroup(name) {
    return courseGroups.find((group) => group.name === name) || null;
  }

  function getSessionsForGroup(name) {
    return COURSES.filter((course) => course.name === name);
  }

  function isRealCurrentWeek() {
    return state.realWeek >= 1 && state.realWeek <= MAX_WEEK;
  }

  function isSelectedRealCurrentWeek() {
    return isRealCurrentWeek() && state.selectedWeek === state.realWeek;
  }

  function isToday(weekday) {
    return isSelectedRealCurrentWeek() && weekday === state.realWeekday;
  }

  /* =======================================================
     Rendering · header
     ======================================================= */

  function renderHeader() {
    const stats = getWeekStats(state.selectedWeek);
    const currentInTerm = isRealCurrentWeek();

    el.weekDigits.textContent = String(state.selectedWeek);
    el.pageTitle.setAttribute('aria-label', `第 ${state.selectedWeek} 周`);
    el.calendarWeek.textContent = `第 ${state.selectedWeek} 周`;
    el.weekJump.querySelector('span').textContent = `第 ${state.selectedWeek} 周`;
    el.weekRange.textContent = formatWeekRange(state.selectedWeek);
    el.weekSummary.textContent = stats.sessionCount
      ? `共 ${stats.sessionCount} 次课 · ${stats.periods} 节`
      : '本周暂无课程安排';
    el.metricDays.textContent = `${stats.dayCount} 天有课`;
    el.metricCourses.textContent = `${stats.courseCount} 门课程`;
    el.emptyWeekNumber.textContent = String(state.selectedWeek);
    el.prevWeek.disabled = state.selectedWeek <= 1;
    el.nextWeek.disabled = state.selectedWeek >= MAX_WEEK;
    el.todayButton.title = currentInTerm ? '回到当前教学周与今天' : '当前日期不在教学周内';

    const today = new Date();
    el.todayText.textContent = `${formatFullDate(today)} · ${WEEKDAYS_FULL[today.getDay()]}`;
    el.termText.textContent = settings.termName;
    el.termPillText.textContent = settings.termName;
    el.termPill.title = `${settings.termName} · 修改学期设置`;
    el.termPillText.title = settings.termName;
    el.navCourseCount.textContent = String(courseGroups.length);
    el.footerStartDate.textContent = formatDotDate(parseISODate(settings.startDate));
    el.footerTimeRange.textContent = getSavedScheduleRange();
    el.sideToday.hidden = !currentInTerm || (state.selectedWeek === state.realWeek && state.activeDay === state.realWeekday);

    let statusLabel = '';
    let statusClass = '';
    if (!currentInTerm && state.realWeek < 1) {
      statusLabel = '学期未开始';
      statusClass = 'is-future';
    } else if (!currentInTerm && state.realWeek > MAX_WEEK) {
      statusLabel = '学期已结束';
      statusClass = 'is-ended';
    } else if (state.selectedWeek === state.realWeek) {
      statusLabel = '本周进行中';
      statusClass = 'is-live';
    } else if (state.selectedWeek > state.realWeek) {
      statusLabel = '未来预览';
      statusClass = 'is-future';
    } else {
      statusLabel = '往期回顾';
      statusClass = 'is-past';
    }

    el.weekStatus.className = `week-status ${statusClass}`;
    el.weekStatus.querySelector('span').textContent = statusLabel;

    document.title = `第 ${state.selectedWeek} 周 · ${settings.termName} · 课序`;
  }

  /* =======================================================
     Rendering · week grid
     ======================================================= */

  function renderWeekGrid() {
    const sessions = getSessionsForWeek(state.selectedWeek);
    const byDay = new Map(WEEKDAYS.map((_, index) => [index + 1, []]));
    sessions.forEach((course) => byDay.get(course.weekday).push(course));
    byDay.forEach((list) => list.sort((a, b) => a.start - b.start || a.name.localeCompare(b.name, 'zh-CN')));

    const headHtml = WEEKDAYS.map((name, index) => {
      const day = index + 1;
      const date = getWeekdayDate(day);
      const today = isToday(day);
      const active = state.activeDay === day;
      const weekend = day >= 6;
      const classes = [
        'day-head',
        weekend ? 'is-weekend' : '',
        today ? 'is-today' : '',
        active ? 'is-active' : '',
        day === 7 ? 'is-last' : '',
      ].filter(Boolean).join(' ');
      return `
        <button class="${classes}" type="button" data-day="${day}" aria-pressed="${active}" aria-label="${name} ${formatMonthDay(date)}${today ? '，今天' : ''}">
          <span class="day-name-row"><span class="day-name">${name}</span>${today ? '<span class="day-flag">今</span>' : ''}</span>
          <span class="day-date">${formatShortDate(date)}</span>
        </button>`;
    }).join('');

    const timeHtml = [1, 3, 5, 7, 9, 11].map((start) => `
      <div class="time-group" style="grid-row: ${start + 1} / span 2">
        <span class="time-group-period">${pad2(start)}–${pad2(start + 1)}</span>
        <span class="time-group-time">${getTimeRange(start, start + 1)}</span>
      </div>`).join('');

    const columnHtml = WEEKDAYS.map((name, index) => {
      const day = index + 1;
      const weekend = day >= 6;
      const classes = [
        'day-column',
        weekend ? 'is-weekend' : '',
        isToday(day) ? 'is-today' : '',
        state.activeDay === day ? 'is-active' : '',
        day === 7 ? 'is-last' : '',
      ].filter(Boolean).join(' ');

      const cardsHtml = byDay.get(day).map((course) => {
        const top = (course.start - 1) * ROW_HEIGHT + 3;
        const height = course.span * ROW_HEIGHT - 6;
        const badge = course.badge || (course.span >= 3 ? '连堂' : '');
        const courseTime = getCourseTime(course);
        const aria = `${course.name}，${name}第${course.start}至${course.end}节，${courseTime}，${course.room}，${course.teachers.join('、')}，${course.weekLabel}`;
        return `
          <button class="course-card color-${course.color}" type="button" data-session-id="${course.id}"
            style="top:${top}px;height:${height}px;--weekday:${course.weekday}"
            aria-label="${escapeHtml(aria)}" title="${escapeHtml(aria)}">
            <span class="cc-top">
              <span class="cc-title">${escapeHtml(course.cardName)}</span>
              ${badge ? `<span class="cc-badge">${escapeHtml(badge)}</span>` : ''}
            </span>
            <span class="cc-time">${escapeHtml(courseTime)}</span>
            <span class="cc-meta">${escapeHtml(course.teacherShort)} · ${escapeHtml(course.roomShort)}</span>
            <span class="cc-week">${escapeHtml(course.weekCard)}</span>
          </button>`;
      }).join('');

      return `<div class="${classes}" data-day="${day}" style="grid-column:${day + 1};grid-row:2 / span 12" aria-label="${name}课程">${cardsHtml}</div>`;
    }).join('');

    el.weekGrid.innerHTML = `
      <div class="grid-corner" aria-hidden="true">节次</div>
      ${headHtml}
      ${timeHtml}
      ${columnHtml}
    `;

    el.emptyWeek.hidden = sessions.length > 0;
    updateNowLine();
  }

  function updateNowLine() {
    const existing = $('.now-line', el.weekGrid);
    if (existing) existing.remove();
    if (!isSelectedRealCurrentWeek()) return;

    const info = getCurrentPeriodInfo(new Date());
    if (!info) return;
    const column = $(`.day-column[data-day="${state.realWeekday}"]`, el.weekGrid);
    if (!column) return;

    const now = new Date();
    const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const line = document.createElement('div');
    line.className = 'now-line';
    line.setAttribute('aria-hidden', 'true');
    line.style.top = `${(info.period - 1) * ROW_HEIGHT + info.progress * ROW_HEIGHT}px`;
    line.innerHTML = `<span>现在 ${time}</span>`;
    column.appendChild(line);
  }

  /* =======================================================
     Rendering · mobile agenda
     ======================================================= */

  function renderMobileDays() {
    const counts = Object.fromEntries(WEEKDAYS.map((_, index) => [index + 1, 0]));
    getSessionsForWeek(state.selectedWeek).forEach((course) => {
      counts[course.weekday] += 1;
    });

    el.mobileDays.innerHTML = WEEKDAYS.map((name, index) => {
      const day = index + 1;
      const date = getWeekdayDate(day);
      const active = state.activeDay === day;
      const today = isToday(day);
      const classes = [
        'mobile-day',
        today ? 'is-today' : '',
        active ? 'is-active' : '',
        counts[day] > 0 ? 'has-course' : '',
      ].filter(Boolean).join(' ');
      return `
        <button class="${classes}" type="button" role="tab" aria-selected="${active}" aria-controls="mobileAgenda" data-day="${day}" aria-label="${name} ${formatMonthDay(date)}${today ? '，今天' : ''}，${counts[day]} 次课">
          <span class="mobile-day-name">${name}</span>
          <span class="mobile-day-date">${date.getDate()}</span>
          <span class="mobile-day-dot" aria-hidden="true"></span>
        </button>`;
    }).join('');
  }

  function renderMobileAgenda() {
    const sessions = getSessionsForDay(state.selectedWeek, state.activeDay);
    const date = getWeekdayDate(state.activeDay);
    const today = isToday(state.activeDay);
    const countLabel = sessions.length ? `${sessions.length} 次课` : '没有课';

    const head = `
      <div class="agenda-head">
        <div>
          <p class="section-eyebrow">${today ? 'TODAY' : state.activeDay >= 6 ? 'WEEKEND' : WEEKDAYS_EN[state.activeDay - 1]} · WEEK ${state.selectedWeek}</p>
          <h3>${formatMonthDay(date)} · ${WEEKDAYS[state.activeDay - 1]}</h3>
        </div>
        <span class="agenda-count">${countLabel}</span>
      </div>`;

    if (!sessions.length) {
      const weekSessions = getSessionsForWeek(state.selectedWeek);
      const otherDays = Array.from(new Set(weekSessions.map((course) => course.weekday)))
        .filter((day) => day !== state.activeDay)
        .sort((a, b) => a - b);
      const emptyCopy = weekSessions.length
        ? `本周还有 ${otherDays.length} 天有课：${otherDays.map((day) => WEEKDAYS[day - 1]).join('、')}，点上方星期查看。`
        : state.selectedWeek === 1 || state.selectedWeek === 17
          ? '这一周暂无课程安排，给自己留一点慢下来的时间。'
          : '这一天没有课程安排，可以安排自习或休息。';
      el.mobileAgenda.innerHTML = `
        ${head}
        <div class="mobile-empty">
          <span class="empty-orbit" aria-hidden="true"><i></i></span>
          <h3>${state.selectedWeek === 1 || state.selectedWeek === 17 ? '这一周留白了' : '这一天没有课'}</h3>
          <p>${escapeHtml(emptyCopy)}</p>
        </div>`;
      return;
    }

    const cards = sessions.map((course) => {
      const badge = course.badge || (course.span >= 3 ? '连堂' : '');
      const courseTime = getCourseTime(course);
      return `
        <button class="mobile-course color-${course.color}" type="button" data-session-id="${course.id}"
          aria-label="查看${escapeHtml(course.name)}详情，${escapeHtml(courseTime)}">
          <span class="mobile-period">${pad2(course.start)}–${pad2(course.end)}<small>节</small></span>
          <span class="mobile-course-body">
            <span class="mobile-course-title-row">
              <span class="mobile-course-title">${escapeHtml(course.cardName)}</span>
              ${badge ? `<span class="mobile-badge">${escapeHtml(badge)}</span>` : ''}
            </span>
            <span class="mobile-course-time"><svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg>${escapeHtml(courseTime)}</span>
            <span class="mobile-course-meta">
              <span>${escapeHtml(course.room)}</span>
              <span class="meta-sep">·</span>
              <span>${escapeHtml(course.teacherShort)}</span>
            </span>
            <span class="mobile-course-week">${escapeHtml(course.weekLabel)}</span>
          </span>
          <svg class="icon day-arrow" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
        </button>`;
    }).join('');

    el.mobileAgenda.innerHTML = `${head}<div class="mobile-agenda-list">${cards}</div>`;
  }

  /* =======================================================
     Rendering · side rail
     ======================================================= */

  function renderDayPanel() {
    const sessions = getSessionsForDay(state.selectedWeek, state.activeDay);
    const date = getWeekdayDate(state.activeDay);
    const today = isToday(state.activeDay);
    const en = WEEKDAYS_EN[state.activeDay - 1];

    el.dayEyebrow.textContent = `${en} · ${today ? 'TODAY' : `WEEK ${state.selectedWeek}`}`;
    el.dayTitle.textContent = `${WEEKDAYS[state.activeDay - 1]} · ${formatMonthDay(date)}`;
    el.dayCount.textContent = `${sessions.length} 次课`;
    el.sideToday.hidden = !isRealCurrentWeek() || (state.selectedWeek === state.realWeek && state.activeDay === state.realWeekday);

    if (!sessions.length) {
      const weekSessions = getSessionsForWeek(state.selectedWeek);
      const otherDays = Array.from(new Set(weekSessions.map((course) => course.weekday)))
        .filter((day) => day !== state.activeDay)
        .sort((a, b) => a - b);
      const emptyCopy = weekSessions.length
        ? `本周还有 ${otherDays.length} 天有课：${otherDays.map((day) => WEEKDAYS[day - 1]).join('、')}。`
        : '留一点空白，也很好。';
      el.dayList.innerHTML = `
        <div class="day-empty">
          <span class="day-empty-art"><svg class="icon" aria-hidden="true"><use href="#i-sunrise"/></svg></span>
          <strong>这一天没有课</strong>
          <p>${escapeHtml(emptyCopy)}</p>
        </div>`;
      return;
    }

    el.dayList.innerHTML = sessions.map((course) => `
      <button class="day-item color-${course.color}" type="button" data-session-id="${course.id}" aria-label="查看${escapeHtml(course.name)}详情">
        <span class="day-period">${pad2(course.start)}–${pad2(course.end)}<small>${escapeHtml(getCourseTime(course))}</small></span>
        <span class="day-course">
          <span class="day-course-title"><i class="day-dot" aria-hidden="true"></i><span>${escapeHtml(course.cardName)}</span></span>
          <span class="day-course-meta">${escapeHtml(course.teacherShort)} · ${escapeHtml(course.roomShort)}</span>
          <span class="day-course-week">${escapeHtml(course.weekLabel)}</span>
        </span>
        <svg class="icon day-arrow" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
      </button>`).join('');
  }

  function renderRhythm() {
    const totals = getPeriodTotals(state.selectedWeek);
    const maxTotal = Math.max(...totals, 0);
    const totalPeriods = totals.reduce((sum, value) => sum + value, 0);
    el.rhythmTotal.textContent = `${totalPeriods} 节`;

    el.rhythmChart.innerHTML = WEEKDAYS.map((name, index) => {
      const day = index + 1;
      const periods = totals[index];
      const sessions = getSessionsForDay(state.selectedWeek, day).length;
      const ratio = maxTotal ? periods / maxTotal : 0;
      const height = periods ? Math.max(8, Math.round(8 + ratio * 55)) : 4;
      const classes = [
        'rhythm-col',
        state.activeDay === day ? 'is-active' : '',
        isToday(day) ? 'is-today' : '',
        periods === 0 ? 'is-empty' : '',
      ].filter(Boolean).join(' ');
      return `
        <button class="${classes}" type="button" data-day="${day}" aria-label="${name}，${sessions} 次课，${periods} 节${isToday(day) ? '，今天' : ''}" aria-pressed="${state.activeDay === day}">
          <span class="rhythm-bar-wrap"><span class="rhythm-bar" style="height:${height}px"></span></span>
          <span class="rhythm-day">${name}</span>
        </button>`;
    }).join('');

    if (totalPeriods === 0) {
      el.rhythmNote.textContent = '这一周没有课程安排，时间完全属于你。';
      return;
    }

    const maxDays = totals
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value === maxTotal);
    if (maxDays.length === 1) {
      el.rhythmNote.textContent = `${WEEKDAYS[maxDays[0].index]}是本周高峰，共 ${maxTotal} 节。`;
    } else if (maxDays.length <= 3) {
      el.rhythmNote.textContent = `${maxDays.map((item) => WEEKDAYS[item.index]).join('、')}并列最满，各 ${maxTotal} 节。`;
    } else {
      el.rhythmNote.textContent = `本周有 ${maxDays.length} 天并列最满，各 ${maxTotal} 节。`;
    }
  }

  function renderSemester() {
    const percent = Math.round((state.selectedWeek / MAX_WEEK) * 100);
    el.semesterWeek.textContent = String(state.selectedWeek);
    el.semesterMax.textContent = String(MAX_WEEK);
    el.semesterTerm.textContent = settings.termName;
    el.semesterProgress.style.width = `${percent}%`;
    el.semesterPercent.textContent = `已走过 ${percent}%`;
    el.semesterRemain.textContent = state.selectedWeek >= MAX_WEEK
      ? '最后一周'
      : `还剩 ${MAX_WEEK - state.selectedWeek} 周`;
  }

  /* =======================================================
     Rendering · week picker
     ======================================================= */

  function renderWeekPicker() {
    el.weekPicker.innerHTML = Array.from({ length: MAX_WEEK }, (_, index) => {
      const week = index + 1;
      const stats = getWeekStats(week);
      const classes = [
        'week-option',
        week === state.selectedWeek ? 'is-selected' : '',
        week === state.realWeek && isRealCurrentWeek() ? 'is-current' : '',
        stats.sessionCount === 0 ? 'is-empty' : '',
      ].filter(Boolean).join(' ');
      return `
        <button class="${classes}" type="button" role="option" aria-selected="${week === state.selectedWeek}"
          data-week="${week}" aria-label="第 ${week} 周，${stats.sessionCount ? `${stats.sessionCount} 次课` : '没有课程'}">
          <strong>${pad2(week)}</strong>
          <small>${stats.sessionCount ? `${stats.sessionCount} 次课` : '无课'}</small>
        </button>`;
    }).join('');
  }

  /* =======================================================
     Rendering · catalog
     ======================================================= */

  function renderCatalog(query = state.catalogQuery) {
    const normalized = query.trim().toLowerCase();
    const filtered = courseGroups.filter((group) => {
      if (!normalized) return true;
      const haystack = [
        group.name,
        (COURSE_ALIASES[group.name] || []).join(' '),
        group.teachers.join(' '),
        ...group.sessions.flatMap((course) => [
          course.cardName,
          course.room,
          course.weekLabel,
          course.weekCard,
          WEEKDAYS[course.weekday - 1],
          course.periodLabel,
          getCourseTime(course),
        ]),
      ].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });

    el.catalogSummary.textContent = `${courseGroups.length} 门课程 · ${COURSES.length} 个时段`;
    el.searchCount.textContent = normalized ? `找到 ${filtered.length} 门` : `${courseGroups.length} 门课程`;

    if (!filtered.length) {
      el.courseCatalog.innerHTML = `
        <div class="catalog-empty">
          <span class="empty-orbit" aria-hidden="true"><i></i></span>
          <strong>没有找到匹配的课程</strong>
          <p>试试课程名、老师姓名或教学楼。</p>
        </div>`;
      return;
    }

    el.courseCatalog.innerHTML = filtered.map((group) => {
      const chips = group.sessions.map((course) => `
        <span class="session-chip"><i aria-hidden="true"></i>${WEEKDAYS[course.weekday - 1]} ${escapeHtml(getCourseTime(course))}<em>· ${escapeHtml(course.roomShort)}</em></span>`).join('');
      const weekLabels = Array.from(new Set(group.sessions.map((course) => course.weekLabel))).join(' / ');
      return `
        <button class="catalog-course color-${group.color}" type="button" data-course-name="${escapeHtml(group.name)}" aria-label="查看${escapeHtml(group.name)}详情">
          <span class="catalog-swatch" aria-hidden="true"></span>
          <span class="catalog-main">
            <span class="catalog-title-row">
              <span class="catalog-title">${escapeHtml(group.name)}</span>
              <span class="catalog-count">${group.sessions.length} 个时段</span>
            </span>
            <span class="catalog-teacher">${escapeHtml(group.teachers.join('、'))}</span>
            <span class="session-chips">${chips}</span>
            <span class="catalog-weeks">周次：${escapeHtml(weekLabels)}</span>
          </span>
          <svg class="icon catalog-arrow" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
        </button>`;
    }).join('');
  }

  /* =======================================================
     Rendering · detail
     ======================================================= */

  function renderDetail(sessionId) {
    const session = COURSES.find((course) => course.id === sessionId);
    if (!session) return;

    const sessions = getSessionsForGroup(session.name).sort(
      (a, b) => a.weekday - b.weekday || a.start - b.start
    );
    const teachers = Array.from(new Set(sessions.flatMap((course) => course.teachers)));
    const times = Array.from(new Set(sessions.map((course) => `${WEEKDAYS[course.weekday - 1]} · ${getCourseTime(course)}`)));
    const weekLabels = Array.from(new Set(sessions.map((course) => course.weekLabel)));
    const rooms = Array.from(new Set(sessions.map((course) => course.room)));
    const totalOccurrences = sessions.reduce((sum, course) => sum + course.weeks.length, 0);
    const hasThisWeek = sessions.some((course) => course.weeks.includes(state.selectedWeek));
    const sourceNotes = Array.from(new Set(sessions.map((course) => course.sourceNote).filter(Boolean)));
    const badge = session.badge;

    const sessionRows = sessions.map((course) => {
      const active = course.weeks.includes(state.selectedWeek);
      return `
        <div class="session-row">
          <span class="session-day">${WEEKDAYS[course.weekday - 1]}</span>
          <span class="session-main">
            <strong>${escapeHtml(getCourseTime(course))} · ${escapeHtml(course.room)}</strong>
            <p>第 ${course.start}–${course.end} 节 · ${escapeHtml(course.weekLabel)} · ${escapeHtml(course.teachers.join('、'))}</p>
          </span>
          ${active ? `<span class="session-now">${state.selectedWeek === state.realWeek ? '本周有课' : '该周有课'}</span>` : ''}
        </div>`;
    }).join('');

    const noteHtml = sourceNotes.length
      ? `<div class="source-note"><svg class="icon" aria-hidden="true"><use href="#i-info"/></svg><span>${escapeHtml(sourceNotes.join(' '))}</span></div>`
      : '';

    const locationHint = rooms.length > 1
      ? `<div class="source-note"><svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg><span>这门课有多个上课地点，请按上方各周次安排前往。</span></div>`
      : '';

    el.detailContent.innerHTML = `
      <div class="detail-content color-${session.color}">
        <div class="detail-accent" aria-hidden="true"></div>
        <div class="detail-inner">
          <div class="detail-head">
            <div>
              <span class="detail-kicker">课程详情 · 第 ${state.selectedWeek} 周${hasThisWeek ? '有课' : '无课'}</span>
              <h2 class="detail-title" id="detailTitle">${escapeHtml(session.name)}${badge ? `<span class="detail-title-badge">${escapeHtml(badge)}</span>` : ''}</h2>
              <p class="detail-teacher">${escapeHtml(teachers.join('、'))}</p>
            </div>
            <button class="small-icon-button dialog-close" type="button" data-close-dialog="detailDialog" aria-label="关闭课程详情">
              <svg class="icon" aria-hidden="true"><use href="#i-x"/></svg>
            </button>
          </div>

          <div class="detail-chips">
            ${times.map((time) => `<span class="detail-chip"><svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg>${escapeHtml(time)}</span>`).join('')}
            <span class="detail-chip">共 ${totalOccurrences} 次课</span>
            ${hasThisWeek ? '<span class="detail-chip is-now">当前预览周有课</span>' : '<span class="detail-chip">当前预览周无课</span>'}
          </div>

          <div class="detail-section">
            <div class="detail-section-head">
              <h3>上课安排</h3>
              <span class="detail-section-note">${escapeHtml(weekLabels.join(' / '))}</span>
            </div>
            ${sessionRows}
          </div>

          ${noteHtml}
          ${locationHint}

          <div class="detail-actions">
            <button class="secondary-button" type="button" data-close-dialog="detailDialog">关闭</button>
          </div>
        </div>
      </div>`;
  }

  /* =======================================================
     App rendering
     ======================================================= */

  function renderWeekViews() {
    renderHeader();
    renderWeekGrid();
    renderMobileDays();
    renderMobileAgenda();
    renderDayPanel();
    renderRhythm();
    renderSemester();
    renderWeekPicker();
  }

  function updateActiveDayUI() {
    $$('.day-head', el.weekGrid).forEach((button) => {
      const active = Number(button.dataset.day) === state.activeDay;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('.day-column', el.weekGrid).forEach((column) => {
      column.classList.toggle('is-active', Number(column.dataset.day) === state.activeDay);
    });
    $$('.mobile-day').forEach((button) => {
      const active = Number(button.dataset.day) === state.activeDay;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $$('.rhythm-col').forEach((button) => {
      const active = Number(button.dataset.day) === state.activeDay;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setActiveDay(day) {
    if (day < 1 || day > 7 || day === state.activeDay) return;
    state.activeDay = day;
    updateActiveDayUI();
    renderMobileAgenda();
    renderDayPanel();
  }

  function setWeek(week, options = {}) {
    const next = Math.max(1, Math.min(MAX_WEEK, week));
    if (next === state.selectedWeek && !options.force) {
      if (options.activeDay) setActiveDay(options.activeDay);
      closeWeekPopover();
      return;
    }
    state.selectedWeek = next;
    if (options.activeDay) state.activeDay = options.activeDay;
    closeWeekPopover();
    renderWeekViews();
    if (options.announce !== false) {
      announceWeek();
    }
  }

  function announceWeek() {
    if (!el.weekAnnouncement) return;
    el.weekAnnouncement.textContent = `已切换到第 ${state.selectedWeek} 周，${formatWeekRange(state.selectedWeek)}，${getWeekStats(state.selectedWeek).sessionCount} 次课。`;
  }

  function jumpToToday() {
    if (!isRealCurrentWeek()) {
      showToast('当前日期不在第 1–19 教学周内');
      return;
    }
    setWeek(state.realWeek, { activeDay: state.realWeekday, force: true });
  }

  /* =======================================================
     Week popover
     ======================================================= */

  function positionWeekPopover() {
    if (el.weekPopover.hidden) return;
    const trigger = el.weekJump.getBoundingClientRect();
    const rect = el.weekPopover.getBoundingClientRect();
    const margin = 12;
    let left = trigger.right - rect.width;
    left = Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin));
    let top = trigger.bottom + 10;
    if (top + rect.height > window.innerHeight - margin) {
      top = trigger.top - rect.height - 10;
    }
    top = Math.max(margin, top);
    el.weekPopover.style.left = `${Math.round(left)}px`;
    el.weekPopover.style.top = `${Math.round(top)}px`;
  }

  function openWeekPopover() {
    closeOpenDialogs();
    el.weekPopover.hidden = false;
    el.weekJump.setAttribute('aria-expanded', 'true');
    positionWeekPopover();
    const selected = $('.week-option.is-selected', el.weekPopover);
    if (selected) selected.focus({ preventScroll: true });
  }

  function closeWeekPopover() {
    if (el.weekPopover.hidden) return;
    el.weekPopover.hidden = true;
    el.weekJump.setAttribute('aria-expanded', 'false');
  }

  function toggleWeekPopover() {
    if (el.weekPopover.hidden) openWeekPopover();
    else closeWeekPopover();
  }

  /* =======================================================
     Dialogs & toast
     ======================================================= */

  let toastTimer = null;

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.toast.classList.remove('is-visible');
    }, 2400);
  }

  function syncModalState() {
    const hasOpen = $$('dialog[open]').length > 0;
    document.body.classList.toggle('has-open-dialog', hasOpen);
  }

  function closeOpenDialogs() {
    $$('dialog[open]').forEach((dialog) => {
      if (dialog.id !== 'settingsDialog') dialog.close();
    });
  }

  function openDialog(dialog) {
    closeWeekPopover();
    if (!dialog.open) dialog.showModal();
    syncModalState();
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function openCatalog() {
    renderCatalog(el.courseSearch.value || '');
    openDialog(el.catalogDialog);
    window.setTimeout(() => {
      el.courseSearch.focus({ preventScroll: true });
    }, 70);
  }

  function openSettings() {
    el.termNameInput.value = settings.termName;
    el.startDateInput.value = settings.startDate;
    fillTimeEditor(settings.periods);
    updateSettingsPreview();
    openDialog(el.settingsDialog);
  }

  function openDetail(sessionId) {
    closeDialog(el.catalogDialog);
    renderDetail(sessionId);
    openDialog(el.detailDialog);
    syncModalState();
  }

  function openGroupDetail(name) {
    const sessions = getSessionsForGroup(name);
    if (!sessions.length) return;
    const active = sessions.find((session) => session.weeks.includes(state.selectedWeek)) || sessions[0];
    openDetail(active.id);
  }

  /* =======================================================
     Settings interactions
     ======================================================= */

  function previewStartValues() {
    const raw = el.startDateInput.value;
    const parsed = parseISODate(raw);
    if (!parsed) {
      el.previewWeekLabel.textContent = '请选择一个有效的开学日期';
      el.previewDateLabel.textContent = `教学周范围会从第 1 周到第 ${MAX_WEEK} 周自动计算`;
      return;
    }
    const monday = mondayOf(parsed);
    const startISO = toISODate(monday);
    const previewNow = new Date();
    const week = getWeekNumber(previewNow, startISO);
    const inTerm = week >= 1 && week <= MAX_WEEK;
    const end = addDays(getWeekStart(MAX_WEEK, startISO), 6);

    if (inTerm) {
      el.previewWeekLabel.textContent = `按此日期，今天是第 ${week} 周`;
    } else if (week < 1) {
      el.previewWeekLabel.textContent = '按此日期，学期尚未开始';
    } else {
      el.previewWeekLabel.textContent = '按此日期，学期已经结束';
    }
    el.previewDateLabel.textContent = `第 1 周：${formatFullDate(monday)} · 第 ${MAX_WEEK} 周结束：${formatFullDate(end)}`;
  }

  function updateSettingsPreview() {
    previewStartValues();
  }

  function buildTimeEditor() {
    el.timeGrid.innerHTML = DEFAULT_PERIOD_TIMES.map((period, index) => `
      <label class="time-field" data-time-index="${index}">
        <span class="time-field-label">第 ${index + 1} 节</span>
        <span class="time-field-controls">
          <input type="time" data-period="${index + 1}" data-bound="start" value="${period.start}" step="60" aria-label="第 ${index + 1} 节开始时间">
          <span class="time-dash" aria-hidden="true">–</span>
          <input type="time" data-period="${index + 1}" data-bound="end" value="${period.end}" step="60" aria-label="第 ${index + 1} 节结束时间">
        </span>
      </label>`).join('');
    updateTimeSummaryFromInputs();
  }

  function fillTimeEditor(periods) {
    const values = normalizePeriodTimes(periods);
    const starts = $$('input[data-bound="start"]', el.timeGrid);
    const ends = $$('input[data-bound="end"]', el.timeGrid);
    starts.forEach((input, index) => { input.value = values[index].start; });
    ends.forEach((input, index) => { input.value = values[index].end; });
    clearTimeErrors();
    updateTimeSummaryFromInputs();
  }

  function clearTimeErrors() {
    $$('.time-field', el.timeGrid).forEach((row) => row.classList.remove('is-invalid'));
    $$('input', el.timeGrid).forEach((input) => input.removeAttribute('aria-invalid'));
  }

  function updateTimeSummaryFromInputs() {
    const firstStart = $('input[data-bound="start"][data-period="1"]', el.timeGrid);
    const lastEnd = $('input[data-bound="end"][data-period="12"]', el.timeGrid);
    if (!firstStart || !lastEnd) return;
    el.timeSummaryRange.textContent = `${firstStart.value || '--:--'}–${lastEnd.value || '--:--'}`;
  }

  function readTimeInputs() {
    const starts = $$('input[data-bound="start"]', el.timeGrid);
    const ends = $$('input[data-bound="end"]', el.timeGrid);
    const periods = [];

    for (let index = 0; index < DEFAULT_PERIOD_TIMES.length; index += 1) {
      const start = starts[index]?.value || '';
      const end = ends[index]?.value || '';
      if (!isValidTimeString(start) || !isValidTimeString(end)) {
        return { error: true, index, reason: `请完整填写第 ${index + 1} 节的开始和结束时间` };
      }
      if (timeToMinutes(start) >= timeToMinutes(end)) {
        return { error: true, index, reason: `第 ${index + 1} 节的结束时间需要晚于开始时间` };
      }
      if (index > 0 && timeToMinutes(start) < timeToMinutes(periods[index - 1].end)) {
        return { error: true, index, reason: `第 ${index + 1} 节与上一节时间重叠，请调整` };
      }
      periods.push({ start, end });
    }
    return { error: false, periods };
  }

  function showTimeInputError(result) {
    clearTimeErrors();
    if (!result || result.index == null) return;
    const row = $(`[data-time-index="${result.index}"]`, el.timeGrid);
    if (row) {
      row.classList.add('is-invalid');
      $$('input', row).forEach((input) => input.setAttribute('aria-invalid', 'true'));
    }
    el.timeSettings.open = true;
    const startInput = $(`input[data-period="${result.index + 1}"][data-bound="start"]`, el.timeGrid);
    startInput?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    startInput?.focus({ preventScroll: true });
    showToast(result.reason || '作息时间有误，请检查');
  }

  function handleSettingsSave(event) {
    event.preventDefault();
    const rawDate = el.startDateInput.value;
    const parsed = parseISODate(rawDate);
    if (!parsed) {
      el.startDateInput.focus();
      if (typeof el.startDateInput.reportValidity === 'function') {
        el.startDateInput.reportValidity();
      }
      showToast('请先选择一个有效的开学日期');
      return;
    }

    const timeResult = readTimeInputs();
    if (timeResult.error) {
      showTimeInputError(timeResult);
      return;
    }

    settings.startDate = normalizeStartDate(rawDate);
    settings.termName = el.termNameInput.value.trim().slice(0, 24) || '我的学期';
    settings.periods = timeResult.periods;
    persistSettings();

    now = new Date();
    state.realWeek = getWeekNumber(now, settings.startDate);
    state.realWeekday = isoWeekday(now);
    state.todayKey = toISODate(now);
    const inTerm = state.realWeek >= 1 && state.realWeek <= MAX_WEEK;
    state.selectedWeek = inTerm ? state.realWeek : state.realWeek < 1 ? 1 : MAX_WEEK;
    state.activeDay = inTerm ? state.realWeekday : 1;

    renderWeekViews();
    closeDialog(el.settingsDialog);
    showToast(`设置已保存 · ${inTerm ? `当前第 ${state.realWeek} 周` : '当前不在教学周内'}`);
  }

  function resetSettingsForm() {
    el.termNameInput.value = DEFAULT_SETTINGS.termName;
    el.startDateInput.value = DEFAULT_SETTINGS.startDate;
    fillTimeEditor(DEFAULT_PERIOD_TIMES);
    updateSettingsPreview();
  }

  /* =======================================================
     Event binding
     ======================================================= */

  el.prevWeek.addEventListener('click', () => setWeek(state.selectedWeek - 1));
  el.nextWeek.addEventListener('click', () => setWeek(state.selectedWeek + 1));
  el.todayButton.addEventListener('click', jumpToToday);
  el.sideToday.addEventListener('click', jumpToToday);
  el.weekJump.addEventListener('click', toggleWeekPopover);
  el.closeWeekPopover.addEventListener('click', closeWeekPopover);
  el.weekPicker.addEventListener('click', (event) => {
    const option = event.target.closest('[data-week]');
    if (!option) return;
    setWeek(Number(option.dataset.week), { activeDay: state.activeDay });
    el.weekJump.focus({ preventScroll: true });
  });

  el.weekGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.course-card');
    if (card) {
      openDetail(card.dataset.sessionId);
      return;
    }
    const head = event.target.closest('.day-head');
    if (head) setActiveDay(Number(head.dataset.day));
  });

  el.mobileDays.addEventListener('click', (event) => {
    const button = event.target.closest('[data-day]');
    if (button) setActiveDay(Number(button.dataset.day));
  });

  el.mobileAgenda.addEventListener('click', (event) => {
    const card = event.target.closest('.mobile-course');
    if (card) openDetail(card.dataset.sessionId);
  });

  el.dayList.addEventListener('click', (event) => {
    const item = event.target.closest('.day-item');
    if (item) openDetail(item.dataset.sessionId);
  });

  el.rhythmChart.addEventListener('click', (event) => {
    const column = event.target.closest('[data-day]');
    if (column) setActiveDay(Number(column.dataset.day));
  });

  el.navCourses.addEventListener('click', openCatalog);
  el.emptyCoursesButton.addEventListener('click', openCatalog);
  el.courseSearch.addEventListener('input', () => {
    state.catalogQuery = el.courseSearch.value;
    renderCatalog(state.catalogQuery);
  });

  el.courseCatalog.addEventListener('click', (event) => {
    const item = event.target.closest('[data-course-name]');
    if (!item) return;
    openGroupDetail(item.dataset.courseName);
  });

  el.themeButton.addEventListener('click', () => {
    applyTheme(settings.theme === 'dark' ? 'light' : 'dark', { announce: true });
  });

  el.termPill.addEventListener('click', openSettings);
  el.settingsButton.addEventListener('click', openSettings);
  el.footerSettings.addEventListener('click', openSettings);
  el.startDateInput.addEventListener('input', updateSettingsPreview);
  el.startDateInput.addEventListener('change', updateSettingsPreview);
  el.timeGrid.addEventListener('input', (event) => {
    const field = event.target.closest('.time-field');
    if (field) {
      field.classList.remove('is-invalid');
      $$('input', field).forEach((input) => input.removeAttribute('aria-invalid'));
    }
    updateTimeSummaryFromInputs();
  });
  el.resetTimes.addEventListener('click', () => {
    fillTimeEditor(DEFAULT_PERIOD_TIMES);
    el.timeSettings.open = true;
  });
  el.resetSettings.addEventListener('click', resetSettingsForm);
  el.settingsForm.addEventListener('submit', handleSettingsSave);

  el.navWeek.addEventListener('click', () => {
    closeWeekPopover();
    $('#calendarCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) {
      const id = closeButton.getAttribute('data-close-dialog');
      const dialog = document.getElementById(id);
      if (dialog) closeDialog(dialog);
    }

    if (!el.weekPopover.hidden && !el.weekPopover.contains(event.target) && !el.weekJump.contains(event.target)) {
      closeWeekPopover();
    }
  });

  [el.settingsDialog, el.catalogDialog, el.detailDialog].forEach((dialog) => {
    dialog.addEventListener('close', syncModalState);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  window.addEventListener('resize', () => {
    if (!el.weekPopover.hidden) positionWeekPopover();
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!el.weekPopover.hidden) closeWeekPopover();
    },
    { passive: true }
  );

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof Element && (
      target.matches('input, textarea, select') ||
      target.closest('[contenteditable="true"]')
    );

    if (event.key === 'Escape') {
      if (!el.weekPopover.hidden) {
        closeWeekPopover();
        el.weekJump.focus();
        return;
      }
      return;
    }

    if (isTyping) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if ($$('dialog[open]').length > 0) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setWeek(state.selectedWeek - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setWeek(state.selectedWeek + 1);
    } else if (event.key === '/') {
      event.preventDefault();
      openCatalog();
    } else if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      jumpToToday();
    }
  });

  // Update the in-class indicator every half minute.
  window.setInterval(updateNowLine, 30000);

  // Keep the page aware of a midnight rollover without interrupting the user.
  window.setInterval(() => {
    const current = new Date();
    const key = toISODate(current);
    if (key !== state.todayKey) {
      now = current;
      state.todayKey = key;
      state.realWeek = getWeekNumber(now, settings.startDate);
      state.realWeekday = isoWeekday(now);
      renderHeader();
      renderWeekGrid();
      renderMobileDays();
      renderMobileAgenda();
      renderDayPanel();
      renderRhythm();
      renderWeekPicker();
    }
  }, 60000);

  /* =======================================================
     Helpers
     ======================================================= */

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  /* =======================================================
     Init
     ======================================================= */

  applyTheme(settings.theme);
  syncModalState();
  buildTimeEditor();
  renderWeekViews();
  renderCatalog('');

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // 离线能力是可选项，注册失败不影响课表使用。
      });
    });
  }

  // A small development hook for checking the normalized data from the console.
  window.Courseflow = {
    data: COURSES,
    groups: courseGroups,
    state,
    render: renderWeekViews,
  };
})();
