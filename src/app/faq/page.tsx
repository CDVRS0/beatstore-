import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "What's the difference between the license types?",
    a: "Each license controls file quality (MP3 vs WAV vs trackout stems) and how far you can take the song — streaming caps, sales caps, and whether music video and performance rights are included. Full details are shown on each beat's license page before you buy, and the exact terms you accept are on the license agreement page during checkout.",
  },
  {
    q: "Do I get the files instantly?",
    a: "Yes. As soon as payment is confirmed you'll be redirected to a download page and emailed a receipt with your download links. Links stay active for 7 days — if they expire, contact us for a re-send.",
  },
  {
    q: "Is the license non-exclusive or exclusive?",
    a: "MP3, WAV, Premium, and Unlimited leases are non-exclusive — the beat can still be purchased by other artists. Exclusive Rights removes the beat from sale permanently and transfers full commercial usage rights to you.",
  },
  {
    q: "Do I need to credit the producer?",
    a: "Yes, on all license types unless a separate credit buyout is agreed directly. Use \"prod. CDVRS\" in your title or description.",
  },
  {
    q: "Can I upgrade my license later?",
    a: "Yes — get in touch via the contact page with your order number and the beat, and we'll work out the difference in price.",
  },
  {
    q: "What if my download link expires?",
    a: "Reach out through the contact page with your order number or the email you purchased with and a new link will be issued.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <h1 className="font-display text-3xl font-bold text-hi">FAQ</h1>
      <div className="mt-8 divide-y divide-line rounded-xs border border-line bg-panel">
        {FAQS.map((item) => (
          <details key={item.q} className="group p-5">
            <summary className="cursor-pointer list-none font-bold text-hi marker:content-none">
              <span className="flex items-center justify-between">
                {item.q}
                <span className="text-lo transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-lo">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
