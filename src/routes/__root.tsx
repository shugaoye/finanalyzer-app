import { createRootRoute } from "@tanstack/react-router";
import NotFoundComponent from "../components/NotFoundComponent";
import RootComponent from "../components/RootComponent";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
