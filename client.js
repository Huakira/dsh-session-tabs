window.__ModuleLoader__.load({
  id: '@local/session-tabs',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'sessionTabs';
    const STORE_KEY = 'dsh.session-tabs:v1';
    const MAX_TABS = 12;

    const DICT = {
      zh: {
        openInTabs: '在标签页中打开',
        addCurrent: '把当前会话加入标签页',
        closeTab: '关闭标签页',
        'settings.toggle': '启用会话标签页',
        'settings.on': '标签条显示在会话标题上方，侧栏行菜单提供入口。',
        'settings.off': '标签条与所有入口已隐藏；重新打开立即生效。',
        'settings.save': '保存',
        'settings.saving': '保存中…',
        'settings.saveFailed': '部署未接受这些值，已为你保留待修正。',
        'settings.readonly': '此部署以只读方式存储配置。',
        'settings.unavailable': '配置表单暂不可用，无法显示开关。',
      },
      en: {
        openInTabs: 'Open in tabs',
        addCurrent: 'Add current session to tabs',
        closeTab: 'Close tab',
        'settings.toggle': 'Show session tabs',
        'settings.on': 'The tab strip sits above the conversation title; sidebar row menus offer the entries.',
        'settings.off': 'The strip and its entry points are hidden; turning it back on applies immediately.',
        'settings.save': 'Save',
        'settings.saving': 'Saving…',
        'settings.saveFailed': 'The deployment rejected these values; they were kept for you to fix.',
        'settings.readonly': 'This deployment stores its configuration as read-only.',
        'settings.unavailable': 'The configuration form is unavailable, so the toggle cannot be shown.',
      },
    };

    // ---- styles ------------------------------------------------------------
    // Structural layout is INLINE (survives even if the <style> tag is blocked
    // by CSP); the stylesheet only adds hover/transition polish with !important
    // so it can override inline base values.
    // Geometry: slim OWN ROW ABOVE THE TITLE. The strip registers on
    // conversation.header.leading (root scope, no built-in occupant). A
    // zero-width in-flow spacer grows the header's first grid row; the tray is
    // absolutely positioned at the very top of that band, horizontally
    // centered. Chips are 20px tall. The injected stylesheet additionally
    // sinks the title to the bottom of the stretched row (align-items:flex-end)
    // and removes the native tabs-row margin so no dead band is left between
    // title and native view tabs (Q1: "标题和原生标签页之间空了太多").
    const SPACER_STYLE = { width: 0, height: '58px' };
    const ANCHOR_STYLE = {
      position: 'absolute', top: '3px', left: 0, right: 0, zIndex: 5,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    };
    const TRAY_STYLE = {
      display: 'flex', alignItems: 'center', gap: '3px',
      maxWidth: 'min(760px, 62vw)', overflowX: 'auto', scrollbarWidth: 'none',
      padding: '2px', borderRadius: '10px', pointerEvents: 'auto',
      background: 'color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent)',
      border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)',
      boxShadow: '0 1px 6px rgba(0,0,0,.06)',
    };
    // Browser-like tabs: every chip may SHRINK below its natural width
    // (flex-shrink:1, basis 160px); the title span clips with an ellipsis.
    // With few tabs chips sit at natural width; with many they compress
    // evenly until minWidth, then the tray scrolls (Q4).
    const TAB_STYLE = {
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      maxWidth: '200px', minWidth: '40px', flex: '0 1 160px',
      height: '20px', padding: '0 5px 0 9px', borderRadius: '7px',
      border: 'none', font: 'inherit', fontSize: '12px', lineHeight: 1,
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      overflow: 'hidden',
      color: 'var(--dsw-alias-label-secondary)',
      transition: 'background .18s ease, color .18s ease, box-shadow .18s ease, transform .12s ease',
    };
    const TAB_ACTIVE_STYLE = {
      background: 'color-mix(in srgb, var(--dsw-alias-bg-base) 85%, transparent)',
      color: 'var(--dsw-alias-label-primary)', fontWeight: 500,
      boxShadow: 'inset 0 0 0 .5px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent), 0 1px 4px rgba(0,0,0,.10)',
    };
    const TITLE_STYLE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '0 1 auto', minWidth: 0 };
    // Status dot — same priority and palette as dsh-session-library's rows:
    // errored > pendingInteraction > running > completionUnread > none (Q3).
    const DOT_BASE = { width: '6px', height: '6px', borderRadius: '50%', flex: '0 0 auto' };
    const STATUS_DOTS = {
      error: { background: 'var(--dsw-alias-state-error-primary, #b33535)' },
      attention: { background: 'var(--dsw-alias-state-warning-primary, #a36516)' },
      running: {
        background: 'var(--dsw-focus-ring-color, #4c78a8)',
        animation: 'stb-pulse 1.6s ease-in-out infinite',
      },
      done: { background: 'var(--dsw-alias-state-success-primary, #2f9e44)' },
    };
    const CLOSE_STYLE = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: '0 0 auto', width: '14px', height: '14px', padding: 0,
      border: 'none', borderRadius: '50%', background: 'transparent',
      color: 'inherit', fontSize: '12px', lineHeight: 1, cursor: 'pointer',
      opacity: 0.45, transition: 'opacity .15s ease, background .15s ease',
    };
    const STYLE_ID = 'stb-style';
    const CSS = `
.stb-tab:not([data-active="true"]):hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)!important;color:var(--dsw-alias-label-primary)!important}
.stb-tab:active{transform:scale(.96)!important}
.stb-tab[data-active="true"]:active{transform:none!important}
.stb-close:hover{opacity:1!important;background:color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)!important}
@keyframes stb-pulse{0%,100%{opacity:1}50%{opacity:.3}}
.stb-tray::-webkit-scrollbar{display:none}
/* Q1: with the strip present, sink the title to the bottom of the stretched
   first grid row and drop the native tabs-row top margin, so the band reads
   [tabs / title / view-tabs] with no dead space. Scoped with :has(.stb-tray)
   so the official header is untouched when the strip is absent. The hashed
   class names are the installed build's; if DSH updates and they change, the
   rules go inert and the layout degrades to the centered-spacer fallback. */
.wSkVaW_header:has(.stb-tray) .wSkVaW_titleRow{align-items:flex-end!important}
.wSkVaW_header:has(.stb-tray) .wSkVaW_tabs{margin-top:2px!important}
`;
    function ensureStyles() {
      if (typeof document === 'undefined') return;
      let el = document.getElementById(STYLE_ID);
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        document.head.appendChild(el);
      }
      el.textContent = CSS;
    }

    // ---- tiny tab store (localStorage + pub/sub) --------------------------
    // Titles are captured when a tab is pinned (the sidebar row owner props
    // carry displayTitle) and refreshed whenever the client's session list
    // projects a better one. The client list state only covers the active
    // workspace, so pinned cross-workspace tabs keep their captured title.
    const TITLE_STORE_KEY = 'dsh.session-tabs:titles:v1';
    function loadTitles() {
      try {
        const value = JSON.parse(localStorage.getItem(TITLE_STORE_KEY));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      } catch {
        return {};
      }
    }
    let knownTitles = loadTitles();
    function rememberTitles(patch) {
      let changed = false;
      for (const [id, title] of Object.entries(patch)) {
        if (typeof title === 'string' && title && knownTitles[id] !== title) {
          knownTitles[id] = title;
          changed = true;
        }
      }
      if (changed) {
        try { localStorage.setItem(TITLE_STORE_KEY, JSON.stringify(knownTitles)); } catch { /* private mode */ }
      }
    }
    function loadTabs() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value.filter((id) => typeof id === 'string' && id) : [];
      } catch {
        return [];
      }
    }
    // Runtime SessionIds are "session-<uuid>" strings. Ids without the prefix
    // (older stored tabs, third-party callers) only resolve for sessions the
    // controller already knows; the full form resolves universally, so every
    // id that enters the store is normalized here.
    const normId = (id) => (typeof id === 'string' && id && !id.startsWith('session-') ? 'session-' + id : id);
    const rawId = (id) => (typeof id === 'string' ? id.replace(/^session-/, '') : id);
    let tabs = loadTabs().map(normId);
    const listeners = new Set();
    function setTabs(next) {
      tabs = next;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* private mode etc. */ }
      for (const listen of listeners) listen(tabs);
    }
    function subscribe(listen) {
      listeners.add(listen);
      return () => { listeners.delete(listen); };
    }
    function useTabList() {
      const [list, setList] = React.useState(tabs);
      React.useEffect(() => subscribe(setList), []);
      return list;
    }
    function addTab(id, title) {
      const key = normId(id);
      if (typeof key !== 'string' || !key || tabs.includes(key)) return;
      if (typeof title === 'string' && title) rememberTitles({ [key]: title });
      setTabs([...tabs, key].slice(-MAX_TABS));
    }
    // Which tab ids currently report "held by the main view" (written by each
    // TabItem during render; pruned by TabsStrip). Used by closeTab to decide
    // whether closing a tab should also switch the main view.
    const selectedTabs = new Map();

    // Current main-view session id, reported by a session-scoped tracker slot
    // (its standard props carry `sessionId`, so it re-renders on every
    // navigation). TabsStrip uses it to give the open session a tab —
    // browser semantics: the session you are looking at always has a tab and
    // the strip never shows a stale highlight (Q2: labels "didn't match" the
    // open session because the open session had no tab at all).
    let currentSessionId = null;
    const currentListeners = new Set();
    function setCurrentSession(id) {
      if (id === currentSessionId) return;
      currentSessionId = id;
      for (const listen of [...currentListeners]) {
        try { listen(id); } catch { /* a listener must not break the rest */ }
      }
    }
    function SessionTracker(props) {
      const id = props.sessionId;
      React.useEffect(() => {
        setCurrentSession(typeof id === 'string' && id ? id : null);
      }, [id]);
      return null;
    }

    function useCurrentSession() {
      const [id, setId] = React.useState(currentSessionId);
      React.useEffect(() => {
        currentListeners.add(setId);
        return () => { currentListeners.delete(setId); };
      }, []);
      return id;
    }

    // ---- settings toggle -----------------------------------------------------
    // The Host row's Config schema (index.js) declares `enabled`; the client
    // reads it through the shared configForms service and mirrors it here so
    // every surface (strip, menu, row action, tracker auto-add) reacts.
    const ENTRY_ID = 'session-tabs'; // the id this bundle's patch row declares
    const enabledStore = { value: true, writable: true, listeners: new Set() };
    function setEnabledState(next) {
      if (next.enabled === enabledStore.value && next.writable === enabledStore.writable) return;
      if (next.enabled !== undefined) enabledStore.value = next.enabled !== false;
      if (next.writable !== undefined) enabledStore.writable = next.writable !== false;
      for (const listen of [...enabledStore.listeners]) {
        try { listen({ enabled: enabledStore.value, writable: enabledStore.writable }); } catch { /* one listener must not break the rest */ }
      }
    }
    function useEnabledState() {
      const [state, setState] = React.useState(() => ({ enabled: enabledStore.value, writable: enabledStore.writable }));
      React.useEffect(() => {
        const sync = (next) => setState(next);
        enabledStore.listeners.add(sync);
        return () => { enabledStore.listeners.delete(sync); };
      }, []);
      return state;
    }

    // ---- components --------------------------------------------------------
    function TabItem(props) {
      // Active = the session the tracker reports as open in the main view.
      // (The retain-registry route was abandoned: its key format for
      // explicit-id lookups proved unreliable, while the tracker's
      // sessionId prop is exact on every navigation.)
      const currentId = props.currentId;
      const selected = currentId != null
        && (currentId === props.id || rawId(currentId) === rawId(props.id));
      if (selected) selectedTabs.set(props.id, true);
      else selectedTabs.delete(props.id);
      const t = props.t;
      // NOTE: deliberately NOT role="tab"/tablist — dsh-claude-style picks the
      // first [role=tablist] in the conversation to decide whether to hide the
      // composer (first tab unselected ⇒ composer display:none). Don't look
      // like a tablist to it.
      return h('div', {
        role: 'group', 'aria-label': 'session tabs',
        'data-active': selected ? 'true' : 'false',
        className: 'stb-tab',
        style: selected ? { ...TAB_STYLE, ...TAB_ACTIVE_STYLE } : TAB_STYLE,
        title: props.title || props.id,
        onClick: props.onOpen,
      },
        props.status ? h('span', { style: { ...DOT_BASE, ...STATUS_DOTS[props.status] } }) : null,
        h('span', { style: TITLE_STYLE }, props.title || props.id),
        h('button', {
          type: 'button', 'aria-label': t('closeTab'), className: 'stb-close',
          style: CLOSE_STYLE,
          onClick: (event) => { event.stopPropagation(); props.onClose(); },
        }, '×'),
      );
    }

    // Fallback titles for sessions the client's list state may not have yet
    // (e.g. tabs pointing at other workspaces): dsh-session-library caches a
    // snapshot of the sessions list state in localStorage. Read-only here.
    function libraryCachedTitle(id) {
      try {
        const raw = localStorage.getItem('dsh-session-library.active-cache.v1');
        if (!raw) return undefined;
        const body = JSON.parse(raw);
        if (!body || !body.byId) return undefined;
        const row = body.byId[id] || body.byId[rawId(id)] || null;
        return row && (row.title || row.displayTitle) || undefined;
      } catch {
        return undefined;
      }
    }

    function TabsStrip(props) {
      const t = props.t;
      const list = useTabList();
      const currentId = useCurrentSession();
      const enabledState = useEnabledState();
      const sessions = typeof props.useSessions === 'function'
        ? props.useSessions((state) => state)
        : null;
      const byId = sessions ? sessions.byId : {};
      const phase = sessions ? sessions.phase : 'pending';
      // Status sources — same hooks the session-library rows use.
      const statuses = typeof props.useSessionStatus === 'function'
        ? props.useSessionStatus((state) => state)
        : null;
      const errored = typeof props.useSessionErrors === 'function'
        ? props.useSessionErrors()
        : null;

      // Durable title first (what the sidebar rows show); displayTitle falls
      // back to the project basename, which is why chip labels used to
      // disagree with the sidebar (Q2). Captured titles cover pinned tabs the
      // list state has not projected; the library cache is the last resort.
      // List-state keys may carry either id form (bare uuids from older
      // snapshots, "session-<uuid>" elsewhere) — always try both.
      const rowOf = (id) => byId[id] || byId[rawId(id)];
      const titleOf = (id) => {
        const row = rowOf(id);
        if (row) {
          return row.title
            || (row.projectionValues && row.projectionValues.title)
            || row.displayTitle
            || knownTitles[id]
            || libraryCachedTitle(id)
            || undefined;
        }
        return knownTitles[id] || libraryCachedTitle(id) || undefined;
      };
      // Refresh captured titles from the live list state (renames propagate
      // once the session enters the active workspace's list).
      React.useEffect(() => {
        if (phase !== 'ready') return;
        const patch = {};
        for (const id of list) {
          const row = rowOf(id);
          if (!row) continue;
          const better = row.title
            || (row.projectionValues && row.projectionValues.title)
            || row.displayTitle;
          if (better && better !== knownTitles[id]) patch[id] = better;
        }
        rememberTitles(patch);
      }, [phase, list]);
      // Dot state, priority per session-library: error > attention > running
      // > done (completionUnread) > none.
      const statusOf = (id) => {
        if ((errored && errored.has && (errored.has(id) || errored.has(rawId(id))))) return 'error';
        const st = statuses && statuses.get ? (statuses.get(id) || statuses.get(rawId(id))) : null;
        if (st && st.pendingInteraction) return 'attention';
        if ((st && st.running) || (rowOf(id) && rowOf(id).running)) return 'running';
        if (st && st.completionUnread) return 'done';
        return null;
      };

      // Seed: with no stored tabs, make the current session the first tab.
      const seededRef = React.useRef(false);
      React.useEffect(() => {
        if (!enabledState.enabled) return;
        if (seededRef.current || phase !== 'ready' || list.length > 0) return;
        seededRef.current = true;
        const id = props.seedCurrent && props.seedCurrent();
        if (id) addTab(id, titleOf(id));
      }, [phase, list, enabledState.enabled]);

      // Browser semantics: the session open in the main view always gets a
      // tab (active highlight then always has a home). Skip the session whose
      // tab was just closed, or closing the last tab would resurrect it
      // before the neighbor switch lands.
      // Browser semantics: navigating the main view to a session that has no
      // tab adds one. Fires on TRANSITIONS of the current session only — a
      // mere state re-render must not resurrect a tab the user just closed
      // (observed: closing the active tab re-added it after the 1200 ms
      // guard expired while a cross-workspace neighbour switch was still in
      // flight, so the tab could never be dismissed).
      const lastSeenRef = React.useRef(null);
      React.useEffect(() => {
        if (!enabledState.enabled) return;
        if (phase !== 'ready') return;
        const id = currentSessionId;
        const previous = lastSeenRef.current;
        lastSeenRef.current = id;
        if (!id || id === previous) return;
        if (list.includes(id)) return;
        addTab(id, titleOf(id));
      }, [phase, list, currentSessionId, enabledState.enabled]);

      // Prune tabs whose session no longer exists — but only after the list
      // has been ready for a grace period AND the id is still missing on a
      // second look: the first 'ready' snapshot can carry an incomplete byId
      // (observed: 8 stored tabs pruned to 1 within ~500 ms of load).
      const pruneTimerRef = React.useRef(null);
      React.useEffect(() => {
        if (phase !== 'ready') return;
        if (pruneTimerRef.current) return;
        pruneTimerRef.current = setTimeout(() => {
          pruneTimerRef.current = null;
          const current = tabs;
          // The client list state only covers the active workspace's sessions;
          // tabs added from the (global) session-library may legitimately point
          // outside it. A tab is dead only when neither the list state, our
          // captured titles, nor the library's cached snapshot knows the id.
          setTabs(current.filter((id) => rowOf(id) || knownTitles[id] || libraryCachedTitle(id) !== undefined));
        }, 3000);
        return () => { clearTimeout(pruneTimerRef.current); pruneTimerRef.current = null; };
      }, [phase]);
      // Drop selection markers of tabs that are gone.
      React.useEffect(() => {
        for (const id of Array.from(selectedTabs.keys())) {
          if (!list.includes(id)) selectedTabs.delete(id);
        }
      }, [list]);

      const openSession = props.openSession;
      const closeTab = (id) => {
        const index = list.indexOf(id);
        const next = list.filter((tab) => tab !== id);
        setTabs(next);
        if (openSession && selectedTabs.get(id)) {
          const neighbor = next[index] || next[index - 1];
          if (neighbor) openSession(neighbor);
        }
      };

      if (!enabledState.enabled) return null;
      if (list.length === 0) return null;
      return h(React.Fragment, null,
        // In-flow: grows the header's first grid row to make room for the strip.
        h('div', { style: SPACER_STYLE, 'aria-hidden': true }),
        // Absolute: the tray itself, centered in the extra band under the title.
        h('div', { style: ANCHOR_STYLE },
          h('div', { style: TRAY_STYLE, className: 'stb-tray', role: 'group', 'aria-label': 'session tabs' },
            list.map((id) => h(TabItem, {
              key: id,
              id,
              title: titleOf(id),
              status: statusOf(id),
              currentId,
              t,
              onOpen: () => openSession && openSession(id),
              onClose: () => closeTab(id),
            })),
          ),
        ),
      );
    }

    const MENU_ITEM_STYLE = {
      display: 'block', width: '100%', padding: '6px 10px', margin: 0,
      border: 'none', background: 'transparent', color: 'inherit',
      font: 'inherit', fontSize: '13px', textAlign: 'left', cursor: 'pointer',
    };
    const ROW_ACTION_STYLE = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '24px', height: '24px', padding: 0, borderRadius: '6px',
      border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer',
    };

    function MenuItem(props) {
      const [, setMenuOpen] = props.useMenuOpenState();
      const { enabled } = useEnabledState();
      if (!enabled) return null;
      return h('button', {
        type: 'button', role: 'menuitem', style: MENU_ITEM_STYLE,
        onClick: () => { setMenuOpen(false); props.addTab(props.sessionId, props.displayTitle); },
      }, props.t('openInTabs'));
    }

    function RowAction(props) {
      const { enabled } = useEnabledState();
      if (!enabled) return null;
      return h('button', {
        type: 'button', title: props.t('openInTabs'), 'aria-label': props.t('openInTabs'),
        style: ROW_ACTION_STYLE,
        onClick: () => props.addTab(props.sessionId, props.displayTitle),
      }, h('svg', { width: 14, height: 14, viewBox: '0 0 64 64', 'aria-hidden': true },
        h('path', {
          d: 'M8 18 a6 6 0 0 1 6-6 h14 a4 4 0 0 1 4 4 v4 h24 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-42 a6 6 0 0 1 -6 -6 z',
          fill: 'currentColor', opacity: 0.8,
        }),
      ));
    }

    // ---- settings card -------------------------------------------------------
    // Rendered on the bundle's own page in Settings → Plugins
    // (slot `plugins.bundle.config`, keyed by the package name).
    const CARD_STYLE = { padding: '4px 0' };
    const CARD_ROW_STYLE = {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', padding: '10px 0',
    };
    const CARD_TEXT_STYLE = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 };
    const CARD_TITLE_STYLE = { fontSize: '14px', fontWeight: 500, color: 'var(--dsw-alias-label-primary, inherit)' };
    const CARD_HINT_STYLE = { fontSize: '12px', color: 'var(--dsw-alias-label-secondary, inherit)' };
    let SwitchComponent = null;
    let SettingsFormComponent = null;
    let SettingsFormModelClass = null;
    try {
      const primitives = require('@deepseek-ai/dsh-client-ui-primitives');
      SwitchComponent = primitives.Switch;
      SettingsFormComponent = primitives.SettingsForm;
      SettingsFormModelClass = primitives.SettingsFormModel;
    } catch { /* card falls back to a plain hint */ }

    // The official staged-settings pattern (as used by dsh-rewind-plugin):
    // a SettingsFormModel over the configForms controller stages edits locally;
    // its save() funnels through controller.mutate to the Host. The inject
    // puts the store under `hooks` (selector hook) and spreads actions() —
    // plain function props must NOT be top-level members of inject, which
    // would get hook-wrapped.
    function buildSettingsModel(controller) {
      if (!SettingsFormModelClass || !controller) return null;
      try {
        const model = new SettingsFormModelClass(controller, [{
          field: 'enabled',
          format: (value) => String(value !== false),
          parse: (text) => ({ kind: 'set', value: text === 'true' }),
        }]);
        const store = model.bind(() => ({ ...model.shell(), enabled: model.field('enabled') }));
        return { model, store };
      } catch (error) {
        console.warn('[session-tabs] settings model build failed', error);
        return null;
      }
    }

    function formLabels(t) {
      return {
        unavailable: t('settings.unavailable'),
        readOnly: t('settings.readonly'),
        saveFailed: t('settings.saveFailed'),
        save: t('settings.save'),
        saving: t('settings.saving'),
      };
    }

    function SettingsCard(props) {
      if (props.view === 'summary') return null;
      const t = props.t;
      if (!props.useSettingsCard || !props.edit || !SettingsFormComponent) {
        return h('div', { style: CARD_STYLE },
          h('div', { style: CARD_HINT_STYLE }, t('settings.unavailable')));
      }
      const state = props.useSettingsCard((snapshot) => snapshot);
      const enabled = state.enabled ? state.enabled.text === 'true' : true;
      return h(SettingsFormComponent, {
        labels: formLabels(t),
        state,
        onSave: props.save,
        onDiscard: props.discard,
      },
        h('div', { style: CARD_ROW_STYLE },
          h('div', { style: CARD_TEXT_STYLE },
            h('div', { style: CARD_TITLE_STYLE }, t('settings.toggle')),
            h('div', { style: CARD_HINT_STYLE }, t(enabled ? 'settings.on' : 'settings.off')),
          ),
          h(SwitchComponent, {
            checked: enabled,
            label: t('settings.toggle'),
            disabled: !state.writable || state.saving,
            onChange: (next) => props.edit('enabled', String(next)),
          }),
        ),
      );
    }

    // ---- client plugin body -------------------------------------------------
    return {
      inject: ['slots', 'uiWorkspace', 'locale', 'sessions', 'workspaces', 'configForms'],
      apply(ctx) {
        ensureStyles();
        ctx.effect(() => ctx.locale.register(NS, DICT), 'session-tabs: dictionaries');

        // Settings toggle: mirror the Host row's `enabled` config field into
        // the module store. The form comes from the shared configForms service
        // (provided by the settings domain, hence the inject above).
        let configForm = null;
        try {
          configForm = ctx.configForms ? ctx.configForms.get(ENTRY_ID) : null;
        } catch (error) {
          console.warn('[session-tabs] config form unavailable', error);
        }
        const settingsModel = buildSettingsModel(configForm);
        if (settingsModel) {
          ctx.effect(() => () => {
            try { settingsModel.model.dispose(); } catch { /* already gone */ }
          }, 'session-tabs: settings model');
        }
        if (configForm) {
          ctx.effect(() => {
            const sync = () => {
              try {
                const snap = configForm.getSnapshot();
                if (snap.status === 'ready') {
                  setEnabledState({ enabled: Boolean(snap.value && snap.value.enabled !== false), writable: snap.writable !== false });
                } else if (snap.status === 'unavailable') {
                  setEnabledState({ writable: false });
                }
              } catch { /* keep the last known value */ }
            };
            sync();
            return configForm.subscribe(sync);
          }, 'session-tabs: config form');
        }

        // The session controller only knows sessions of connected workspaces;
        // tabs pinned from the global session-library may point elsewhere.
        // Fallback: locate the owning workspace via the registry snapshot,
        // connect it (openWorkspace), then retry the specific session.
        const openSession = (id) => {
          try {
            ctx.uiWorkspace.openSession(id);
            return;
          } catch (firstError) {
            try {
              const items = ctx.workspaces.getSnapshot().items || [];
              const owner = items.find((ws) => ws.sessionIds
                && (ws.sessionIds.includes(id) || ws.sessionIds.includes(rawId(id))));
              if (!owner) throw firstError;
              Promise.resolve(ctx.uiWorkspace.openWorkspace(owner.workspaceId))
                .catch((error) => console.warn('[session-tabs] openWorkspace failed', error))
                .then(() => { ctx.uiWorkspace.openSession(id); });
            } catch (error) {
              console.warn('[session-tabs] openSession failed', error);
            }
          }
        };

        // One-shot: resolve the session currently held by the main view.
        // Same pattern the shipped UI uses (retainInfo(...).getSnapshot()).
        const seedCurrent = () => {
          try {
            const state = ctx.sessions.list.getSnapshot();
            const ids = (state && state.ids ? Array.from(state.ids) : [])
              .slice()
              .sort((a, b) => {
                const sa = state.byId[a] || {};
                const sb = state.byId[b] || {};
                return (sb.updatedAt || 0) - (sa.updatedAt || 0);
              });
            for (const id of ids.slice(0, MAX_TABS)) {
              const info = ctx.sessions.retainInfo(id).getSnapshot();
              if (info && info.retainedBy && info.retainedBy.mainView > 0) return id;
            }
            return ids[0];
          } catch (error) {
            console.warn('[session-tabs] seedCurrent failed', error);
            return undefined;
          }
        };

        // 1) Slim tab strip on its own row: conversation.header.leading is the
        //    empty leftmost cell of the header grid (root scope — no session
        //    hooks here; selection is read per-tab via explicit-id retain).
        ctx.slots.inject('conversation.header.leading', () => ctx.slots.register({
          name: 'conversation.header.leading',
          id: 'session-tabs.strip',
          locale: NS,
          inject: () => ({ openSession, seedCurrent }),
        }, TabsStrip));

        // 1b) Invisible tracker in a session-scoped slot: its standard props
        //     carry the live `sessionId`; it publishes the current session to
        //     the module store so the strip can auto-tab the open session.
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'session-tabs.tracker',
          order: 900,
          inject: () => ({}),
        }, SessionTracker));

        // 2) "..." menu entry on every session row (works on touch devices too).
        ctx.slots.inject('sidebar.workspaces.session.menu.item', () => ctx.slots.register({
          name: 'sidebar.workspaces.session.menu.item',
          id: 'session-tabs.add',
          order: 500,
          locale: NS,
          inject: () => ({ addTab }),
        }, MenuItem));

        // 3) Hover button at the end of every session row.
        ctx.slots.inject('sidebar.workspaces.session.row.action', () => ctx.slots.register({
          name: 'sidebar.workspaces.session.row.action',
          id: 'session-tabs.add',
          order: 300,
          locale: NS,
          inject: () => ({ addTab }),
        }, RowAction));

        // 4) Settings → Plugins → this bundle: the master switch card
        //    (keyed by the package name; `view: 'summary'` renders null).
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: '@local/session-tabs',
          id: 'session-tabs.settings',
          locale: NS,
          inject: settingsModel
            ? () => ({ hooks: { settingsCard: settingsModel.store }, ...settingsModel.model.actions() })
            : () => ({}),
        }, SettingsCard));
      },
    };
  },
});
