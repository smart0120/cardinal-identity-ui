import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

interface Props {
  handle: string | undefined
  identity: Identity
}

export const HandleNFT: React.FC<Props> = ({ handle, identity }: Props) => {
  const { cluster, dev } = useWalletIdentity()
  return (
    <div>
      {!handle ? (
        <div className="h-32 w-32 animate-pulse rounded-lg bg-gray-200" />
      ) : (
        <img
          className="h-32 w-32 rounded-lg"
          style={{
            boxShadow:
              '0 10px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 10%)',
          }}
          alt={handle}
          src={encodeURI(
            `https://${
              dev ? 'dev-nft' : 'nft'
            }.cardinal.so/img/?text=@${encodeURIComponent(handle)}.${
              identity.name
            }${cluster && `&cluster=${cluster}`}`
          )}
        />
      )}
    </div>
  )
}
