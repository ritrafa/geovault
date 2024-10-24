import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MapPin, Timer } from 'lucide-react'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    location: string
    image: string
    valuation: string
    progress: number
    lockPeriod: string
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
      <CardHeader>
        <CardTitle>{property.title}</CardTitle>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Current  valuation</div>
          <div className="text-lg font-bold">{property.valuation}</div>
        </div>
        <Progress value={property.progress} className="mb-2" />
        <div className="text-sm text-muted-foreground text-right">{property.progress}% Funded</div>
        <div className="flex items-center mt-4 text-sm text-muted-foreground">
          <Timer className="h-4 w-4 mr-1" />
          Lock period: {property.lockPeriod}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/properties/${property.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}