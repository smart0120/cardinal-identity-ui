import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export const TransactionLink = ({
  txid,
  text = 'shortly.',
}: {
  txid: string
  text?: string
}) => {
  const { cluster } = useWalletIdentity()
  return (
    <a
      className="cursor-pointer text-blue-500"
      target={`_blank`}
      onClick={() =>
        window.open(`https://explorer.solana.com/tx/${txid}?cluster=${cluster}`)
      }
      href={`https://explorer.solana.com/tx/${txid}?cluster=${cluster}`}
    >
      {text}
    </a>
  )
}
