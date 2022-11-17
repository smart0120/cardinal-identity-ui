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
      className={`flex items-center justify-center rounded-xl px-6 py-1 text-center text-lg text-white transition-all duration-300 ${className} ${
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
      }`}
      {...props}
      // eslint-disable-next-line react/no-unknown-property
      css={
        background &&
        css`
          background: ${background} !important;
        `
      }
    >
      <>{children}</>
    </div>
  )
}
