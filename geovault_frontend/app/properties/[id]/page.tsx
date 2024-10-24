'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, DollarSign, Clock, Users, BarChart } from 'lucide-react'

// This would typically come from an API call
const property = {
  id: '1',
  title: 'Downtown Highrise',
  location: 'New York, NY',
  images: [
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600',
  ],
  valuation: '$5,000,000',
  investmentGoal: '$4,000,000',
  currentFunding: '$3,000,000',
  progress: 75,
  lockPeriod: '18 months',
  expectedReturn: '8-12% annually',
  minimumInvestment: '$5,000',
  description: 'A prime commercial real estate opportunity in the heart of downtown. This highrise offers a mix of office and retail spaces, providing a steady stream of rental income.',
  investmentHistory: [
    { date: '2023-01-15', amount: '$500,000' },
    { date: '2023-02-01', amount: '$750,000' },
    { date: '2023-03-10', amount: '$1,000,000' },
    { date: '2023-04-22', amount: '$750,000' },
  ],
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [investmentAmount, setInvestmentAmount] = useState('')

  const handleInvest = () => {
    // Handle investment logic here
    console.log(`Investing ${investmentAmount} in property ${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{property.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video mb-4">
            <img
              src={property.images[currentImage]}
              alt={`${property.title} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex space-x-2 mb-8">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-20 h-20 rounded-md overflow-hidden ${
                  index === currentImage ? 'ring-2 ring-primary' : ''
                }`}
              >
                <img
                  src={property.images[index]}
                  alt={`${property.title} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="investment-history">Investment History</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{property.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Location details and map would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="investment-history">
              <Card>
                <CardHeader>
                  <CardTitle>Investment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Date</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.investmentHistory.map((investment, index) => (
                        <tr key={index}>
                          <td>{investment.date}</td>
                          <td className="text-right">{investment.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Valuation
                </span>
                <span className="font-bold">{property.valuation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Investment Goal
                </span>
                <span className="font-bold">{property.investmentGoal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Current Funding
                </span>
                <span className="font-bold">{property.currentFunding}</span>
              </div>
              <Progress value={property.progress} className="w-full" />
              <div className="text-sm text-right">{property.progress}% Funded</div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Lock Period
                </span>
                <span>{property.lockPeriod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Expected Return</span>
                <span>{property.expectedReturn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Minimum Investment</span>
                <span>{property.minimumInvestment}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full">
                <Label htmlFor="investment-amount">Investment Amount</Label>
                <Input
                  id="investment-amount"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleInvest}>
                Invest Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}