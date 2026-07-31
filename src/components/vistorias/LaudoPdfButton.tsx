import { useState } from "react"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useConfiguracoes } from "@/hooks/useConfiguracoes"
import { useChecklistResposta } from "@/hooks/useChecklistRespostas"
import type { OrdemVistoria } from "@/hooks/useVistorias"
import type { ChecklistTemplate } from "@/hooks/useChecklistTemplates"
import type { ChecklistResposta } from "@/hooks/useChecklistRespostas"
import { tipoVistoriaLabel } from "@/hooks/useVistorias"

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 6, borderBottom: "1 solid #ccc", paddingBottom: 2 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 110, color: "#555" },
  value: { flex: 1 },
  item: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: "1 solid #eee" },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#999", textAlign: "center" },
})

interface LaudoDocProps {
  ordem: OrdemVistoria
  template: ChecklistTemplate
  resposta: ChecklistResposta
  empresaNome: string
}

function LaudoDocument({ ordem, template, resposta, empresaNome }: LaudoDocProps) {
  const itens = [...template.itens].sort((a, b) => a.ordem - b.ordem)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{empresaNome}</Text>
        <Text style={styles.subtitle}>Laudo de Vistoria — {tipoVistoriaLabel[ordem.tipo_vistoria]}</Text>

        <View style={styles.row}><Text style={styles.label}>Protocolo:</Text><Text style={styles.value}>{ordem.numero_protocolo}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text style={styles.value}>{ordem.clientes?.nome || "—"}</Text></View>
        <View style={styles.row}>
          <Text style={styles.label}>Veículo:</Text>
          <Text style={styles.value}>
            {[ordem.veiculos?.placa, ordem.veiculos?.marca, ordem.veiculos?.modelo].filter(Boolean).join(" - ") || "—"}
          </Text>
        </View>
        <View style={styles.row}><Text style={styles.label}>Data:</Text><Text style={styles.value}>{new Date(resposta.concluido_em || Date.now()).toLocaleString('pt-BR')}</Text></View>

        <Text style={styles.sectionTitle}>Itens do Checklist</Text>
        {itens.map((item) => {
          const r = resposta.respostas[item.id]
          const fotos = r?.fotos?.length || 0
          return (
            <View key={item.id} style={styles.item}>
              <Text>{item.label}</Text>
              <Text>{String(r?.valor ?? "—")}{fotos > 0 ? ` (${fotos} foto(s))` : ""}</Text>
            </View>
          )
        })}

        <Text style={styles.footer}>
          Laudo gerado eletronicamente pelo TGestVistoria em {new Date().toLocaleString('pt-BR')}
        </Text>
      </Page>
    </Document>
  )
}

interface LaudoPdfButtonProps {
  ordem: OrdemVistoria
  template: ChecklistTemplate
  resposta: ChecklistResposta
}

export function LaudoPdfButton({ ordem, template, resposta }: LaudoPdfButtonProps) {
  const { configuracoes } = useConfiguracoes()
  const { salvarLaudoPdf } = useChecklistResposta(ordem.id, template.id)
  const [generating, setGenerating] = useState(false)

  const handleGerar = async () => {
    setGenerating(true)
    try {
      const empresaNome = configuracoes?.nome_empresa || "TGestVistoria"
      const blob = await pdf(
        <LaudoDocument ordem={ordem} template={template} resposta={resposta} empresaNome={empresaNome} />
      ).toBlob()

      const fileName = `laudo-${ordem.numero_protocolo}.pdf`
      const path = `${ordem.empresa_id}/${ordem.id}/${fileName}`
      const { error } = await supabase.storage.from('laudos-pdf').upload(path, blob, {
        upsert: true,
        contentType: 'application/pdf',
      })
      if (!error) {
        await salvarLaudoPdf(path)
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button onClick={handleGerar} disabled={generating} variant="secondary">
      <FileDown className="h-4 w-4 mr-2" />
      {generating ? "Gerando..." : "Gerar Laudo em PDF"}
    </Button>
  )
}
