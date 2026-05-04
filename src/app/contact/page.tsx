import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | ZNAS",
  description: "Get in touch with ZNAS.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
