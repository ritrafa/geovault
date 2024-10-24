import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          <div className="pb-6">
            <Link href="/" className="text-sm leading-6 text-muted-foreground hover:text-primary">
              Home
            </Link>
          </div>
          <div className="pb-6">
            <Link href="/properties" className="text-sm leading-6 text-muted-foreground hover:text-primary">
              Properties
            </Link>
          </div>
          <div className="pb-6">
            <Link href="/dashboard" className="text-sm leading-6 text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
          </div>
          <div className="pb-6">
            <Link href="#" className="text-sm leading-6 text-muted-foreground hover:text-primary">
              About
            </Link>
          </div>
          <div className="pb-6">
            <Link href="#" className="text-sm leading-6 text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-muted-foreground">
          &copy; 2024 GeoVault, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  )
}