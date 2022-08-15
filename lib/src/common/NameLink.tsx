import { getIdentity } from './Identities'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handle?: string
  namespace?: string
  children: React.ReactNode
}

export const NameLink = ({ handle, namespace, children }: Props) => {
  return (
    <div
      className={`cursor-pointer`}
      onClick={() => window.open(getIdentity(namespace)?.nameLink(handle))}
      style={{ color: '#177ddc' }}
    >
      {children}
    </div>
  )
}
