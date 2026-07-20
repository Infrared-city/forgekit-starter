import type { InteriorPlugin } from '@forge-kit/plugin-contracts'
import { useMemo, useState } from 'react'
import { SIDEBAR_TAB_OPTIONS } from '../interior.constants'
import { sceneRefsRef } from '../interior.scene-context'
import { useInteriorStore } from '../interior.store'
import type { SidebarTab } from '../interior.types'
import { ModelTreePanel } from './ModelTreePanel'
import { SegmentedControl } from './SegmentedControl'
import { UploadPanel } from './UploadPanel'

export interface InteriorPanelProps {
  /** Plugins that contribute sidebar panels. */
  plugins?: InteriorPlugin[]
}

/**
 * InteriorPanel -- the left sidebar for the /interior route.
 *
 * Renders a SegmentedControl to switch between the Upload, Model tabs
 * (built-in) plus any plugin-provided tabs. Plugin panels are contributed
 * via the InteriorPlugin contract; this component does not import any
 * specific primitive domain directly.
 *
 * Plugin panels receive sceneRefs via the module-level sceneRefsRef
 * (set by InteriorCanvas). Reactivity is ensured by subscribing to
 * sceneVersion from the store -- InteriorCanvas bumps sceneVersion
 * after setting the ref, guaranteeing a re-render here.
 */
export function InteriorPanel({ plugins = [] }: InteriorPanelProps) {
  const activeTab = useInteriorStore((s) => s.activeTab)
  const setActiveTab = useInteriorStore((s) => s.setActiveTab)

  // Subscribe to sceneVersion for reactivity: InteriorCanvas bumps this
  // after setting sceneRefsRef.current, which triggers a re-render here
  // so the module-level ref read below sees the current value.
  // When sceneVersion is 0, sceneRefs is null (canvas not yet mounted).
  const sceneVersion = useInteriorStore((s) => s.sceneVersion)

  // Read sceneRefs from module-level ref (set by InteriorCanvas during render).
  // The sceneVersion subscription above guarantees a re-render when canvas is ready.
  const sceneRefs = sceneVersion > 0 ? sceneRefsRef.current : null

  // Build plugin tabs from plugins that provide a Panel
  const panelPlugins = useMemo(() => plugins.filter((p) => p.Panel), [plugins])

  // Combine built-in tabs with plugin-provided tabs
  const allTabOptions = useMemo(() => {
    const pluginTabs = panelPlugins.map((p) => ({
      value: p.id,
      label: p.panelLabel ?? p.id,
    }))
    return [...SIDEBAR_TAB_OPTIONS, ...pluginTabs]
  }, [panelPlugins])

  // Track which tab is active. Built-in tabs use activeTab from store,
  // plugin tabs use local state. We unify them into a single value.
  const [activePluginTab, setActivePluginTab] = useState<string | null>(null)

  // Use Set<string> to avoid type narrowing issues with SidebarTab
  const builtInTabIds: Set<string> = useMemo(
    () => new Set(SIDEBAR_TAB_OPTIONS.map((t) => t.value as string)),
    [],
  )
  const currentTab = activePluginTab ?? activeTab

  const handleTabChange = (tabId: string) => {
    if (builtInTabIds.has(tabId)) {
      setActiveTab(tabId as SidebarTab)
      setActivePluginTab(null)
    } else {
      setActivePluginTab(tabId)
    }
  }

  // Find active plugin panel (if a plugin tab is selected)
  const ActivePluginPanel = activePluginTab
    ? panelPlugins.find((p) => p.id === activePluginTab)?.Panel
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="px-4 pt-4 pb-2">
        <SegmentedControl
          options={allTabOptions}
          value={currentTab}
          onChange={handleTabChange}
          size="sm"
        />
      </div>

      {/* Tab content */}
      {!activePluginTab && activeTab === 'upload' && <UploadPanel />}
      {!activePluginTab && activeTab === 'model' && <ModelTreePanel />}
      {ActivePluginPanel && sceneRefs && <ActivePluginPanel sceneRefs={sceneRefs} />}
    </div>
  )
}
