import type { Cluster } from '@solana/web3.js'
import type { SVGProps } from 'react'

import type { AppInfo } from '../providers/WalletIdentityProvider'
import { apiBase } from '../utils/constants'

export type IdentityName = 'twitter' | 'discord'

export function isKnownIdentity(string?: string): string is IdentityName {
  return !!string && ['twitter', 'discord'].includes(string)
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
  verificationUrl: (address?: string, appInfo?: AppInfo) => string
  verifierUrl: (
    address: string,
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
    verificationUrl: (address, appInfo) => {
      const tweetAt = appInfo?.twitter ?? appInfo?.name
      return [
        `https://twitter.com/intent/tweet?text=`,
        encodeURIComponent(
          [
            `Claiming my Twitter handle as a @Solana NFT${
              tweetAt ? ` on ${tweetAt}` : ''
            } using @cardinal_labs protocol and linking it to my address ${address}\n\n`,
            `Verify and claim yours at https://twitter.cardinal.so!`,
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
    namePrefix: '@',
    displayName: 'Twitter',
    verification: 'Tweet',
    description: {
      header: 'Tweet!',
      text: 'Tweet your public key',
    },
    colors: {
      primary: '#1da1f2',
      secondary: '#FFFFFF',
      buttonColor: '#f0f1f3',
      primaryFontColor: '#ffffff',
    },
  },
  discord: {
    name: 'discord',
    icon: ({ ...props }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={256}
        height={256}
        viewBox="0 -28.5 256 256"
        fill={
          props.variant === 'light'
            ? '#FFF'
            : props.variant === 'dark'
            ? '#000'
            : '#5865F2'
        }
        {...props}
      >
        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" />
      </svg>
    ),
    nameLink: () => `https://discord.com/channels/@me`,
    verificationUrl: () =>
      `https://discord.com/oauth2/authorize?response_type=code&client_id=992004845101916191&scope=identify&state=15773059ghq9183habn&redirect_uri=https://discord.cardinal.so/verification&prompt=consent`,
    verifierUrl: (address, proof, accessToken, cluster, dev) => {
      const urlParams = new URLSearchParams(proof)
      const code = urlParams.get('code')
      return `${apiBase(
        dev
      )}/discord/verify?publicKey=${address}&code=${code}&accessToken=${
        accessToken ?? ''
      }${cluster && `&cluster=${cluster}`}`
    },
    displayName: 'Discord',
    verification: 'Verification',
    description: {
      header: 'OAuth',
      text: 'Connect your Discord account',
    },
    colors: {
      primary: '#5866f2',
      secondary: '#36393e',
      buttonColor: '#4f545b',
      primaryFontColor: '#ffffff',
    },
  },
}
