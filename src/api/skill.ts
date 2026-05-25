import { invoke } from '@tauri-apps/api/core'

export interface Skill {
  id: string
  name: string
  description: string | null
  directory: string | null
  repo_owner: string | null
  repo_name: string | null
  repo_branch: string
  enabled: boolean
  content_hash: string | null
  installed_at: number
  updated_at: number | null
}

export const listSkills = () => invoke<Skill[]>('list_skills')
export const installSkill = (repo: string, name: string) => invoke<string>('install_skill', { repo, name })
export const toggleSkill = (id: string, enabled: boolean) => invoke<void>('toggle_skill', { id, enabled })
