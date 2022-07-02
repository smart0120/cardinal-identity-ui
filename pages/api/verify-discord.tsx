import type { NextApiHandler } from 'next'

interface GetResponse {
  message?: string
  username?: string
  accessToken?: string
  error?: string
}

type ResponseParams = {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

type UserInfoParams = {
  id: string
  username: string
  avatar: string
}

const get: NextApiHandler<GetResponse> = async (req, res) => {
  let { code: code, accessToken: accessToken } = req.query
  if (!code) {
    res.status(404).send({
      message: `No code found in request URL`,
      error: 'No code found',
    })
  }

  // get access token
  const params = new URLSearchParams()
  params.append('client_id', '992004845101916191')
  params.append('client_secret', 'D5ZJTxmYUxerC5zubMk4fHSx9veuD8RG')
  params.append('grant_type', 'authorization_code')
  params.append('code', code!.toString())
  params.append(
    'redirect_uri',
    'http://localhost:3000/verification?linkingFlow=discord'
  )
  params.append('scope', 'identify')

  if (!accessToken) {
    const response = await fetch('https://discord.com/api/v10//oauth2/token', {
      method: 'POST',
      body: params,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
    const json = await response.json()
    let parsedResponse: ResponseParams | undefined
    try {
      parsedResponse = json as ResponseParams
      accessToken = parsedResponse?.access_token
    } catch (e) {
      res.status(500).send({
        message: `Error parsing server response`,
        error: 'Parse Error',
      })
    }
  }

  // get user information
  const userResponse = await fetch('http://discordapp.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const userJson = await userResponse.json()
  let parsedUserResponse: UserInfoParams | undefined
  try {
    parsedUserResponse = userJson as UserInfoParams
  } catch (e) {
    res.status(500).send({
      message: `Error parsing server response`,
      error: 'Parse Error',
    })
  }

  res.status(200).send({
    message: `Successfully verified handle ${parsedUserResponse?.username}`,
    username: parsedUserResponse?.username,
    accessToken: accessToken?.toString(),
    error: '',
  })
}

const index: NextApiHandler<GetResponse> = async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  if (request.method === 'OPTIONS') {
    return response.status(200).json({})
  }
  if (request.method !== 'GET') return response.status(405).json({})
  if (request.method === 'GET') return get(request, response)
  throw new Error(`Unexpected method ${request.method}`)
}

export default index
