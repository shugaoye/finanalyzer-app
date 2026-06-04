import { Outlet } from "@tanstack/react-router";
import { AppLayout } from "./layout";

console.log("=== ROOTCOMPONENT.TSX FILE LOADED ===");

function RootComponent() {
  console.log("=== ROOTCOMPONENT RENDERING ===");
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default RootComponent;