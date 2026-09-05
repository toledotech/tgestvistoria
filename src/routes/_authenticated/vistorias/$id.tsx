import { createFileRoute } from "@tanstack/react-router";
import VistoriaDetalhe from "@/pages/VistoriaDetalhe";

export const Route = createFileRoute("/_authenticated/vistorias/$id")({
  component: VistoriaDetalhe,
});
