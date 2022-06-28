import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useHandleClaim } from '../handlers/useHandleClaim'
import { useHandleRevoke } from '../handlers/useHandleRevoke'
import { useHandleSetDefault } from '../handlers/useHandleSetDefault'
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
import { TwitterHandleNFT } from './TwitterHandleNFT'

const handleFromTweetUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  return raw.split('/')[3]
}

const tweetIdFromTweetUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  return raw.split('/')[5]?.split('?')[0]
}

export const NameEntryClaim = ({
  dev = false,
  cluster = 'mainnet-beta',
  wallet,
  connection,
  secondaryConnection,
  namespaceName = TWITTER_NAMESPACE_NAME,
  appName,
  appTwitter,
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
  notify?: (arg: { message?: string; txid?: string }) => void
  onComplete?: (arg0: string) => void
}) => {
  const [ownedError, setOwnedError] = useState<React.ReactNode | undefined>(
    undefined
  )
  const [claimError, setClaimError] = useState<React.ReactNode | undefined>(
    undefined
  )
  const [tweetSent, setTweetSent] = useState(false)
  const [tweetUrl, setTweetUrl] = useState<string | undefined>(undefined)
  const handle = handleFromTweetUrl(tweetUrl)
  const tweetId = tweetIdFromTweetUrl(tweetUrl)
  const [claimed, setClaimed] = useState(false)

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

  const handleVerify = useHandleVerify(wallet, cluster, dev)
  const handleRevoke = useHandleRevoke(wallet, cluster, dev)
  const handleClaim = useHandleClaim(connection, wallet, namespaceName)
  const handleSetDefault = useHandleSetDefault(
    connection,
    wallet,
    namespaceName
  )

  useMemo(() => {
    if (tweetUrl && tweetSent && !claimRequest?.data?.parsed?.isApproved) {
      handleVerify.mutate(
        { tweetId, handle },
        {
          onSuccess: () => claimRequest?.refetch(),
        }
      )
    }
  }, [
    wallet.publicKey.toString(),
    tweetUrl,
    handle,
    tweetSent,
    tweetId,
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
          title="Tweet!"
          description={
            <>
              <div>Tweet your public key</div>
              <PostTweet
                wallet={wallet}
                appName={appName}
                appTwitter={appTwitter}
                disabled={false}
                callback={() => setTweetSent(true)}
                cluster={cluster}
              />
            </>
          }
        />
        <StepDetail
          disabled={!tweetSent}
          icon={<Link />}
          title="Paste the URL of the tweet"
          description={
            <div>
              <LabeledInput
                disabled={!tweetSent}
                label="Tweet"
                name="tweet"
                onChange={(e) => setTweetUrl(e.target.value)}
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
                  <TwitterHandleNFT
                    handle={handle}
                    cluster={cluster}
                    dev={dev}
                  />
                  <div
                    style={{
                      padding: '10px',
                      maxWidth: 'calc(100% - 120px - 20px)',
                    }}
                  >
                    {claimRequest && claimRequest?.data?.parsed.isApproved ? (
                      <Alert
                        style={{
                          margin: '10px 0px',
                          height: 'auto',
                          wordBreak: 'break-word',
                        }}
                        message={
                          <>
                            <div>
                              Verified ownership of {formatTwitterLink(handle)}
                            </div>
                          </>
                        }
                        type="success"
                        showIcon
                      />
                    ) : handleVerify.isLoading || claimRequest.isFetching ? (
                      <div style={{ padding: '10px' }}>
                        <LoadingSpinner fill="#000" />
                      </div>
                    ) : (
                      <>
                        <Alert
                          style={{
                            marginTop: '10px',
                            height: 'auto',
                            wordBreak: 'break-word',
                          }}
                          message={
                            <>
                              <div>{`${handleVerify.error}`}</div>
                            </>
                          }
                          type="error"
                          showIcon
                        />
                        <ButtonWrapper>
                          <ButtonLight
                            onClick={() =>
                              handleVerify.mutate(
                                { tweetId, handle },
                                { onSettled: () => claimRequest.refetch() }
                              )
                            }
                          >
                            Retry
                          </ButtonLight>
                        </ButtonWrapper>
                      </>
                    )}
                    {claimRequest &&
                      claimRequest.data?.parsed.isApproved &&
                      !claimed &&
                      (nameEntryData.isFetching || handleRevoke.isLoading ? (
                        <div style={{ padding: '10px' }}>
                          <LoadingSpinner fill="#000" />
                        </div>
                      ) : (
                        alreadyOwned && (
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
                                  You already own this handle! If you want to
                                  set it as your default, click below.
                                </div>
                                <ButtonWrapper>
                                  <ButtonLight
                                    onClick={() =>
                                      handleSetDefault.mutate(
                                        {
                                          tokenData: nameEntryData.data,
                                        },
                                        {
                                          onSuccess: (txid) => {
                                            notify &&
                                              notify({
                                                message:
                                                  'Set default successful',
                                                txid,
                                              })
                                            nameEntryData.remove()
                                          },
                                          onError: (e) =>
                                            setOwnedError(
                                              `Failed to revoke tweet url: ${e}`
                                            ),
                                        }
                                      )
                                    }
                                  >
                                    Set Default
                                  </ButtonLight>
                                </ButtonWrapper>
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
                                        { tweetId, handle },
                                        {
                                          onSuccess: () => {
                                            notify &&
                                              notify({
                                                message: 'Revoke successful',
                                              })
                                            setClaimed(true)
                                            onComplete && onComplete(handle)
                                          },
                                          onError: (e) =>
                                            setOwnedError(
                                              `Failed to set default handle: ${e}`
                                            ),
                                        }
                                      )
                                    }
                                  >
                                    Revoke
                                  </ButtonLight>
                                </ButtonWrapper>
                              </>
                            )}
                            {ownedError && (
                              <Alert
                                style={{
                                  marginTop: '10px',
                                  height: 'auto',
                                  wordBreak: 'break-word',
                                }}
                                message={
                                  <>
                                    <div>{ownedError}</div>
                                  </>
                                }
                                type="error"
                                showIcon
                              />
                            )}
                          </>
                        )
                      ))}
                    {claimError && (
                      <Alert
                        style={{
                          marginTop: '10px',
                          height: 'auto',
                          wordBreak: 'break-word',
                        }}
                        message={
                          <>
                            <div>{claimError}</div>
                          </>
                        }
                        type="error"
                        showIcon
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          }
        />
      </DetailsWrapper>
      <ButtonWithFooter
        loading={handleClaim.isLoading}
        complete={claimed}
        disabled={
          !claimRequest.data?.parsed.isApproved ||
          nameEntryData.isFetching ||
          alreadyOwned
        }
        onClick={() =>
          handleClaim.mutate(
            {
              handle,
              claimRequest: claimRequest.data,
              nameEntryData: nameEntryData.data,
            },
            {
              onError: (e) => setClaimError(`${e}`),
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
