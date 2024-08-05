import Logo from "./Logo";

import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <header
        style={{ display: "flex", alignItems: "center", padding: "10px" }}
      >
        {/* <Logo /> */}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
