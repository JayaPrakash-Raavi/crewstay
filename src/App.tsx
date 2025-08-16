import { Outlet } from "react-router-dom";
export default function App() {
  // We use Shell for authenticated routes; App remains simple.
  return <Outlet />;
}
