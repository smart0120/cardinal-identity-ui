export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handle?: string
  namespace?: string
  children: React.ReactNode
}

export const NameLink = ({ handle, namespace, children }: Props) => {
  if (!handle || !namespace) return children
  if (namespace === 'twitter') {
    return (
      <a
        href={`https://twitter.com/${handle}`}
        onClick={() => window.open(`https://twitter.com/${handle}`)}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    )
  } else if (namespace === 'discord') {
    return (
      <a
        href={`https://discord.com/channels/@me`}
        onClick={() => window.open('https://discord.com/channels/@me')}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    )
  }
}
