import Link from 'next/link';

export function LegalLinksCard() {
    return (
        <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
            <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Legal</h3>
            <div className="mt-4 grid gap-3">
                <Link href="/privacy" className="rounded-[20px] border border-white/80 bg-white/72 px-4 py-4 text-sm font-bold text-[#4e4035] hover:bg-[#f3e7da]">
                    Privacy Policy
                </Link>
                <Link href="/terms" className="rounded-[20px] border border-white/80 bg-white/72 px-4 py-4 text-sm font-bold text-[#4e4035] hover:bg-[#f3e7da]">
                    Terms of Service
                </Link>
            </div>
      </section>
    );
}
