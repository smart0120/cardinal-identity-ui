import { css } from '@emotion/react'
import styled from '@emotion/styled'
import type { Placement } from '@popperjs/core'
import React, { useEffect, useRef, useState } from 'react'

const Arrow = styled.div`
  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
    content: '';
    transform: rotate(45deg);
  }
  &.arrow-top {
    bottom: -5px;
    ::before {
      border-top: none;
      border-left: none;
    }
  }
  &.arrow-bottom {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }
  &.arrow-bottom-end {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }
  &.arrow-left {
    right: -5px;
    ::before {
      border-bottom: none;
      border-left: none;
    }
  }
  &.arrow-right {
    left: -5px;
    ::before {
      border-right: none;
      border-top: none;
    }
  }
`

export interface PopoverProps {
  content: React.ReactNode
  open: boolean
  guide?: boolean
  children: React.ReactNode
  placement?: Placement
  offset?: [number, number]
}

export const Popover: React.FC<PopoverProps> = ({ content, children }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleClickOutside = (event: { target: any }) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      <div
        className={`absolute right-0 top-14 z-50 justify-center overflow-scroll bg-light-0 bg-opacity-[0.05] transition-all duration-200 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        // eslint-disable-next-line react/no-unknown-property
        css={css`
          ${isOpen
            ? 'opacity: 100; backdrop-filter: blur(15px);'
            : 'opacity: 0; backdrop-filter: blur(0px);'}
        `}
      >
        {content}
      </div>
    </div>
  )
}

export const PopoverItem = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div
    className={`${className} rounded-md px-2 py-1 hover:bg-[rgba(255,255,255,0.1)]`}
  >
    {children}
  </div>
)
