import { ComingSoon } from "@/components/admin/ComingSoon";
import { IconWhatsapp } from "@/components/admin/icons";

export default function WhatsappPage() {
  return (
    <ComingSoon
      icon={IconWhatsapp}
      title="WhatsApp"
      description="Lista de clientes cadastrados e envio automático de promoções direto pelo WhatsApp."
    />
  );
}