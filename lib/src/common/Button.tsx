import { contrastify } from '@cardinal/common'
import { css } from '@emotion/react'

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
      className={`flex items-center justify-center rounded-[5px] bg-[#EEE] px-2 py-1 text-center text-xs text-light-4 transition-all duration-300 hover:bg-[#DDD] ${className} ${
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
      }`}
      {...props}
      // eslint-disable-next-line react/no-unknown-property
      css={
        background &&
        css`
          background: ${background} !important;
          color: ${contrastify(0.5, background)[1]}
          &:hover {
            background: ${contrastify(0.5, background)[1]} !important;
          }
        `
      }
    >
      <>{children}</>
    </div>
  )
}
