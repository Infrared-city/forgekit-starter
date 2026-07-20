import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/interior')({
  onLeave: async () => {
    // Dynamic imports — these modules are already in memory when leaving
    // the route, so the import() resolves instantly from the module cache.
    const [{ useAnalysisStore }, { useInteriorStore }] = await Promise.all([
      import('@forge-kit/indoor-analysis'),
      import('@forge-kit/interior-interface'),
    ])
    useInteriorStore.getState().reset()
    useAnalysisStore.getState().reset()
  },
})
