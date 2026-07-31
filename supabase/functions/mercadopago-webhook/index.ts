// Edge Function pública (sem auth de usuário): recebe notificações do
// Mercado Pago, consulta o pagamento real na API deles e atualiza
// `pagamentos` + `ordens_vistoria.status_pagamento`. Roda com service role
// para poder escrever direto, ignorando RLS (não há usuário logado aqui).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");

    if (topic !== "payment" || !paymentId) {
      return new Response(JSON.stringify({ ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpResponse.ok) throw new Error("Falha ao consultar pagamento no Mercado Pago");

    const payment = await mpResponse.json();
    const ordemVistoriaId = payment.external_reference;
    const status = payment.status; // approved | pending | rejected | ...
    const metodo = payment.payment_type_id === "pix" ? "pix" : "cartao";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("pagamentos")
      .update({ status, metodo, gateway_payment_id: String(payment.id) })
      .eq("ordem_vistoria_id", ordemVistoriaId);

    if (status === "approved") {
      await supabaseAdmin
        .from("ordens_vistoria")
        .update({ status_pagamento: "pago" })
        .eq("id", ordemVistoriaId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
