import Link from 'next/link';

export function LegalLinksCard() {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1d140d]">Legal</h3>
            <div className="mt-4 flex flex-col space-y-2">
                <Link href="/privacy" className="text-sm font-medium text-[#7a4b28] hover:underline">
                    Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm font-medium text-[#7a4b28] hover:underline">
                    Terms of Service
                </Link>
            </div>
      </div>
    );
}
