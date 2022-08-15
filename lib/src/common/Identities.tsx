export type IdentityName = 'twitter' | 'discord'

export type Identity = {
  name: IdentityName
  icon?: string
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
    secondaryFontColor?: string
  }
}

export const IDENTITIES: {
  [key in IdentityName]: Identity
} = {
  twitter: {
    name: 'twitter',
    icon: './icons/twitter-icon.png',
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
      secondaryFontColor: '#697b89',
    },
  },
  discord: {
    name: 'discord',
    icon: './icons/discord-icon.png',
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
