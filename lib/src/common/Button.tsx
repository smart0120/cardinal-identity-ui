import { css } from '@emotion/react'
import { lighten } from 'polished'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  background?: string
}

export const ButtonLight: React.FC<Props> = ({
  children,
  className,
  disabled,
  background,
  ...props
}: Props) => {
  return (
    <div
      className={`text-light-4 flex items-center justify-center rounded-[5px] bg-[#EEE] px-2 py-1 text-center text-xs transition-all hover:bg-[#DDD] ${className} ${
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
      }`}
      {...props}
      css={
        background &&
        css`
          background: ${background} !important;
          color: ${lighten(0.5, background)} !important;
          &:hover {
            background: ${lighten(0.05, background)} !important;
          }
        `
      }
    >
      {children}
    </div>
  )
}
