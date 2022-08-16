import { css } from '@emotion/react'
import { useEffect } from 'react'

import { CloseIcon } from '../components/icons'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onDismiss: () => void
}

export const Modal: React.FC<Props> = ({
  isOpen,
  children,
  onDismiss,
  className,
  ...props
}: Props) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div
      {...props}
      onClick={() => onDismiss()}
      className={`bg-light-0 fixed z-50 flex h-screen w-screen justify-center overflow-scroll bg-opacity-[0.05] transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      css={css`
        ${isOpen
          ? 'opacity: 100; backdrop-filter: blur(15px);'
          : 'opacity: 0; backdrop-filter: blur(0px);'}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        css={css`
          box-shadow: rgba(255, 255, 255, 0.15) 0px 0px 48px;
        `}
        className={`${className} my-[10vh] h-fit w-[560px] max-w-[98vw] rounded-xl transition-all `}
      >
        <div className="text-dark-4 hover:text-medium-4 flex w-full cursor-pointer items-center justify-end px-4 pt-4 transition">
          <CloseIcon onClick={() => onDismiss()} />
        </div>
        {children}
      </div>
    </div>
  )
}
