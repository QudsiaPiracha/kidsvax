import Link from "next/link";

export default function Home(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-warm-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-sage-700">KidsVax</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center">
        <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Your children&apos;s health records,
          <br />
          <span className="text-sage-600">digitized.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          KidsVax turns the German Gelbes Heft and Impfpass into a single, beautiful digital record.
          Auto-generated schedules, smart reminders, and AI-powered insights &mdash; so you never miss
          a checkup or vaccination.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="min-h-[48px] rounded-lg bg-sage-500 px-8 py-3 text-base font-semibold text-white hover:bg-sage-600 transition-colors shadow-sm"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="min-h-[48px] rounded-lg border border-sage-300 px-8 py-3 text-base font-semibold text-sage-700 hover:bg-sage-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-sage-100 bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Everything in one place
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            No more juggling paper booklets. KidsVax keeps your children&apos;s complete health
            records organized and accessible.
          </p>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📋"
              title="U-Exam Tracking"
              description="All 14 U-Untersuchungen plus 6 dental exams (Z1-Z6), auto-scheduled from your child's date of birth."
            />
            <FeatureCard
              icon="💉"
              title="Vaccination Schedule"
              description="STIKO-recommended immunizations with tolerance windows. Premature infant schedules supported."
            />
            <FeatureCard
              icon="📈"
              title="Growth Charts"
              description="Height, weight, and BMI tracking with WHO percentile curves. See trends at a glance."
            />
            <FeatureCard
              icon="🧒"
              title="Developmental Milestones"
              description="Motor, language, and social milestones organized by age. Check off as your child grows."
            />
            <FeatureCard
              icon="📸"
              title="AI Document Scanning"
              description="Photograph your paper U-Heft or Impfpass and AI extracts the data automatically."
            />
            <FeatureCard
              icon="🔔"
              title="Smart Reminders"
              description="Email notifications before exams and vaccinations are due. Never miss an appointment."
            />
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-t border-sage-100 bg-warm-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 sm:grid-cols-3">
            <TrustItem
              title="DSGVO Compliant"
              description="All data hosted in Frankfurt, Germany. No tracking, no third-party sharing."
            />
            <TrustItem
              title="Bilingual"
              description="Full English and German support. Perfect for expat families in Germany."
            />
            <TrustItem
              title="Multi-Child"
              description="Track unlimited children. Dashboard shows all at a glance, ordered by urgency."
            />
          </div>
        </div>
      </section>

      {/* Masern compliance */}
      <section className="border-t border-sage-100 bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Masernschutzgesetz Compliance
          </h2>
          <p className="mt-4 text-gray-600">
            KidsVax automatically checks whether your child meets Germany&apos;s mandatory measles
            vaccination requirements for daycare and school entry. Stay compliant without the
            paperwork.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-sage-100 bg-sage-50 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Start tracking in seconds
          </h2>
          <p className="mt-4 text-gray-600">
            Add your child, enter their date of birth, and KidsVax generates the complete exam and
            vaccination schedule instantly.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block min-h-[48px] rounded-lg bg-sage-500 px-10 py-3 text-base font-semibold text-white hover:bg-sage-600 transition-colors shadow-sm"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-100 bg-warm-white py-10">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} KidsVax. Built in Germany for German families.</p>
          <p className="mt-1">Data hosted in EU (Frankfurt). DSGVO/GDPR compliant.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-sage-100 bg-warm-white p-6">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function TrustItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-sage-700">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
