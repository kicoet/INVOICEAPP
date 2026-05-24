// Inline SVG icon set — single-tone, stroke 1.5, modern industrial
const Icon = ({ name, size = 16, className = '' }) => {
  const s = size;
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" {...stroke}/><rect x="14" y="3" width="7" height="5" {...stroke}/><rect x="14" y="12" width="7" height="9" {...stroke}/><rect x="3" y="16" width="7" height="5" {...stroke}/></>,
    invoice: <><path d="M5 3h11l3 3v15l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L5 21V3z" {...stroke}/><path d="M8 9h8M8 13h8M8 17h5" {...stroke}/></>,
    box: <><path d="M3 7l9-4 9 4-9 4-9-4z" {...stroke}/><path d="M3 7v10l9 4 9-4V7" {...stroke}/><path d="M12 11v10" {...stroke}/></>,
    stock: <><rect x="3" y="8" width="18" height="13" {...stroke}/><path d="M7 8V5a2 2 0 012-2h6a2 2 0 012 2v3" {...stroke}/><path d="M9 13h6M9 17h4" {...stroke}/></>,
    tasks: <><rect x="3" y="3" width="18" height="18" rx="2" {...stroke}/><path d="M8 11l3 3 5-6" {...stroke}/></>,
    user: <><circle cx="12" cy="8" r="4" {...stroke}/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...stroke}/></>,
    bell: <><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" {...stroke}/><path d="M10 19a2 2 0 004 0" {...stroke}/></>,
    settings: <><circle cx="12" cy="12" r="3" {...stroke}/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...stroke}/></>,
    plus: <><path d="M12 5v14M5 12h14" {...stroke}/></>,
    search: <><circle cx="11" cy="11" r="7" {...stroke}/><path d="M21 21l-4.3-4.3" {...stroke}/></>,
    chevron: <><path d="M9 6l6 6-6 6" {...stroke}/></>,
    arrowUp: <><path d="M7 14l5-5 5 5" {...stroke}/></>,
    arrowDown: <><path d="M7 10l5 5 5-5" {...stroke}/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5" {...stroke}/><path d="M5 21h14" {...stroke}/></>,
    share: <><circle cx="6" cy="12" r="3" {...stroke}/><circle cx="18" cy="6" r="3" {...stroke}/><circle cx="18" cy="18" r="3" {...stroke}/><path d="M8.5 10.5l7-3M8.5 13.5l7 3" {...stroke}/></>,
    edit: <><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" {...stroke}/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...stroke}/></>,
    close: <><path d="M6 6l12 12M18 6L6 18" {...stroke}/></>,
    check: <><path d="M5 12l5 5 9-11" {...stroke}/></>,
    image: <><rect x="3" y="5" width="18" height="14" {...stroke}/><circle cx="9" cy="10" r="2" {...stroke}/><path d="M3 17l5-5 4 4 3-3 6 6" {...stroke}/></>,
    chart: <><path d="M3 21V5M3 21h18" {...stroke}/><path d="M7 17V11M11 17V8M15 17V13M19 17V6" {...stroke}/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...stroke}/><circle cx="12" cy="12" r="3" {...stroke}/></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" {...stroke}/></>,
    upload: <><path d="M12 15V3M7 8l5-5 5 5" {...stroke}/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" {...stroke}/></>,
    pen: <><path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" {...stroke}/><path d="M14 6l4 4" {...stroke}/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="1" {...stroke}/><path d="M3 9h18M8 3v4M16 3v4" {...stroke}/></>,
    sparkle: <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" {...stroke}/></>,
    money: <><rect x="2" y="6" width="20" height="12" rx="1" {...stroke}/><circle cx="12" cy="12" r="3" {...stroke}/><path d="M5 6v12M19 6v12" {...stroke}/></>,
    dot: <><circle cx="12" cy="12" r="3" fill="currentColor"/></>,
    logo: <><path d="M4 4l16 16M20 4L4 20" {...stroke}/></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" {...stroke}/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" {...stroke}/></>,
  };
  return (
    <svg className={className} width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">{paths[name] || null}</svg>
  );
};

window.Icon = Icon;
