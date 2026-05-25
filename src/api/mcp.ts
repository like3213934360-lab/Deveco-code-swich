import { invoke } from '@tauri-apps/api/core'

export interface McpServer {
  id: string
  name: string
  server_type: string
  command: string
  args: string
  env: string
  enabled: boolean
  description: string | null
  homepage: string | null
  created_at: number
}

export interface CreateMcpInput {
  name: string
  server_type?: string
  command: string[]
  env?: Record<string, string>
  description?: string
  homepage?: string
}

export const listMcpServers = () => invoke<McpServer[]>('list_mcp_servers')
export const addMcpServer = (input: CreateMcpInput) => invoke<McpServer>('add_mcp_server', { input })
export const toggleMcpServer = (id: string, enabled: boolean) => invoke<void>('toggle_mcp_server', { id, enabled })
export const removeMcpServer = (id: string) => invoke<void>('remove_mcp_server', { id })
