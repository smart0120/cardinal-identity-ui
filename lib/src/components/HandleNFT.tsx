import { formatName } from '@cardinal/namespaces'
import styled from '@emotion/styled'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

interface Props {
  handle: string
  cluster?: string
  dev?: boolean
}

export const HandleNFT: React.FC<Props> = ({ handle, dev, cluster }: Props) => {
  const { identity } = useWalletIdentity()
  return (
    <Outer>
      {!handle ? (
        <div
          className="animate-pulse bg-gray-200"
          style={{ height: '156px', width: '156px', borderRadius: '50%' }}
        />
      ) : (
        <StyledImg
          alt={formatName('twitter', handle)}
          src={encodeURI(
            `https://${
              dev ? 'dev-nft' : 'nft'
            }.cardinal.so/img/?text=@${encodeURIComponent(handle)}.${
              identity.name
            }${cluster && `&cluster=${cluster}`}`
          )}
        />
      )}
    </Outer>
  )
}

const StyledImg = styled.img`
  border-radius: 10px;
  height: 120px;
  width: 120px;
  box-shadow: 0 10px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 10%);
`

const Outer = styled.div``
