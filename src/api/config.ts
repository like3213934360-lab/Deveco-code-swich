import { invoke } from '@tauri-apps/api/core'

export const readConfig = () => invoke<Record<string, unknown>>('read_config')
export const writeConfig = (config: Record<string, unknown>) => invoke<void>('write_config', { config })
export const getConfigPath = () => invoke<string>('get_config_path')
