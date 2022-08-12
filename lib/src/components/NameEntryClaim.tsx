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
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNameEntryData } from '../hooks/useNameEntryData'
import { formatShortAddress, formatIdentityLink } from '../utils/format'
import { ButtonWithFooter } from './ButtonWithFooter'
import { Link, Megaphone, Verified } from './icons'
import { LabeledInput } from './LabeledInput'
import { PostTweet } from './PostTweet'
import { StepDetail } from './StepDetail'
import { MasterEdition } from '@metaplex-foundation/mpl-token-metadata'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { notify } from '../common/Notification'
import { handleError } from '../utils/errors'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { HandleNFT } from './HandleNFT'

const handleFromTweetUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  return raw.split('/')[3]
}

const tweetIdFromTweetUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  return raw.split('/')[5]?.split('?')[0]
}

export const NameEntryClaim = ({
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
  const [claimed, setClaimed] = useState(false)
  const [verificationInitiated, setVerificationInitiated] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  const reverseEntry = useGlobalReverseEntry(
    connection,
    identity.name,
    wallet?.publicKey
  )
  const nameEntryData = useNameEntryData(
    secondaryConnection || connection,
    identity.name,
    handle
  )
  const claimRequest = useClaimRequest(
    connection,
    identity.name,
    handle,
    wallet?.publicKey
  )

  const handleVerify = useHandleVerify(
    wallet,
    cluster,
    accessToken,
    setAccessToken,
    setHandle
  )
  const handleRevoke = useHandleRevoke(wallet, cluster, handle, accessToken)
  const handleClaimTransaction = useHandleClaimTransaction(
    connection,
    wallet,
    cluster,
    handle,
    accessToken
  )

  const hndleSetNamespaceDefault = useHandleSetNamespaceDefault(
    connection,
    wallet,
    identity.name,
    cluster
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
          onError: (e) =>
            notify({
              message: `Failed Transaction`,
              description: e as string,
            }),
        }
      )
    } else if (verificationUrl?.length === 0) {
      setAccessToken('')
    }
  }, [
    wallet.publicKey.toString(),
    verificationUrl,
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
          title={identity?.description.header || 'Verify'}
          description={
            <>
              <div>{identity?.description.text}</div>
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
                  <HandleNFT
                    handle={handle}
                    cluster={cluster}
                    dev={cluster === 'devnet'}
                  />
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
                            <div
                              style={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              Verified ownership of{' '}
                              <span className="font-semibold">
                                {identity.name === 'twitter'
                                  ? formatIdentityLink(handle, identity.name)
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
                                          notify({
                                            message: 'Revoke successful',
                                          })
                                          nameEntryData.refetch()
                                          claimRequest.refetch()
                                        },
                                        onError: (e) => {
                                          console.log('here', e)
                                          notify({
                                            message: `Failed Transaction`,
                                            description: e as string,
                                          })
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
                                justifyContent: 'center',
                              }}
                              message={
                                <>
                                  <div>{`${handleError(
                                    handleRevoke.error
                                  )}`}</div>
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
              justifyContent: 'center',
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
        {hndleSetNamespaceDefault.error && (
          <Alert
            style={{
              height: 'auto',
              wordBreak: 'break-word',
            }}
            message={
              <>
                <div>{`${hndleSetNamespaceDefault.error}`}</div>
              </>
            }
            type="error"
            showIcon
          />
        )}
      </DetailsWrapper>
      <ButtonWithFooter
        loading={
          handleClaimTransaction.isLoading || hndleSetNamespaceDefault.isLoading
        }
        complete={claimed}
        disabled={
          !handleVerify.isSuccess ||
          verificationUrl?.length === 0 ||
          !nameEntryData.isFetched ||
          (alreadyOwned && !claimRequest.data?.parsed.isApproved)
        }
        onClick={async () => {
          let isMasterEdition = true
          if (nameEntryData.data?.nameEntry.parsed) {
            const masterEditionId = await MasterEdition.getPDA(
              nameEntryData.data?.nameEntry.parsed.mint
            )
            try {
              await MasterEdition.getInfo(connection, masterEditionId)
            } catch (e) {
              isMasterEdition = false
            }
          }
          if (!isMasterEdition) {
            hndleSetNamespaceDefault.mutate(
              {
                tokenData: { metaplexData: nameEntryData.data?.metaplexData },
                forceMigrate: true,
              },
              {
                onSuccess: () => {
                  nameEntryData.remove()
                  reverseEntry.remove()
                  onComplete && onComplete(handle || '')
                },
                onError: (e) =>
                  notify({
                    message: `Failed Transaction`,
                    description: e as string,
                  }),
              }
            )
          } else {
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
                onError: (e) =>
                  notify({
                    message: `Failed Transaction`,
                    description: e as string,
                  }),
              }
            )
          }
        }}
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
