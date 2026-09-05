import { createFileRoute } from "@tanstack/react-router";
import Vistorias from "@/pages/Vistorias";

export const Route = createFileRoute("/_authenticated/vistorias/")({
  component: Vistorias,
});
