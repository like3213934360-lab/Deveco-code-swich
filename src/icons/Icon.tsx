import bolt from './bolt.svg'
import pkg from './package.svg'
import settings from './settings.svg'
import payments from './payments.svg'
import mcp from './mcp.svg'
import skill from './skill.svg'
import health from './health.svg'
import refresh from './refresh.svg'
import addCircle from './add-circle.svg'
import del from './delete.svg'
import check from './check.svg'
import close from './close.svg'
import download from './download.svg'
import edit from './edit.svg'
import info from './info.svg'
import switchIcon from './switch.svg'
import moreVert from './more-vert.svg'
import proxy from './proxy.svg'

export const icons = {
  bolt,
  package: pkg,
  settings,
  payments,
  mcp,
  skill,
  health,
  refresh,
  'add-circle': addCircle,
  delete: del,
  check,
  close,
  download,
  edit,
  info,
  switch: switchIcon,
  'more-vert': moreVert,
  proxy,
} as const

export type IconName = keyof typeof icons

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export default function Icon({ name, size = 20, className = '' }: IconProps) {
  const src = icons[name]
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ filter: 'brightness(0) invert(1)' }}
    />
  )
}
