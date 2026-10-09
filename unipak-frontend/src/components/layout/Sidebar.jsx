import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Test Breakdown', path: '/test-breakdowns' },
  { label: 'Prediction', path: '/prediction' },
  { label: 'Saved Items', path: '/saved' },
  { label: 'AI Assistant', path: '/ai' },
  { label: 'Settings', path: '/settings' },
];

// The same destinations, presented as a compact desktop navigation row.
export default function Sidebar() {
  return (
    <nav className="hidden items-center lg:flex" aria-label="Primary navigation">
      {navItems.map(item => <NavLink key={item.path} to={item.path} className="nav-link">{item.label}</NavLink>)}
    </nav>
  );
}
