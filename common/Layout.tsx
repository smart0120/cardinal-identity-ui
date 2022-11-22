import Head from 'next/head'
import { FC } from 'react'
import styled from '@emotion/styled'
import { useWallet } from '@solana/wallet-adapter-react'
import { FaHome, FaPencilAlt } from 'react-icons/fa'
import { BsShieldFillCheck, BsSnow2, BsFillMicFill } from 'react-icons/bs'
import { BiQrScan } from 'react-icons/bi'
import { MdOutlineContactMail } from 'react-icons/md'
import { AiTwotoneExperiment, AiFillSetting } from 'react-icons/ai'

import { Header } from 'common/Header'
import { PlaceholderProfile } from 'components/Profile'
import { useWalletIdentity } from 'lib/src'


interface Props {
  children: React.ReactNode,
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <div className={`fixed flex h-full w-full flex-col bg-white`}>
      <Head>
        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="twitter.cardinal.so" />
        <meta
          name="twitter:title"
          content={`Claim your ${identity?.displayName} handle on Solana!`}
        />
        <meta
          name="twitter:description"
          content={`Secure your identity on Solana by claiming your ${identity?.displayName} handle as an NFT, powered by Cardinal.`}
        />
        <meta
          name="twitter:image"
          content="https://identity.cardinal.so/assets/twitter-card.png"
        /> */}
      </Head>
      <Header />
      <nav className="flex absolute left-0 top-[50%] -translate-y-2/4 border-r-4 border-y-4 rounded-r-2xl border-black ease-in duration-300 right-sidebar cursor-pointer">
        <div className="w-full flex flex-col px-4 py-2">
          <div className="py-3 flex items-center">
            <FaHome className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Home</span>
          </div>
          <div className="py-3 flex items-center">
            <BsShieldFillCheck className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Verify Identity</span>
          </div>
          <div className="py-3 flex items-center">
            <BsSnow2 className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Mint Hub</span>
          </div>
          <div className="py-3 flex items-center">
            <BiQrScan className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Games</span>
          </div>
          <div className="py-3 flex items-center">
            <BsFillMicFill className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Prodcasts</span>
          </div>
          <div className="py-3 flex items-center">
            <FaPencilAlt className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Creator Hub</span>
          </div>
          <div className="py-3 flex items-center">
            <MdOutlineContactMail className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Vault</span>
          </div>
          <div className="py-3 flex items-center">
            <AiTwotoneExperiment className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Modifier</span>
          </div>
          <div className="py-3 flex items-center">
            <AiFillSetting className='w-8 h-8' />
            <span className='text-base font-bold navbar-text'>Preferences</span>
          </div>
        </div>
      </nav>
      <div className="p-4 overflow-auto flex h-full md:items-center">
        <div className="mx-auto md:w-[510px] w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
