// Reusable chart primitives — drawn with SVG for design control
const { useMemo } = React;

function AreaChart({ data, height = 200, format = (v)=>v, accentVar = 'var(--accent)' }) {
  const w = 760, h = height, padL = 36, padR = 16, padT = 14, padB = 24;
  const max = Math.max(...data.map(d=>d.v)) * 1.1;
  const min = 0;
  const sx = i => padL + (i*(w-padL-padR))/(data.length-1);
  const sy = v => padT + (h-padT-padB) - ((v-min)/(max-min))*(h-padT-padB);
  const path = data.map((d,i)=> (i===0?'M':'L') + sx(i) + ' ' + sy(d.v)).join(' ');
  const area = path + ` L ${sx(data.length-1)} ${h-padB} L ${sx(0)} ${h-padB} Z`;
  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accentVar} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={accentVar} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {Array.from({length:ticks}).map((_,i) => {
        const v = max - (max/ticks)*i;
        const y = sy(v);
        return (
          <g key={i}>
            <line x1={padL} x2={w-padR} y1={y} y2={y} stroke="var(--line)" strokeDasharray="2 4"/>
            <text x={padL-6} y={y+3} textAnchor="end" fontSize="9" fill="var(--ink-dim)" fontFamily="Geist Mono">{(v/1_000_000).toFixed(0)}M</text>
          </g>
        );
      })}
      <path d={area} fill="url(#area-grad)"/>
      <path d={path} fill="none" stroke={accentVar} strokeWidth="1.5"/>
      {data.map((d,i)=> i%5===0 || i===data.length-1 ? (
        <text key={i} x={sx(i)} y={h-6} fontSize="9" fill="var(--ink-dim)" textAnchor="middle" fontFamily="Geist Mono">{d.d.slice(5)}</text>
      ) : null)}
      {data.map((d,i)=> (
        <circle key={i} cx={sx(i)} cy={sy(d.v)} r={i===data.length-1?3:0} fill={accentVar}/>
      ))}
    </svg>
  );
}

function BarChart({ data, height = 200, accentVar = 'var(--accent)' }) {
  const w = 760, h = height, padL = 100, padR = 24, padT = 8, padB = 8;
  const max = Math.max(...data.map(d=>d.omzet)) * 1.1;
  const bw = (h-padT-padB)/data.length - 14;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {data.map((d,i) => {
        const y = padT + i*((h-padT-padB)/data.length) + 6;
        const wv = (d.omzet/max)*(w-padL-padR);
        return (
          <g key={i}>
            <text x={padL-12} y={y+bw/2+4} fontSize="11" textAnchor="end" fill="var(--ink-mute)">{d.kategori}</text>
            <rect x={padL} y={y} width={w-padL-padR} height={bw} fill="var(--bg-inset)" rx="2"/>
            <rect x={padL} y={y} width={wv} height={bw} fill={accentVar} rx="2"/>
            <text x={padL+wv-8} y={y+bw/2+4} fontSize="10" textAnchor="end" fill="var(--accent-ink)" fontFamily="Geist Mono">{(d.omzet/1_000_000).toFixed(1)}M</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ data, size = 180, accentVar = 'var(--accent)' }) {
  const total = data.reduce((s,d)=>s+d.omzet, 0);
  const r = 64, cx = size/2, cy = size/2, sw = 22;
  let acc = 0;
  const palette = ['var(--accent)','var(--info)','var(--positive)','var(--warn)'];
  const arcs = data.map((d,i) => {
    const frac = d.omzet/total;
    const start = acc * 2*Math.PI - Math.PI/2;
    acc += frac;
    const end = acc * 2*Math.PI - Math.PI/2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end),   y2 = cy + r*Math.sin(end);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    return <path key={i} d={path} fill="none" stroke={palette[i%palette.length]} strokeWidth={sw} strokeLinecap="butt"/>;
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-inset)" strokeWidth={sw}/>
      {arcs}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="11" fill="var(--ink-mute)" letterSpacing="0.1em">TOTAL</text>
      <text x={cx} y={cy+18} textAnchor="middle" fontSize="20" fill="var(--ink)" fontFamily="Instrument Serif">{(total/1_000_000).toFixed(1)}M</text>
    </svg>
  );
}

function Sparkline({ values, w=80, h=24, color='var(--accent)' }) {
  const max = Math.max(...values), min = Math.min(...values);
  const sx = i => (i*w)/(values.length-1);
  const sy = v => h - ((v-min)/(max-min||1))*h;
  const path = values.map((v,i)=> (i===0?'M':'L') + sx(i) + ' ' + sy(v)).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

window.AreaChart = AreaChart;
window.BarChart = BarChart;
window.Donut = Donut;
window.Sparkline = Sparkline;
