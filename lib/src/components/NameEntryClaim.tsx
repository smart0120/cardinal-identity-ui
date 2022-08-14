import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { Alert } from '../common/Alert'
import { useHandleClaimTransaction } from '../handlers/useHandleClaimTransaction'
import { useHandleRevoke } from '../handlers/useHandleRevoke'
import { useHandleVerify } from '../handlers/useHandleVerify'
import { useNameEntryData } from '../hooks/useNameEntryData'
import { formatIdentityLink, formatShortAddress } from '../utils/format'
import { ButtonWithFooter } from './ButtonWithFooter'
import { Link, Megaphone, Verified } from './icons'
import { LabeledInput } from './LabeledInput'
import { InitiateVerification } from './InitiateVerification'
import { StepDetail } from './StepDetail'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { handleError } from '../utils/errors'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { HandleNFT } from './HandleNFT'

export const NameEntryClaim = ({
  dev = false,
  cluster = 'mainnet-beta',
  wallet,
  connection,
  secondaryConnection,
  appName,
  appTwitter,
  setShowManage,
  onComplete,
}: {
  dev?: boolean
  cluster?: Cluster
  wallet: Wallet
  connection: Connection
  secondaryConnection?: Connection
  appName?: string
  appTwitter?: string
  setShowManage: (m: boolean) => void
  onComplete?: (arg0: string) => void
}) => {
  const { identity } = useWalletIdentity()
  const [verificationUrl, setVerificationUrl] = useState<string | undefined>(
    undefined
  )
  const [handle, setHandle] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verificationInitiated, setVerificationInitiated] = useState(false)

  const nameEntryData = useNameEntryData(
    secondaryConnection || connection,
    identity.name,
    handle
  )
  const handleVerify = useHandleVerify(
    wallet,
    cluster,
    dev,
    accessToken,
    setAccessToken,
    setHandle
  )
  const handleRevoke = useHandleRevoke(
    wallet,
    cluster,
    dev,
    handle,
    accessToken
  )
  const handleClaimTransaction = useHandleClaimTransaction(
    connection,
    wallet,
    cluster,
    handle,
    dev
  )

  const handleSetNamespaceDefault = useHandleSetNamespaceDefault(
    connection,
    wallet,
    cluster
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
                appName={appName}
                appTwitter={appTwitter}
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
          disabled={!handle}
          icon={<Verified />}
          title="Claim your handle"
          description={
            <>
              <div>
                You will receive a non-tradeable NFT to prove you own your
                Twitter handle.
              </div>
              {handle && verificationUrl?.length !== 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingTop: '20px',
                  }}
                >
                  <HandleNFT handle={handle} cluster={cluster} dev={dev} />
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
                        message={<div>{`Error: ${handleVerify.error}`}</div>}
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
                    {nameEntryData.isFetching || handleRevoke.isLoading ? (
                      <div className="mb-2 h-8 min-w-full animate-pulse rounded-lg bg-gray-200"></div>
                    ) : (
                      alreadyOwned &&
                      handleVerify.isSuccess &&
                      !handleRevoke.isSuccess && (
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
                                  onClick={() => setShowManage(true)}
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
                          {handleRevoke.error && (
                            <Alert
                              style={{
                                marginTop: '10px',
                                height: 'auto',
                                wordBreak: 'break-word',
                                justifyContent: 'center',
                              }}
                              message={
                                <div>{`Error: ${handleError(
                                  handleRevoke.error
                                )}`}</div>
                              }
                              type="error"
                              showIcon
                            />
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
