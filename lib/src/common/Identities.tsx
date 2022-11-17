import { IDENTITIES as knownIdentities } from '@cardinal/namespaces'
import type { Cluster } from '@solana/web3.js'
import type { SVGProps } from 'react'

import type { AppInfo } from '../providers/WalletIdentityProvider'
import { apiBase } from '../utils/constants'

export type IdentityName = 'twitter'

export function isKnownIdentity(string?: string): string is IdentityName {
  return !!string && knownIdentities.includes(string)
}

export function getIdentity(
  namespaceName: string | undefined
): Identity | undefined {
  return isKnownIdentity(namespaceName) ? IDENTITIES[namespaceName] : undefined
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  variant?: 'light' | 'dark' | 'colored'
}

export type Identity = {
  name: IdentityName
  icon: (p?: IconProps) => React.ReactNode
  nameLink: (entryName?: string) => string
  profileImage?: (
    entryName?: string,
    dev?: boolean
  ) => Promise<string | undefined>
  verificationUrl: (
    handle?: string,
    address?: string,
    appInfo?: AppInfo
  ) => string
  verifierUrl: (
    address: string,
    proof: string,
    accessToken?: string,
    cluster?: Cluster,
    dev?: boolean
  ) => string
  claimUrl: (
    handle: string,
    proof: string,
    accessToken?: string,
    cluster?: Cluster,
    dev?: boolean
  ) => string
  namePrefix?: string
  displayName?: string
  verification?: 'Verification' | 'Tweet'
  description: {
    text: string
    header?: string
  }
  colors: {
    primary: string
    secondary?: string
    buttonColor?: string
    primaryFontColor?: string
  }
}

export const IDENTITIES: {
  [key in IdentityName]: Identity
} = {
  twitter: {
    name: 'twitter',
    icon: ({ ...props }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={
          props.variant === 'light'
            ? '#FFF'
            : props.variant === 'dark'
            ? '#000'
            : '#1da1f2'
        }
        viewBox="0 0 24 24"
        width={24}
        height={24}
        {...props}
      >
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    ),
    nameLink: (n) => `https://twitter.com/${n}`,
    profileImage: async (name, dev) => {
      const response = await fetch(
        `${apiBase(
          dev
        )}/twitter/proxy?url=https://api.twitter.com/2/users/by&usernames=${name}&user.fields=profile_image_url`
      )
      const json = (await response.json()) as {
        data: { profile_image_url: string }[]
      }
      return json?.data[0]?.profile_image_url.replace('_normal', '') as string
    },
    verificationUrl: (handle, address, appInfo) => {
      const tweetAt = appInfo?.twitter ?? appInfo?.name
      return [
        `https://twitter.com/intent/tweet?text=`,
        encodeURIComponent(
          [
            `Claiming my Twitter handle as a @Solana NFT${
              tweetAt ? ` on ${tweetAt}` : ''
            } using @cardinal_labs protocol and linking it to my address ${address}\n\n`,
            `Verify and claim yours at https://twitter.cardinal.so/${
              address ?? ''
            }${handle ? `?handle=${handle}` : ''}`,
          ].join('')
        ),
      ].join('')
    },
    verifierUrl: (address, proof, _accessToken, cluster, dev) => {
      const handle = proof.split('/')[3]
      const tweetId = proof.split('/')[5]?.split('?')[0]
      return `${apiBase(
        dev
      )}/twitter/verify?tweetId=${tweetId}&publicKey=${address}&handle=${handle}${
        cluster && `&cluster=${cluster}`
      }`
    },
    claimUrl: (handle, proof, _accessToken, cluster, dev) => {
      const tweetId = proof.split('/')[5]?.split('?')[0]
      return `${apiBase(
        dev
      )}/twitter/claim?tweetId=${tweetId}&handle=${handle}${
        cluster && `&cluster=${cluster}`
      }`
    },
    namePrefix: '@',
    displayName: 'Twitter',
    verification: 'Tweet',
    description: {
      header: 'Make A Tweet!',
      text: 'Tweet your Proof Of Purity',
    },
    colors: {
      primary: '#1da1f2',
      secondary: '#FFFFFF',
      buttonColor: '#f0f1f3',
      primaryFontColor: '#ffffff',
    },
  },
}
