import { NavLink } from 'react-router-dom';

export function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/remote-1">remote-1</NavLink>
      <NavLink to="/remote-2">remote-2</NavLink>
      <NavLink to="/remote-3">remote-3</NavLink>
    </nav>
  );
}
