import { Outlet } from "react-router-dom";
import SiteFooter from "./SiteFooter";

/**
 * Közös oldalváz: tartalom + alul a lábléc minden útvonalon.
 */
export default function PageShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
