import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import { useState } from 'react'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import { LinkingFlow } from '../common/LinkingFlows'
import { useReverseEntry } from '../hooks/useReverseEntry'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { TWITTER_NAMESPACE_NAME } from '../utils/constants'
import { formatTwitterLink } from '../utils/format'
import { NameEntryClaim } from './NameEntryClaim'
import { NameManager } from './NameManager'
import { PoweredByFooter } from './PoweredByFooter'

export type ClaimCardProps = {
  dev?: boolean
  cluster?: Cluster
  wallet?: Wallet
  connection?: Connection
  secondaryConnection?: Connection
  appName?: string
  appTwitter?: string
  namespaceName?: string
  showManage?: boolean
  notify?: (arg: { message?: string; txid?: string }) => void
  onComplete?: (arg: string) => void
}

export const ClaimCard = ({
  appName,
  appTwitter,
  dev,
  cluster,
  connection,
  secondaryConnection,
  wallet,
  notify,
  onComplete,
  showManage: showManageDefault,
  namespaceName = TWITTER_NAMESPACE_NAME,
}: ClaimCardProps) => {
  const { linkingFlow } = useWalletIdentity()
  const [showManage, setShowManage] = useState(showManageDefault)
  const reverseEntry = useReverseEntry(
    connection,
    namespaceName,
    wallet?.publicKey
  )
  return (
    <>
      <div>
        <div className="relative px-2 pb-8 md:px-8 md:pt-2">
          <Instruction>
            {appName ? `${appName} uses` : 'Use'} Cardinal to link your{' '}
            {linkingFlow.displayName} identity to your <strong>Solana</strong>{' '}
            address.
          </Instruction>
          {(!wallet?.publicKey || !connection) && (
            <Alert
              style={{ marginBottom: '20px' }}
              message={
                <>
                  <div>Connect wallet to continue</div>
                </>
              }
              type="warning"
              showIcon
            />
          )}
          {!reverseEntry.isFetching && reverseEntry.data?.parsed.entryName && (
            <Alert
              style={{ marginBottom: '20px', width: '100%' }}
              message={
                <>
                  <div>
                    Your address is linked to{' '}
                    {formatTwitterLink(reverseEntry.data?.parsed.entryName)}.
                    Link a new Twitter handle below.
                  </div>
                </>
              }
              type="info"
              showIcon
            />
          )}
          {connection && wallet?.publicKey && (
            <ButtonLight
              className="absolute right-8 z-10"
              onClick={() => setShowManage((m) => !m)}
            >
              {showManage ? 'Back to linking' : 'Manage linked accounts'}
            </ButtonLight>
          )}
          {connection &&
            wallet &&
            (showManage ? (
              <NameManager
                cluster={cluster}
                connection={connection}
                wallet={wallet}
                namespaceName={namespaceName}
              />
            ) : (
              <NameEntryClaim
                dev={dev}
                cluster={cluster}
                wallet={wallet}
                connection={connection}
                secondaryConnection={secondaryConnection}
                appName={appName}
                appTwitter={appTwitter}
                setShowManage={setShowManage}
                notify={notify}
                onComplete={onComplete}
              />
            ))}
          <PoweredByFooter />
        </div>
      </div>
    </>
  )
}

const Instruction = styled.h2`
  margin-top: 0px;
  margin-bottom: 20px;
  font-weight: normal;
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  letter-spacing: -0.02em;
  color: #000000;
`
