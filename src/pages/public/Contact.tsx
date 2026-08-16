export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">Contact</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">Get in touch</h1>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <InfoCard label="Location" value="Add your academy address" />
        <InfoCard label="Phone" value="Add your phone number" />
        <InfoCard label="WhatsApp" value="Add your WhatsApp number" />
        <InfoCard label="Email" value="Add your contact email" />
      </div>

      <div className="mt-10 flex h-64 items-center justify-center rounded-card border border-dashed border-line-soft text-sm text-pitch/50">
        Google Maps embed placeholder — add your academy location
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line-soft bg-white p-5">
      <p className="eyebrow text-grass">{label}</p>
      <p className="mt-2 text-pitch/70">{value}</p>
    </div>
  )
}
