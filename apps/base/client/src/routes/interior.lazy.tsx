import { InteriorCanvasWithSuspense, InteriorPanel } from '@forge-kit/interior-interface'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useInteriorPlugins } from '@/composition/interior-plugins'

export const Route = createLazyFileRoute('/interior')({
  component: InteriorRoute,
})

/**
 * Interior route -- thin composition shell that delegates plugin assembly to
 * the composition module and renders the interior interface.
 */
function InteriorRoute() {
  // --- Plugin composition (delegated to composition module) ---
  const plugins = useInteriorPlugins()

  return (
    <div className="flex w-full flex-1 min-h-0">
      {/* Left sidebar */}
      <div className="w-96 flex flex-col bg-background border-r border-border overflow-y-auto">
        <InteriorPanel plugins={plugins} />
      </div>

      {/* Right side: 3D canvas with lazy loading */}
      <div className="flex-1 relative min-h-0">
        <InteriorCanvasWithSuspense plugins={plugins} />
      </div>
    </div>
  )
}
