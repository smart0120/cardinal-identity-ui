import { tryGetAccount } from '@cardinal/common'
import {
  findNamespaceId,
  formatName,
  getNameEntry,
  getReverseNameEntryForNamespace,
} from '@cardinal/namespaces'
import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import { useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { BsGlobe } from 'react-icons/bs'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import { identities, Identity } from '../common/Identities'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Tooltip } from '../common/Tooltip'
import { useHandleSetGlobalDefault } from '../handlers/useHandleSetGlobalDefault'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import { useUserNamesForNamespace } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { formatIdentityLink } from '../utils/format'
import { ConnectButton } from './ConnectButton'
import { NameEntryClaim } from './NameEntryClaim'
import { nameFromMint, NameManager } from './NameManager'
import { PoweredByFooter } from './PoweredByFooter'

export type ClaimCardProps = {
  namespaceName: string
  dev?: boolean
  cluster?: Cluster
  wallet?: Wallet
  connection?: Connection
  secondaryConnection?: Connection
  appName?: string
  appTwitter?: string
  showManage?: boolean
  onComplete?: (arg: string) => void
}

export const ClaimCard = ({
  namespaceName,
  appName,
  appTwitter,
  dev,
  cluster,
  connection,
  secondaryConnection,
  wallet,
  onComplete,
  showManage: showManageDefault,
}: ClaimCardProps) => {
  const { identity } = useWalletIdentity()
  const [globalReverseEntryError, setGlobalReverseEntryError] =
    useState<string>('')
  const [showManage, setShowManage] = useState(showManageDefault)
  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    wallet?.publicKey
  )
  const handleSetGlobalDefault = useHandleSetGlobalDefault(connection, wallet)
  return (
    <ClaimCardOuter>
      <div className="relative px-2 pb-8 md:px-8 md:pt-2">
        {identity.name === 'default' ? (
          <>
            <Instruction>
              {appName ? `${appName} uses` : 'Use'} Cardinal to link your online
              identities to your <strong>Solana</strong> address.
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
            <div className="my-5 text-center text-lg font-medium text-black">
              <hr
                style={{
                  height: '1px',
                  border: 'none',
                  color: '#333',
                  backgroundColor: '#333',
                  marginBottom: '5px',
                }}
              />
              <span>Choose the identity you want to link</span>
              <hr
                style={{
                  height: '1px',
                  border: 'none',
                  color: '#333',
                  backgroundColor: '#333',
                  marginTop: '5px',
                }}
              />
            </div>
            {(handleSetGlobalDefault.error || globalReverseEntryError) && (
              <Alert
                style={{
                  marginTop: '10px',
                  height: 'auto',
                  wordBreak: 'break-word',
                  justifyContent: 'center',
                }}
                message={
                  <>
                    <div>{`${
                      !!globalReverseEntryError
                        ? globalReverseEntryError
                        : handleError(handleSetGlobalDefault.error)
                    }`}</div>
                  </>
                }
                type="error"
                showIcon
              />
            )}
            <div className="flex flex-col gap-2">
              {Object.entries(identities).map(([name, idnt]) => {
                if (name === 'default' || !connection || !wallet) return ''
                return (
                  <div key={idnt.name}>
                    <div className="mt-5 flex flex-row justify-between">
                      <span className="flex flex-row">
                        <span className="text-lg font-semibold text-black">
                          {idnt.displayName}
                        </span>
                        {(!globalReverseEntry.data ||
                          (globalReverseEntry &&
                            globalReverseEntry.data.parsed.namespaceName !==
                              idnt.name)) && (
                          <Tooltip
                            placement="top"
                            className="my-auto ml-3 cursor-pointer"
                            title={`Set ${idnt.displayName} as your default global identity`}
                          >
                            <div
                              onClick={async () => {
                                const [namespaceId] = await findNamespaceId(
                                  idnt.name
                                )
                                const namespaceReverseEntry =
                                  await tryGetAccount(() =>
                                    getReverseNameEntryForNamespace(
                                      connection,
                                      wallet.publicKey,
                                      namespaceId
                                    )
                                  )
                                if (!namespaceReverseEntry) {
                                  setGlobalReverseEntryError(
                                    'You need to set a default handle for this identity first'
                                  )
                                } else {
                                  const nameEntry = await getNameEntry(
                                    connection,
                                    idnt.name,
                                    namespaceReverseEntry.parsed.entryName
                                  )
                                  handleSetGlobalDefault.mutate({
                                    tokenData: {
                                      nameEntryData: nameEntry,
                                    },
                                    namespaceName: idnt.name,
                                  })
                                  globalReverseEntry.refetch()
                                  setGlobalReverseEntryError('')
                                }
                              }}
                            >
                              {handleSetGlobalDefault.isLoading ? (
                                <LoadingSpinner fill={'#000'} height="15px" />
                              ) : (
                                <BsGlobe style={{ fontSize: '14px' }} />
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </span>
                      <ConnectButton
                        dev={dev}
                        wallet={wallet as Wallet}
                        connection={connection}
                        forceIdentity={idnt}
                        cluster={dev ? 'devnet' : 'mainnet-beta'}
                      />
                    </div>
                    <LinkedHandles
                      connection={connection}
                      wallet={wallet}
                      identity={idnt}
                    />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <Instruction>
              {appName ? `${appName} uses` : 'Use'} Cardinal to link your
              Twitter identity to your <strong>Solana</strong> address.
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
            {globalReverseEntry.data &&
              globalReverseEntry.data.parsed.namespaceName ===
                namespaceName && (
                <Alert
                  style={{ marginBottom: '20px', width: '100%' }}
                  message={
                    <div className="flex w-full flex-col text-center">
                      <div>
                        <span className="font-semibold">Twitter</span> is
                        configured as your{' '}
                        <span className="font-semibold">default</span> global
                        identity
                      </div>
                    </div>
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
                  connection={connection}
                  wallet={wallet}
                  namespaceName={namespaceName}
                  cluster={cluster}
                />
              ) : (
                <NameEntryClaim
                  cluster={cluster}
                  wallet={wallet}
                  connection={connection}
                  secondaryConnection={secondaryConnection}
                  appName={appName}
                  appTwitter={appTwitter}
                  setShowManage={setShowManage}
                  onComplete={onComplete}
                />
              ))}
            <PoweredByFooter />
          </>
        )}
      </div>
    </ClaimCardOuter>
  )
}

const LinkedHandles = ({
  connection,
  wallet,
  identity,
}: {
  connection: Connection
  wallet: Wallet
  identity: Identity
}) => {
  const userNamesForNamespace = useUserNamesForNamespace(
    connection,
    wallet.publicKey,
    identity.name
  )
  const namespaceReverseEntry = useNamespaceReverseEntry(
    connection,
    identity.name,
    wallet.publicKey
  )

  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)

  return (
    <>
      {userNamesForNamespace.isFetching ? (
        <div>
          <div
            style={{ height: '24px', width: '120px', marginBottom: '5px' }}
            className="animate-pulse rounded-md bg-gray-200"
          />
          <div
            style={{ height: '24px', width: '120px', marginBottom: '5px' }}
            className="animate-pulse rounded-md bg-gray-200"
          />
        </div>
      ) : userNamesForNamespace?.data &&
        userNamesForNamespace?.data.length > 0 ? (
        <div className="mt-auto">
          {userNamesForNamespace.data
            .sort((userTokenData) =>
              (globalReverseEntry.data &&
                formatName(
                  identity.name,
                  globalReverseEntry.data.parsed.entryName
                ) ===
                  formatName(
                    ...nameFromMint(
                      userTokenData.metaplexData?.parsed.data.name || '',
                      userTokenData.metaplexData?.parsed.data.uri || ''
                    )
                  )) ||
              (namespaceReverseEntry.data &&
                formatName(
                  identity.name,
                  namespaceReverseEntry.data.parsed.entryName
                ) ===
                  formatName(
                    ...nameFromMint(
                      userTokenData.metaplexData?.parsed.data.name || '',
                      userTokenData.metaplexData?.parsed.data.uri || ''
                    )
                  ))
                ? -1
                : 1
            )
            .map((userTokenData) => (
              <div
                className="cursor-point my-3 flex cursor-pointer items-center gap-3"
                style={{ fontSize: '14px' }}
              >
                {formatIdentityLink(
                  nameFromMint(
                    userTokenData.metaplexData?.parsed.data.name || '',
                    userTokenData.metaplexData?.parsed.data.uri || ''
                  )[1],
                  identity.name
                )}
                {globalReverseEntry.data &&
                formatName(
                  identity.name,
                  globalReverseEntry.data.parsed.entryName
                ) ===
                  formatName(
                    ...nameFromMint(
                      userTokenData.metaplexData?.parsed.data.name || '',
                      userTokenData.metaplexData?.parsed.data.uri || ''
                    )
                  ) ? (
                  <Tooltip
                    placement="top"
                    title={`${globalReverseEntry.data.parsed.entryName} is your default global and ${identity.displayName} identity`}
                  >
                    <div>
                      <BsGlobe />
                    </div>
                  </Tooltip>
                ) : (
                  namespaceReverseEntry.data &&
                  formatName(
                    identity.name,
                    namespaceReverseEntry.data.parsed.entryName
                  ) ===
                    formatName(
                      ...nameFromMint(
                        userTokenData.metaplexData?.parsed.data.name || '',
                        userTokenData.metaplexData?.parsed.data.uri || ''
                      )
                    ) && (
                    <Tooltip
                      placement="top"
                      className="my-auto ml-2 cursor-pointer"
                      title={` is your default ${identity.displayName} identity`}
                    >
                      <div>
                        <AiFillStar />
                      </div>
                    </Tooltip>
                  )
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-auto text-sm">No accounts linked</div>
      )}
    </>
  )
}

export const ClaimCardOuter = styled.div`
  width 100%;
  height: 100%;
  position: relative;
  margin: 0px auto;
  min-height: 200px;
  padding: 0px 20px;
`

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
