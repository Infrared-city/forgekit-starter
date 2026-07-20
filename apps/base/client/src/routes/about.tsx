import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="p-6 bg-background flex-1 min-h-0 overflow-y-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>About Forge Kit</CardTitle>
          <CardDescription>
            A comprehensive toolkit for building geospatial applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Forge Kit provides tools for building analysis, visualization, and environmental
            simulation.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-medium text-foreground mb-1">Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Solar, wind, and thermal comfort analysis
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-medium text-foreground mb-1">Visualization</h3>
              <p className="text-sm text-muted-foreground">3D building and map visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
