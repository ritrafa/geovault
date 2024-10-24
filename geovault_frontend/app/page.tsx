import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'
import { ArrowRight, Building, ChartBar, Lock } from 'lucide-react'

const featuredProperties = [
  {
    id: '1',
    title: 'Downtown Highrise',
    location: 'New York, NY',
    image: '/placeholder1.webp?height=200&width=300',
    valuation: '$5,000,000',
    progress: 75,
    lockPeriod: '18 months',
  },
  {
    id: '2',
    title: 'Suburban Office Park',
    location: 'Austin, TX',
    image: '/placeholder2.webp?height=200&width=300',
    valuation: '$8,000,000',
    progress: 60,
    lockPeriod: '24 months',
  },
  {
    id: '3',
    title: 'Beachfront Resort',
    location: 'Miami, FL',
    image: '/placeholder3.webp?height=200&width=300',
    valuation: '$12,000,000',
    progress: 40,
    lockPeriod: '36 months',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                Invest in Premium Real Estate Properties
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                Join thousands of investors and diversify your portfolio with institutional-quality real estate investments.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/properties">
                  Explore Properties
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/properties">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Building className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Browse Properties</h3>
              <p className="text-muted-foreground">Explore our curated selection of high-quality real estate investments.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ChartBar className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Invest with Ease</h3>
              <p className="text-muted-foreground">Choose your investment amount and complete the process online in minutes.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Lock className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Earn Returns</h3>
              <p className="text-muted-foreground">Receive regular updates and earn potential returns on your investments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to Start Investing?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl">
                Join GeoVault today and start building your real estate portfolio with as little as $1,000.
              </p>
            </div>
            <Button size="lg" variant="secondary">
              Create Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}