import styled from '@emotion/styled'
import { animated, useTransition } from '@react-spring/web'
import darken from 'polished/lib/color/darken'
import React from 'react'

import { CloseIcon } from './icons'

export interface ModalProps {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  darkenOverlay?: boolean
  hideCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onDismiss,
  darkenOverlay = true,
  hideCloseButton = false,
}: ModalProps) => {
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 50 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })
  return (
    <>
      {fadeTransition(
        (style, item) =>
          item && (
            <StyledDialogOverlay
              style={style}
              isOpen={isOpen}
              darkenOverlay={darkenOverlay}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDismiss()
              }}
            >
              <ModalWrapper
                // style={style}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <TopArea>
                  <div />
                  {hideCloseButton ? (
                    <div />
                  ) : (
                    <ButtonIcon
                      href="#"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onDismiss()
                      }}
                    >
                      <CloseIcon />
                    </ButtonIcon>
                  )}
                </TopArea>
                {children}
              </ModalWrapper>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}

const TopArea = styled.div`
  padding: 12px 16px 0px 16px;
  top: 12px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ButtonIcon = styled.a`
  flex: 0 0 24px;
  color: #ccd2e3;
  &:hover {
    color: ${darken(0.1, '#ccd2e3')};
  }
  transition: 0.1s ease;
`

const StyledDiv = styled.div``

const ModalWrapper = styled(animated(StyledDiv))`
  * {
    box-sizing: border-box;
  }
  font-family: SFHello, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol';
  position: relative;
  box-shadow: 0px 4px 16px rgba(207, 207, 207, 0.25);
  width: 100%;
  max-width: 560px;
  border-radius: 8px;
  background: #fff;
  color: #696969;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.02em;
  color: #696969;
  margin: 10vh auto;
`

const StyledDialogOverlay = styled(animated(StyledDiv))<{
  darkenOverlay?: boolean
  isOpen?: boolean
}>`
  transition: 0.15s all;
  width: 100vw;
  height: 100vh;
  position: absolute;
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'collapse')};
  background: ${({ darkenOverlay }) =>
    darkenOverlay ? 'rgba(0, 0, 0, 0.55)' : 'none'};
  z-index: 1000;
`
