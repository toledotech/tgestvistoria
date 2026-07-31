// Edge Function: cria uma cobrança (Pix/cartão) no Mercado Pago para uma
// ordem de vistoria e grava o registro em `pagamentos`.
//
// Requer a env var MERCADOPAGO_ACCESS_TOKEN (credencial de sandbox durante
// os testes, de produção depois de validado).

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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user) throw new Error("Usuário não autenticado");

    const { ordemVistoriaId } = await req.json();
    if (!ordemVistoriaId) throw new Error("ordemVistoriaId é obrigatório");

    const { data: ordem, error: ordemError } = await supabaseClient
      .from("ordens_vistoria")
      .select("id, empresa_id, numero_protocolo, valor, tipo_vistoria")
      .eq("id", ordemVistoriaId)
      .single();

    if (ordemError || !ordem) throw new Error("Ordem de vistoria não encontrada");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");

    const origin = req.headers.get("origin") || "";
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: `Vistoria ${ordem.numero_protocolo || ordem.id}`,
            quantity: 1,
            unit_price: Number(ordem.valor),
            currency_id: "BRL",
          },
        ],
        external_reference: ordem.id,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
        back_urls: {
          success: `${origin}/vistorias/${ordem.id}`,
          pending: `${origin}/vistorias/${ordem.id}`,
          failure: `${origin}/vistorias/${ordem.id}`,
        },
        auto_return: "approved",
      }),
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      throw new Error(`Mercado Pago: ${errText}`);
    }

    const preference = await mpResponse.json();

    const { data: pagamento, error: pagamentoError } = await supabaseClient
      .from("pagamentos")
      .insert([{
        ordem_vistoria_id: ordem.id,
        gateway: "mercadopago",
        gateway_payment_id: preference.id,
        status: "pending",
        link_pagamento: preference.init_point,
        valor: ordem.valor,
      }])
      .select()
      .single();

    if (pagamentoError) throw pagamentoError;

    return new Response(JSON.stringify({ pagamento, init_point: preference.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
