import { shortPubKey } from '@cardinal/common'
import * as canvas from '@napi-rs/canvas'
import { getImageUrl, IDENTITIES, isKnownIdentity } from 'lib/src'
import type { NextApiRequest, NextApiResponse } from 'next'

const twitterCard = async (req: NextApiRequest, res: NextApiResponse) => {
  const WIDTH = 1200
  const HEIGHT = 630
  const imageCanvas = canvas.createCanvas(WIDTH, HEIGHT)

  const addressId = req.query.addressId as string | undefined
  const handle = (req.query.handle as string | undefined)?.replace('@', '')
  const identityName = req.query.i as string | undefined
  const dev = (req.query.dev as string) === 'true'

  // draw base image
  const baseImgUri = 'https://identity.cardinal.so/assets/twitter-card.png'
  const backgroundCtx = imageCanvas.getContext('2d')
  backgroundCtx.fillStyle = 'rgba(26, 27, 32, 1)'
  backgroundCtx.fillRect(0, 0, WIDTH, HEIGHT)

  function drawCircularImage(
    ctx: canvas.SKRSContext2D,
    x: number,
    y: number,
    radius: number
  ) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.closePath()
  }

  const img = await canvas.loadImage(baseImgUri)
  const imgContext = imageCanvas.getContext('2d')
  if (img.height > img.width) {
    imgContext.drawImage(img, 0, 0, WIDTH, HEIGHT)
  } else {
    imgContext.drawImage(img, 0, 0, WIDTH, HEIGHT)
  }

  const xDiff = 806

  const yDiff = 284
  const imageWidth = 182
  const imageHeight = 182

  if (handle) {
    const handleCtx = imageCanvas.getContext('2d')
    handleCtx.fillStyle = '#FFF'
    handleCtx.fillRect(xDiff - 75, yDiff + imageHeight / 2 + 20, 150, 30)
    handleCtx.font = `18px SFPro`
    handleCtx.fillStyle = '#177ddc'
    handleCtx.textAlign = 'center'
    handleCtx.textBaseline = 'middle'
    handleCtx.fillText(`@${handle}`, xDiff, yDiff + imageHeight / 2 + 35)
  }

  if (addressId) {
    const addressIdCtx = imageCanvas.getContext('2d')
    addressIdCtx.fillStyle = '#FFF'
    addressIdCtx.fillRect(
      xDiff - 75,
      yDiff + imageHeight / 2 + 20 + 28,
      150,
      30
    )
    addressIdCtx.font = `16px SFPro`
    addressIdCtx.fillStyle = '#666'
    addressIdCtx.textAlign = 'center'
    addressIdCtx.textBaseline = 'middle'
    addressIdCtx.fillText(
      shortPubKey(addressId),
      xDiff,
      yDiff + imageHeight / 2 + 35 + 28
    )
  }

  const identity =
    IDENTITIES[isKnownIdentity(identityName) ? identityName : 'twitter']
  if (identity) {
    const profileImageUri = await getImageUrl(
      identity.name,
      handle ?? addressId ?? '',
      dev
    )
    if (profileImageUri) {
      const profileImage = await canvas.loadImage(profileImageUri)
      const profileCtx = imageCanvas.getContext('2d')
      drawCircularImage(profileCtx, xDiff, yDiff, imageWidth / 2)
      profileCtx.clip()
      profileCtx.drawImage(
        profileImage,
        xDiff - imageWidth / 2,
        yDiff - imageHeight / 2,
        imageWidth,
        imageHeight
      )
    }
  }

  const buffer = imageCanvas.toBuffer('image/png')
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length,
  })
  res.end(buffer, 'binary')
}

export default twitterCard
