import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a href={whatsappLink({})} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-xl shadow-black/25 transition hover:scale-110">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.200zm4.5-6.1c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.200-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.2.300-.9.900-.9 2.200s.9 2.500 1.100 2.700c.1.200 1.800 2.800 4.400 3.900 1.600.7 2.200.7 3 .6.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3z" />
      </svg>
    </a>
  );
}
