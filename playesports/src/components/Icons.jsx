const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Home = () => <svg {...p}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
export const Cal = () => <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
export const Bell = () => <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/></svg>
export const Heart = () => <svg {...p}><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>
export const User = () => <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
export const Back = () => <svg {...p}><path d="M15 5l-7 7 7 7"/></svg>
export const Pin = () => <svg {...p} width="16" height="16"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
export const Clock = () => <svg {...p} width="16" height="16"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
export const Phone = () => <svg {...p} width="16" height="16"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
export const Search = () => <svg {...p} width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>
export const Mail = () => <svg {...p} width="20" height="20"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
export const Ball = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M50 4l38 12v34c0 24-18 38-38 46C30 88 12 74 12 50V16z" fill="#337551"/><path d="M50 10l32 10v30c0 20-15 32-32 40C33 82 18 70 18 50V20z" fill="#1e1e1e"/><circle cx="50" cy="44" r="23" fill="#fff"/><path d="M50 32l9 6-3 11H44l-3-11z" fill="#1e1e1e"/><path d="M50 21v11M59 38l11-4M56 49l7 9M44 49l-7 9M41 38l-11-4" stroke="#1e1e1e" strokeWidth="2.5"/></svg>
)
