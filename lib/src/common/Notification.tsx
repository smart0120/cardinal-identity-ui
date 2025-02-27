import styled from '@emotion/styled'
import type { Cluster } from '@solana/web3.js'
import { lighten } from 'polished'
import React from 'react'
import toast, { resolveValue, ToastBar, Toaster } from 'react-hot-toast'
import { VscClose } from 'react-icons/vsc'

interface INotifyArgs {
  message?: string
  description?: React.ReactNode
  txid?: string
  txids?: string[]
  cluster?: Cluster
  type?: 'success' | 'error' | 'info' | 'warn'
}

export function notify({
  message,
  description,
  txid,
  txids,
  cluster,
  type = 'info',
}: INotifyArgs): void {
  const logLevel =
    type === 'warn' ? 'warn' : type === 'error' ? 'error' : 'info'
  if (txids?.length === 1) {
    txid = txids[0]
  }
  console[logLevel](`Notify: ${message ?? '<no message>'}`, description, {
    cluster,
    txid,
    txids,
    type,
  })

  if (txid) {
    description = (
      <div>
        View Transaction:{' '}
        <a
          href={`https://explorer.solana.com/tx/${txid}?cluster=${
            cluster?.toString() ?? ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
        </a>
      </div>
    )
  } else if (txids) {
    description = (
      <div>
        View Transactions:{' '}
        <TxContainer>
          {txids.map((txid, i) => (
            <a
              key={i}
              href={`https://explorer.solana.com/tx/${txid}?cluster=${
                cluster?.toString() ?? ''
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              [{i + 1}]
            </a>
          ))}
        </TxContainer>
      </div>
    )
  }
  toast(
    <div className="flex flex-col gap-1 text-sm">
      <div className="font-medium">{message}</div>
      {description && <div style={{ opacity: '.5' }}>{description}</div>}
    </div>,
    { duration: 5000 }
  )
}

const TxContainer = styled.div`
  display: inline-flex;
  gap: 4px;
`

export function ToastContainer() {
  return (
    <Toaster position="top-right">
      {(t) => (
        <ToastBar
          toast={t}
          style={{ background: 'none', border: 'none', padding: '0px' }}
        >
          {() => (
            <div
              className={`relative flex w-full max-w-sm gap-4 rounded border p-4 shadow ${
                t.visible ? 'animate-enter' : 'animate-leave'
              }`}
              style={{
                borderColor: '#7560FF',
                backgroundColor: lighten(0.07, '#0B0B0B'),
                color: '#0B0B0B',
                wordBreak: 'break-word',
              }}
            >
              {resolveValue(t.message, t)}
              <button
                style={{ color: '#0B0B0B' }}
                className={``}
                onClick={() => toast.dismiss(t.id)}
              >
                <VscClose />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}
