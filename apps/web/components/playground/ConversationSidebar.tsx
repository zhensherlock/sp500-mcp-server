'use client'

import { ChevronRight, History, Plus, Trash2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import type { SavedSession } from '@/lib/playground/history'

export function ConversationSidebar({
  sessions,
  activeId,
  onNew,
  onSelect,
  onRemove,
}: {
  sessions: SavedSession[]
  activeId?: string
  onNew: () => void
  onSelect: (session: SavedSession) => void
  onRemove: (id: string) => void
}) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar className="absolute h-full" aria-label="Conversations">
      <SidebarHeader className="px-4 pt-6 pb-3">
        <Button
          variant="outline"
          className="h-11 w-full justify-start"
          onClick={() => {
            onNew()
            setOpenMobile(false)
          }}
        >
          <Plus data-icon="inline-start" />
          New research
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <Collapsible defaultOpen className="group/history">
          <SidebarGroup>
            <SidebarGroupLabel asChild className="gap-2">
              <CollapsibleTrigger>
                <History />
                Recent conversations
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/history:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1" aria-label="Recent conversations">
                  {sessions.map(item => (
                    <SidebarMenuItem
                      key={item.id}
                      className="rounded-md hover:bg-sidebar-accent focus-within:bg-sidebar-accent"
                    >
                      <SidebarMenuButton
                        className="h-10"
                        isActive={activeId === item.id}
                        aria-current={activeId === item.id ? 'page' : undefined}
                        title={item.title}
                        onClick={() => {
                          onSelect(item)
                          setOpenMobile(false)
                        }}
                      >
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            className="top-1/2! -translate-y-1/2"
                            aria-label={`Remove ${item.title} from this browser`}
                            onClick={() => onRemove(item.id)}
                          >
                            <Trash2 />
                          </SidebarMenuAction>
                        </TooltipTrigger>
                        <TooltipContent side="right">Remove from this browser</TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                {!sessions.length && (
                  <p className="px-2 py-3 text-xs leading-5 text-muted-foreground">
                    Your research will appear here.
                    <br />
                    Saved in this browser.
                  </p>
                )}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  )
}
