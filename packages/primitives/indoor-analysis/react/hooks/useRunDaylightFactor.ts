/**
 * TanStack mutation hook for running daylight factor analysis.
 *
 * Orchestrates the 4-step async flow:
 *   presign -> S3 upload -> confirm -> run analysis
 *
 * Updates the Zustand store's `analysisStep` at each phase so the UI
 * can display step-by-step progress text.
 *
 * Handles:
 * - Sequential await calls in a single mutationFn (TkDodo pattern)
 * - Per-step progress via Zustand analysisStep store
 * - Toast notifications with stable ID, updated per step
 * - Generation counter for stale result prevention
 * - S3 XML error parsing for user-friendly messages
 */

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { confirmUpload, presignUpload, runIndoorAnalysis, uploadToS3 } from '../indoor-analysis.api'
import { useAnalysisStore } from '../indoor-analysis.store'

export interface RunDaylightFactorInput {
  /** Raw IFC file buffer */
  buffer: ArrayBuffer
  /** Original IFC filename */
  filename: string
  /** 0-based floor index derived from storey order in spatial tree */
  floorIndex: number
  /** Latitude of the building location */
  latitude: number
  /** Longitude of the building location */
  longitude: number
}

const TOAST_ID = 'daylight-factor'

export function useRunDaylightFactor() {
  return useMutation({
    mutationFn: async (input: RunDaylightFactorInput) => {
      const { buffer, filename, floorIndex, latitude, longitude } = input
      const { setAnalysisStep } = useAnalysisStore.getState()

      // Step 1: Get presigned S3 upload URL
      setAnalysisStep('uploading')
      toast.loading('Uploading file...', { id: TOAST_ID })
      const presignData = await presignUpload()

      // Step 2: Upload file to S3
      const file = new File([buffer], filename)
      await uploadToS3(presignData, file)

      // Step 3: Confirm upload
      setAnalysisStep('validating')
      toast.loading('Validating IFC...', { id: TOAST_ID })
      await confirmUpload(presignData.fileId)

      // Step 4: Run analysis
      setAnalysisStep('analyzing')
      toast.loading('Running daylight analysis...', { id: TOAST_ID })
      return runIndoorAnalysis({
        fileId: presignData.fileId,
        analysisType: 'daylight-factor',
        latitude,
        longitude,
        monthStamp: [6],
        dayStamp: [21],
        hourStamp: [12],
        floorIndex,
        gridSize: 0.25,
        analysisHeight: 0.8,
      })
    },

    // Don't re-send large IFC files on failure -- TanStack v5 defaults to 3 retries
    retry: 0,

    onMutate: () => {
      // Bump generation counter so stale results from previous runs are ignored
      useAnalysisStore.getState().bumpGeneration()
      toast.loading('Uploading file...', { id: TOAST_ID })
      // Return context with captured generation for staleness check
      return { generation: useAnalysisStore.getState().getGeneration() }
    },

    // Put critical logic in hook-level onSuccess (not .mutate() callback)
    // because the component may unmount during the long-running analysis.
    onSuccess: (data, _variables, context) => {
      // Guard against stale results: if generation changed since onMutate,
      // a newer analysis was started and this result should be discarded
      const currentGen = useAnalysisStore.getState().getGeneration()
      if (context?.generation !== currentGen) return

      useAnalysisStore.getState().setAnalysisStep(null)
      toast.success('Analysis complete', { id: TOAST_ID })
      useAnalysisStore.getState().setHeatmapData(data)
      useAnalysisStore.getState().setShowOverlay(true)
    },

    onError: (error) => {
      useAnalysisStore.getState().setAnalysisStep(null)
      toast.error(error instanceof Error ? error.message : 'Daylight analysis failed', {
        id: TOAST_ID,
      })
    },
  })
}
