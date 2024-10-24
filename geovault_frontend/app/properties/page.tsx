'use client'

import { useState } from 'react'
import { PropertyCard } from '@/components/property-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const properties = [
  {
    id: '1',
    title: 'Downtown Highrise',
    location: 'New York, NY',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$5,000,000',
    progress: 75,
    lockPeriod: '18 months',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Suburban Office Park',
    location: 'Austin, TX',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$8,000,000',
    progress: 60,
    lockPeriod: '24 months',
    status: 'Active',
  },
  {
    id: '3',
    title: 'Beachfront Resort',
    location: 'Miami, FL',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$12,000,000',
    progress: 40,
    lockPeriod: '36 months',
    status: 'Active',
  },
  {
    id: '4',
    title: 'Mountain Retreat',
    location: 'Aspen, CO',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$7,000,000',
    progress: 100,
    lockPeriod: '12 months',
    status: 'Funded',
  },
  {
    id: '5',
    title: 'Tech Hub Campus',
    location: 'San Francisco, CA',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$20,000,000',
    progress: 80,
    lockPeriod: '48 months',
    status: 'Active',
  },
  {
    id: '6',
    title: 'Historic Downtown Building',
    location: 'Boston, MA',
    image: '/placeholder.svg?height=200&width=300',
    valuation: '$9,000,000',
    progress: 90,
    lockPeriod: '30 months',
    status: 'Active',
  },
]

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    priceRange: 'all',
    location: '',
  })

  const filteredProperties = properties.filter((property) => {
    if (filters.status !== 'all' && property.status !== filters.status) return false
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      const valuation = Number(property.valuation.replace(/[^0-9.-]+/g, ''))
      if (valuation < min || valuation > max) return false
    }
    if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Funded">Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priceRange">Price Range</Label>
          <Select
            value={filters.priceRange}
            onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
          >
            <SelectTrigger id="priceRange">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0-5000000">$0 - $5M</SelectItem>
              <SelectItem value="5000000-10000000">$5M - $10M</SelectItem>
              <SelectItem value="10000000-100000000">$10M+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}