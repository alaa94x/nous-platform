interface IconProps {
  className?: string
  size?: number
}

export function ArrowUpRightIcon({ className, size = 18 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
    >
      <path d="M5 15 15 5M8 5h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowDownIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
    >
      <path d="M10 4v11m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
