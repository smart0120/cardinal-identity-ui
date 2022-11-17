import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import type { Identity } from '../common/Identities'
import { useHandleClaim } from '../handlers/useHandleClaim'
import { useHandleVerify } from '../handlers/useHandleVerify'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNameEntryData } from '../hooks/useNameEntryData'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { formatIdentityLink, formatShortAddress } from '../utils/format'
import { ButtonWithFooter } from './ButtonWithFooter'
import { HandleNFT } from './HandleNFT'
import { Link, Megaphone, Verified } from './icons'
import { LabeledInput } from './LabeledInput'
import { StepDetail } from './StepDetail'
import { VerificationButton } from './VerificationButton'

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
  const { appInfo, setMessage } = useWalletIdentity()
  const [proof, setProof] = useState<string | undefined>(undefined)
  const [handle, setHandle] = useState<string>()
  const [accessToken, setAccessToken] = useState<string>()
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
  const handleClaimTransaction = useHandleClaim(
    connection,
    wallet,
    identity,
    handle
  )

  useMemo(() => {
    if (proof && verificationInitiated) {
      handleVerify.mutate({ proof: proof })
    } else if (proof?.length === 0) {
      handleClaimTransaction.reset()
      setMessage(undefined)
    }
  }, [wallet.publicKey.toString(), proof, verificationInitiated])

  const alreadyOwned =
    nameEntryData.data?.owner?.toString() && !nameEntryData.data?.isOwnerPDA
      ? true
      : false

  return (
    <>
      <div className="mb-6 text-center text-lg text-dark-6">
        Enroll into Proof Of Purity <b><span className='text-pink-300'>P</span><span className='text-indigo-500'>o</span><span className='text-yellow-500'>P</span></b> to get <span className='text-yellow-300'>whitelisted</span> for future mints and <b className='text-teal-500'>earn $SOL</b> by maintaining your <b className='text-rose-400'>mint streak</b>
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
      <DetailsWrapper>
        <StepDetail
          disabled={!wallet?.publicKey || !connection}
          icon={<Megaphone />}
          title={identity?.description.header || 'Verify'}
          description={
            <div>{identity?.description.text}</div>
          }
        >
          <VerificationButton
            wallet={wallet}
            identity={identity}
            disabled={false}
            handle={handle}
            callback={() => setVerificationInitiated(true)}
          />
        </StepDetail>
        <StepDetail
          disabled={!verificationInitiated}
          icon={<Link />}
          title={`Paste the URL of the ${identity.verification?.toLocaleLowerCase() || 'verification'
            }`}
          description={
            <div>
              <LabeledInput
                disabled={!verificationInitiated}
                label={identity.verification || 'Verification'}
                name={identity.verification || 'Verification'}
                onChange={(e) => setProof(e.target.value)}
              />
            </div>
          }
        >
          <ButtonLight
            className="mt-[5px] flex items-center justify-center gap-[5px] py-[5px] px-[14px] bg-teal-500 hover:bg-teal-600"
            disabled={!verificationInitiated}
          >
            <span className='text-[18px]'>
              Submit
            </span>
          </ButtonLight>
        </StepDetail>
        <StepDetail
          disabled={
            !proof ||
            proof?.length === 0 ||
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
                You will receive an Identity NFT
              </div>
              {proof && proof?.length !== 0 && (
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
        >
          <ButtonWithFooter
            loading={handleClaimTransaction.isLoading}
            complete={handleClaimTransaction.isSuccess}
            disabled={
              !handleVerify.isSuccess ||
              proof?.length === 0 ||
              nameEntryData.isFetching ||
              nameEntryData?.data?.owner?.toString() ===
              wallet?.publicKey?.toString()
            }
            onClick={async () => {
              handleClaimTransaction.mutate(
                {
                  proof,
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
            Get Popped
          </ButtonWithFooter>
        </StepDetail>
      </DetailsWrapper>
    </>
  )
}
const DetailsWrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
`
