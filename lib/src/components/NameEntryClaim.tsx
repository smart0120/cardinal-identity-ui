import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useHandleClaimTransaction } from '../handlers/useHandleClaimTransaction'
import { useHandleRevoke } from '../handlers/useHandleRevoke'
import { useHandleVerify } from '../handlers/useHandleVerify'
import { useClaimRequest } from '../hooks/useClaimRequest'
import { useNameEntryData } from '../hooks/useNameEntryData'
import { useReverseEntry } from '../hooks/useReverseEntry'
import { TWITTER_NAMESPACE_NAME } from '../utils/constants'
import { formatShortAddress, formatTwitterLink } from '../utils/format'
import { ButtonWithFooter } from './ButtonWithFooter'
import { Link, Megaphone, Verified } from './icons'
import { LabeledInput } from './LabeledInput'
import { PostTweet } from './PostTweet'
import { StepDetail } from './StepDetail'
import { HandleNFT } from './HandleNFT'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export const NameEntryClaim = ({
  dev = false,
  cluster = 'mainnet-beta',
  wallet,
  connection,
  secondaryConnection,
  namespaceName = TWITTER_NAMESPACE_NAME,
  appName,
  appTwitter,
  setShowManage,
  notify,
  onComplete,
}: {
  dev?: boolean
  cluster?: Cluster
  wallet: Wallet
  connection: Connection
  secondaryConnection?: Connection
  namespaceName?: string
  appName?: string
  appTwitter?: string
  setShowManage: (m: boolean) => void
  notify?: (arg: { message?: string; txid?: string }) => void
  onComplete?: (arg0: string) => void
}) => {
  const { linkingFlow } = useWalletIdentity()
  const [verificationUrl, setVerificationUrl] = useState<string | undefined>(
    undefined
  )
  const [handle, setHandle] = useState('')
  const [claimed, setClaimed] = useState(false)
  const [verificationInitiated, setVerificationInitiated] = useState(false)

  const reverseEntry = useReverseEntry(
    connection,
    namespaceName,
    wallet?.publicKey
  )
  const nameEntryData = useNameEntryData(
    secondaryConnection || connection,
    namespaceName,
    handle
  )
  const claimRequest = useClaimRequest(
    connection,
    namespaceName,
    handle,
    wallet?.publicKey
  )

  const handleVerify = useHandleVerify(wallet, cluster, dev, setHandle)
  const handleRevoke = useHandleRevoke(wallet, cluster, dev, setHandle)
  const handleClaimTransaction = useHandleClaimTransaction(
    connection,
    wallet,
    cluster,
    dev,
    setHandle
  )

  useMemo(() => {
    if (
      verificationUrl &&
      verificationInitiated &&
      !claimRequest?.data?.parsed?.isApproved
    ) {
      handleVerify.mutate(
        { verificationUrl: verificationUrl },
        {
          onSuccess: () => claimRequest?.refetch(),
        }
      )
    }
  }, [
    wallet.publicKey.toString(),
    verificationUrl,
    handle,
    verificationInitiated,
    claimRequest.data?.pubkey.toString(),
  ])

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
          title={linkingFlow?.description.header || 'Verify'}
          description={
            <>
              <div>{linkingFlow?.description.text}</div>
              <PostTweet
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
            linkingFlow.verification?.toLocaleLowerCase() || 'verification'
          }`}
          description={
            <div>
              <LabeledInput
                disabled={!verificationInitiated}
                label={linkingFlow.verification || 'Verification'}
                name={linkingFlow.verification || 'Verification'}
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
              {handle && (
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
                        }}
                        message={<>{`${handleVerify.error}`}</>}
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
                              Verified ownership of{' '}
                              <span className="font-semibold">
                                {linkingFlow.name === 'twitter'
                                  ? formatTwitterLink(handle)
                                  : handle}
                              </span>
                            </div>
                          </>
                        }
                        type="success"
                        showIcon
                      />
                    )}
                    {nameEntryData.isFetching || claimRequest.isFetching ? (
                      <div className="mb-2 h-8 min-w-full animate-pulse rounded-lg bg-gray-200"></div>
                    ) : (
                      alreadyOwned &&
                      !claimRequest.data?.parsed.isApproved && (
                        <>
                          <Alert
                            style={{
                              marginBottom: '10px',
                              height: 'auto',
                              wordBreak: 'break-word',
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
                          wallet?.publicKey?.toString() ? (
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
                              <ButtonWrapper>
                                <ButtonLight
                                  onClick={() =>
                                    handleRevoke.mutate(
                                      { verificationUrl },
                                      {
                                        onSuccess: () => {
                                          notify &&
                                            notify({
                                              message: 'Revoke successful',
                                            })
                                          nameEntryData.refetch()
                                          claimRequest.refetch()
                                        },
                                      }
                                    )
                                  }
                                >
                                  {handleRevoke.isLoading ? (
                                    <LoadingSpinner height="15px" fill="#000" />
                                  ) : (
                                    <>Revoke</>
                                  )}
                                </ButtonLight>
                              </ButtonWrapper>
                            </>
                          )}
                          {handleRevoke.error && (
                            <Alert
                              style={{
                                marginTop: '10px',
                                height: 'auto',
                                wordBreak: 'break-word',
                              }}
                              message={
                                <>
                                  <div>{`${handleRevoke.error}`}</div>
                                </>
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
            }}
            message={
              <>
                <div>{`${handleClaimTransaction.error}`}</div>
              </>
            }
            type="error"
            showIcon
          />
        )}
      </DetailsWrapper>
      <ButtonWithFooter
        loading={handleClaimTransaction.isLoading}
        complete={claimed}
        disabled={
          !handleVerify.isSuccess ||
          (alreadyOwned && !claimRequest.data?.parsed.isApproved)
        }
        onClick={() =>
          handleClaimTransaction.mutate(
            {
              verificationUrl,
            },
            {
              onSuccess: () => {
                nameEntryData.remove()
                reverseEntry.remove()
                onComplete && onComplete(handle || '')
              },
            }
          )
        }
      >
        Claim {handle && `@${handle}`}
      </ButtonWithFooter>
    </>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 5px;
  justify-content: center;
`

const DetailsWrapper = styled.div`
  display: grid;
  grid-row-gap: 28px;
`
