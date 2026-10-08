import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function MeritTrendChart({ data = [], height = 220, series, label = 'Historical closing merit trend chart' }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => setReduceMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false), []);
  return (
    <div style={{ height }} className="w-full" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: -14 }}>
          <CartesianGrid stroke="var(--app-border)" strokeOpacity={0.7} vertical={false} strokeDasharray="2 5" />
          <XAxis dataKey="year" tick={{ fill: 'var(--app-muted)', fontFamily: 'Arial', fontSize: 11 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={{ stroke: 'var(--app-border)' }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'var(--app-muted)', fontFamily: 'Arial', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 12, color: 'var(--app-foreground)', fontFamily: 'Arial', fontSize: 12 }} formatter={(value, name) => [`${value}%`, series ? name : 'Closing merit']} />
          {series && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {(series || [{ key: 'value', name: 'Closing merit' }]).map((item, i) => <Line key={item.key} name={item.name} type="monotone" dataKey={item.key} stroke="var(--app-foreground)" strokeDasharray={['', '7 4', '2 4'][i % 3]} strokeWidth={3} dot={{ fill: 'var(--app-surface)', stroke: 'var(--app-foreground)', strokeWidth: 2, r: 4 + i % 3 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={680} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
