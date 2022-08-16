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
    <div
      className="inline-block cursor-pointer text-blue-500"
      onClick={() =>
        window.open(`https://explorer.solana.com/tx/${txid}?cluster=${cluster}`)
      }
    >
      {text}
    </div>
  )
}
