import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function MeritTrendChart({ data = [], height = 220 }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => setReduceMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false), []);
  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Historical closing merit trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: -14 }}>
          <CartesianGrid stroke="#382D40" strokeOpacity={0.7} vertical={false} strokeDasharray="2 5" />
          <XAxis dataKey="year" tick={{ fill: '#8A7D93', fontFamily: 'IBM Plex Mono', fontSize: 11 }} axisLine={{ stroke: '#382D40' }} tickLine={{ stroke: '#382D40' }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#8A7D93', fontFamily: 'IBM Plex Mono', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={{ background: '#2A2130', border: '1px solid #382D40', borderRadius: 4, color: '#F3EAD8', fontFamily: 'IBM Plex Mono', fontSize: 12 }} formatter={(value) => [`${value}%`, 'Closing merit']} />
          <Line type="monotone" dataKey="value" stroke="#B3502E" strokeWidth={3} dot={{ fill: '#D9A43B', stroke: '#1E1720', strokeWidth: 2, r: 4 }} activeDot={{ r: 5 }} isAnimationActive={!reduceMotion} animationDuration={680} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
