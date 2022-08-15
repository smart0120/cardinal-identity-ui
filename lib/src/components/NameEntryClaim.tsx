import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import type { Identity } from '../common/Identities'
import { useHandleClaimTransaction } from '../handlers/useHandleClaimTransaction'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { useHandleVerify } from '../handlers/useHandleVerify'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNameEntryData } from '../hooks/useNameEntryData'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { formatIdentityLink, formatShortAddress } from '../utils/format'
import { ButtonWithFooter } from './ButtonWithFooter'
import { HandleNFT } from './HandleNFT'
import { Link, Megaphone, Verified } from './icons'
import { InitiateVerification } from './InitiateVerification'
import { LabeledInput } from './LabeledInput'
import { StepDetail } from './StepDetail'

export const NameEntryClaim = ({
  identity,
  wallet,
  connection,
  secondaryConnection,
  onComplete,
  setVerifyIdentity,
}: {
  identity: Identity
  wallet: Wallet
  connection: Connection
  secondaryConnection?: Connection
  onComplete?: (arg0: string) => void
  setVerifyIdentity: (arg0: Identity | undefined) => void
}) => {
  const { cluster, appInfo } = useWalletIdentity()
  const [verificationUrl, setVerificationUrl] = useState<string | undefined>(
    undefined
  )
  const [handle, setHandle] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verificationInitiated, setVerificationInitiated] = useState(false)

  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    wallet?.publicKey
  )

  const nameEntryData = useNameEntryData(
    secondaryConnection || connection,
    identity.name,
    handle
  )
  const handleVerify = useHandleVerify(
    wallet,
    identity,
    accessToken,
    setAccessToken,
    setHandle
  )
  const handleClaimTransaction = useHandleClaimTransaction(
    connection,
    wallet,
    identity,
    handle
  )

  const handleSetNamespaceDefault = useHandleSetNamespaceDefault(
    connection,
    wallet
  )

  useMemo(() => {
    if (verificationUrl && verificationInitiated) {
      handleVerify.mutate({ verificationUrl: verificationUrl })
    } else if (verificationUrl?.length === 0) {
      handleClaimTransaction.reset()
    }
  }, [wallet.publicKey.toString(), verificationUrl, verificationInitiated])

  const alreadyOwned =
    nameEntryData.data?.owner?.toString() && !nameEntryData.data?.isOwnerPDA
      ? true
      : false

  return (
    <>
      <div className="text-dark-6 mb-6 text-center text-2xl">
        {appInfo?.name ? `${appInfo.name} uses` : 'Use'} Cardinal to link your{' '}
        <strong>{identity.displayName}</strong> identity to your{' '}
        <strong>Solana</strong> address.
      </div>
      {globalReverseEntry.data &&
        globalReverseEntry.data.parsed.namespaceName === identity.name && (
          <Alert
            style={{ marginBottom: '20px', width: '100%' }}
            message={
              <div className="flex w-full flex-col text-center">
                <div>
                  <span className="font-semibold">{identity.displayName}</span>{' '}
                  is configured as your{' '}
                  <span className="font-semibold">default</span> global identity
                </div>
              </div>
            }
            type="info"
            showIcon
          />
        )}
      <ButtonLight
        className="absolute right-8 z-10"
        onClick={() => setVerifyIdentity(undefined)}
      >
        Manage linked accounts
      </ButtonLight>
      <DetailsWrapper>
        <StepDetail
          disabled={!wallet?.publicKey || !connection}
          icon={<Megaphone />}
          title={identity?.description.header || 'Verify'}
          description={
            <>
              <div>{identity?.description.text}</div>
              <InitiateVerification
                wallet={wallet}
                identity={identity}
                disabled={false}
                callback={() => setVerificationInitiated(true)}
                cluster={cluster}
              />
            </>
          }
        />
        <StepDetail
          disabled={!verificationInitiated}
          icon={<Link />}
          title={`Paste the URL of the ${
            identity.verification?.toLocaleLowerCase() || 'verification'
          }`}
          description={
            <div>
              <LabeledInput
                disabled={!verificationInitiated}
                label={identity.verification || 'Verification'}
                name={identity.verification || 'Verification'}
                onChange={(e) => setVerificationUrl(e.target.value)}
              />
            </div>
          }
        />
        <StepDetail
          disabled={
            !verificationUrl ||
            verificationUrl?.length === 0 ||
            !(
              handleVerify.isError ||
              handleVerify.isSuccess ||
              handleVerify.isLoading
            )
          }
          icon={<Verified />}
          title="Claim your handle"
          description={
            <>
              <div>
                You will receive a non-tradeable NFT to prove you own your
                Twitter handle.
              </div>
              {verificationUrl && verificationUrl?.length !== 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingTop: '20px',
                  }}
                >
                  <HandleNFT identity={identity} handle={handle} />
                  <div
                    style={{
                      padding: '10px',
                      width: 'calc(100% - 120px - 20px)',
                    }}
                  >
                    {handleVerify.isLoading ? (
                      <div className="mb-2 h-8 w-full animate-pulse rounded-lg bg-gray-200"></div>
                    ) : handleVerify.error ? (
                      <Alert
                        style={{
                          margin: '10px 0px',
                          height: 'auto',
                          wordBreak: 'break-word',
                          justifyContent: 'center',
                        }}
                        message={<div>{`${handleVerify.error}`}</div>}
                        type="error"
                        showIcon
                      />
                    ) : (
                      <Alert
                        style={{
                          margin: '10px 0px',
                          height: 'auto',
                          wordBreak: 'break-word',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                        message={
                          <>
                            <div>
                              Verified ownership of
                              <br />
                              {formatIdentityLink(handle, identity.name)}
                            </div>
                          </>
                        }
                        type="success"
                        showIcon
                      />
                    )}
                    {nameEntryData.isFetching ? (
                      <div className="mb-2 h-8 w-3/4 animate-pulse rounded-lg bg-gray-200"></div>
                    ) : (
                      alreadyOwned &&
                      handleVerify.isSuccess && (
                        <>
                          <Alert
                            style={{
                              marginBottom: '10px',
                              height: 'auto',
                              wordBreak: 'break-word',
                              justifyContent: 'center',
                            }}
                            message={
                              <>
                                <div>
                                  Owned by{' '}
                                  {formatShortAddress(
                                    nameEntryData?.data?.owner
                                  )}
                                </div>
                              </>
                            }
                            type="warning"
                            showIcon
                          />
                          {nameEntryData?.data?.owner?.toString() ===
                            wallet?.publicKey?.toString() &&
                          !handleClaimTransaction.isLoading ? (
                            <>
                              <div>
                                You already own this handle! If you want to set
                                it as your default, visit the{' '}
                                <span
                                  className="cursor-pointer text-blue-500"
                                  onClick={() => setVerifyIdentity(undefined)}
                                >
                                  manage
                                </span>{' '}
                                tab.
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                If you wish to continue, you will revoke this
                                handle from them.
                              </div>
                            </>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          }
        />
        {handleClaimTransaction.error && (
          <Alert
            style={{
              height: 'auto',
              wordBreak: 'break-word',
              justifyContent: 'center',
            }}
            message={
              <div>{`Error: ${handleError(handleClaimTransaction.error)}`}</div>
            }
            type="error"
            showIcon
          />
        )}
        {handleSetNamespaceDefault.error && (
          <Alert
            style={{
              height: 'auto',
              wordBreak: 'break-word',
              justifyContent: 'center',
            }}
            message={
              <div>{`Error: ${handleError(
                handleSetNamespaceDefault.error
              )}`}</div>
            }
            type="error"
            showIcon
          />
        )}
      </DetailsWrapper>
      <ButtonWithFooter
        loading={
          handleClaimTransaction.isLoading ||
          handleSetNamespaceDefault.isLoading
        }
        complete={handleClaimTransaction.isSuccess}
        disabled={
          !handleVerify.isSuccess ||
          verificationUrl?.length === 0 ||
          nameEntryData.isFetching ||
          nameEntryData?.data?.owner?.toString() ===
            wallet?.publicKey?.toString()
        }
        onClick={async () => {
          handleClaimTransaction.mutate(
            {
              verificationUrl,
              accessToken,
            },
            {
              onSuccess: () => {
                onComplete && onComplete(handle || '')
              },
            }
          )
        }}
      >
        Claim {handle && `@${handle}`}
      </ButtonWithFooter>
    </>
  )
}
const DetailsWrapper = styled.div`
  display: grid;
  grid-row-gap: 28px;
`
