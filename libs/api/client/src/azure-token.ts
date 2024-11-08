import axios from 'axios'
import { C7_ACCESS_TOKEN_URL } from '@gc/shared/env'

export const fetchAzureToken = async (gigyaToken: string) => {
  // TODO: cache token
  const response = await axios.get<AccessTokenResponse>(C7_ACCESS_TOKEN_URL, {
    headers: {
      Authorization: `Bearer ${gigyaToken}`
    }
  })
  return response.data.access_token
}

interface AccessTokenResponse {
  access_token: string
}
