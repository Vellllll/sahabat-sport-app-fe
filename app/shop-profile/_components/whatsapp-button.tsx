// app/shop-profile/_components/whatsapp-button.tsx
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react"; // Ikon yang mirip WhatsApp
import { formatWhatsAppNumber } from "../api";

interface WhatsAppButtonProps {
  phone: string;
  shopName: string;
}

export function WhatsAppButton({ phone, shopName }: WhatsAppButtonProps) {
  const cleanPhone = formatWhatsAppNumber(phone);
  const message = encodeURIComponent(`Halo ${shopName}, saya ingin bertanya tentang produk Anda.`);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <Button 
      asChild
      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md py-6 text-base rounded-xl border-none"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
        <MessageCircle className="w-5 h-5 fill-current" />
        Hubungi via WhatsApp
      </a>
    </Button>
  );
}