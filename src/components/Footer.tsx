import Link from "next/link";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-lg font-bold text-hi">
              CDVRS<span className="text-blue">.</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-lo">
              Beats made for artists building their own world. Create Your World.
            </p>
            <div className="mt-4 flex gap-4 text-sm text-lo">
              <a href="https://www.youtube.com/@CDVLabs" target="_blank" rel="noopener noreferrer" className="hover:text-hi">
                YouTube
              </a>
              <a href="https://www.instagram.com/cdvlabs?igsh=Y3k0eng3ZGxrN2Yw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-hi">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@cdvlabs" target="_blank" rel="noopener noreferrer" className="hover:text-hi">
                TikTok
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-lo">Shop</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/shop" className="text-lo hover:text-hi">All beats</Link></li>
              <li><Link href="/shop?sort=featured" className="text-lo hover:text-hi">Featured</Link></li>
              <li><Link href="/shop?sort=bestsellers" className="text-lo hover:text-hi">Best sellers</Link></li>
              <li><Link href="/shop?sort=new" className="text-lo hover:text-hi">Recently added</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-lo">Support</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/faq" className="text-lo hover:text-hi">FAQ</Link></li>
              <li><Link href="/contact" className="text-lo hover:text-hi">Contact</Link></li>
              <li><Link href="/account" className="text-lo hover:text-hi">My account</Link></li>
            </ul>
          </div>

          <Newsletter />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-lo md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} CDVRSWRLD. All rights reserved.</span>
        
        </div>
      </div>
    </footer>
  );
}
