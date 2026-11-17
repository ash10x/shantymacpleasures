import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | ShantyMac Pleasures", description: "How ShantyMac Pleasures handles customer information." };

export default function PrivacyPage() {
  return <main className="mx-auto max-w-4xl px-6 py-32"><h1 className="text-4xl font-semibold">Privacy Policy</h1><p className="mt-3 text-sm text-black/60">Last reviewed: November 17, 2026. This draft describes the information visible from the current website implementation. Please confirm the marked business decisions before publication as final legal terms.</p>
    <div className="mt-10 space-y-8 leading-7 text-black/75">
      <section><h2 className="text-xl font-semibold text-black">Information we collect</h2><p>When you contact us or place an order, the site may collect your name, email address, delivery address, city, message, selected products, quantities, and order details. The site stores product and order records in its database. Do not send payment card details through contact forms.</p></section>
      <section><h2 className="text-xl font-semibold text-black">How information is used</h2><p>Information is used to respond to inquiries, process and fulfill order requests, communicate about orders, prevent misuse, and maintain business records. Marketing messages should only be sent with your consent. The current website does not provide a functioning newsletter subscription.</p></section>
      <section><h2 className="text-xl font-semibold text-black">Payments and service providers</h2><p>The current codebase does not integrate a payment processor. If online payments are enabled later, the processor and its privacy terms must be identified here. The site uses database hosting and may use an SMTP provider to deliver contact messages. Confirm provider names and locations before publication.</p></section>
      <section><h2 className="text-xl font-semibold text-black">Cookies, analytics, and retention</h2><p>The shopping cart is saved in your browser storage. No analytics provider was identified in the project code reviewed. Order and message retention periods are not configured in the application and must be set by the business.</p></section>
      <section><h2 className="text-xl font-semibold text-black">Security and your choices</h2><p>Reasonable technical controls are used, but no online service can guarantee absolute security. You may contact us to request access to or correction/deletion of personal information, subject to records we must retain and applicable Jamaican data protection requirements. The business should confirm its procedures and applicable rights with Jamaican counsel.</p></section>
      <section><h2 className="text-xl font-semibold text-black">Marketing and contact</h2><p>You may ask to stop marketing communications at any time. For privacy questions, contact <a className="underline" href="mailto:shantymacpleasures@yahoo.com">shantymacpleasures@yahoo.com</a> or +1 876 312 1862, Montego Bay, Jamaica.</p></section>
    </div>
  </main>;
}
