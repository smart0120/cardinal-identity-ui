import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { useState } from 'react'

import type { Identity } from '../common/Identities'
import { NameEntryClaim } from './NameEntryClaim'
import { NameManager } from './NameManager'
import { PoweredByFooter } from './PoweredByFooter'

export type ClaimCardProps = {
  wallet?: Wallet
  connection?: Connection
  secondaryConnection?: Connection
  defaultVerifyIdentity?: Identity
  onComplete?: (arg: string) => void
}

export const ClaimCard = ({
  wallet,
  connection,
  secondaryConnection,
  defaultVerifyIdentity,
  onComplete,
}: ClaimCardProps) => {
  const [verifyIdentity, setVerifyIdentity] = useState<Identity>(
    defaultVerifyIdentity
  )
  return (
    <div className="relative mx-auto h-full min-h-[200px] w-full px-5">
      <div className="relative px-2 pb-8 md:px-8 md:pt-2">
        <>
          {!wallet?.publicKey || !connection ? (
            <div className="m-12 flex items-center justify-center text-2xl">
              Connect wallet to continue
            </div>
          ) : verifyIdentity ? (
            <NameEntryClaim
              identity={verifyIdentity}
              wallet={wallet}
              connection={connection}
              secondaryConnection={secondaryConnection}
              setVerifyIdentity={setVerifyIdentity}
              onComplete={onComplete}
            />
          ) : (
            <NameManager
              connection={connection}
              wallet={wallet}
              setVerifyIdentity={setVerifyIdentity}
            />
          )}
          <PoweredByFooter />
        </>
      </div>
    </div>
  )
}
