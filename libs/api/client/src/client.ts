import Axios, { AxiosInstance } from 'axios'
import { fetchAzureToken } from './azure-token'
import { fetchStore } from '@gc/utils'

let axiosInstance: AxiosInstance

export const initAzureClient = () => {
  const gigyaToken = fetchStore('gigyaToken')
  const locale = fetchStore('locale')
  let accessToken = ''
  axiosInstance = Axios.create()
  axiosInstance.defaults.data = {
    locale
  }

  axiosInstance.interceptors.request.use(
    async (config) => {
      if (!accessToken) {
        accessToken = await fetchAzureToken(gigyaToken)
      }
      config.headers!['Authorization']! = `Bearer ${accessToken}`
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    async function (error) {
      if (error.response?.status !== 401) {
        return Promise.reject(error)
      }

      const originalRequest = error.config
      if (!originalRequest._retry) {
        originalRequest._retry = true
        try {
          const token = await fetchAzureToken(gigyaToken)
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`
          return axiosInstance(originalRequest)
        } catch (err) {
          return Promise.reject(new Error('Cannot fetch Azure token'))
        }
      }
      return Promise.reject(error)
    }
  )
}

export const getAzureClient: () => AxiosInstance = () => {
  if (process.env['NODE_ENV'] === 'development') {
    console.log('Get getAzureClient')
  }
  if (!axiosInstance) {
    if (process.env['NODE_ENV'] === 'test') {
      return Axios.create()
    }
    throw new Error('Azure client was not initialized!')
  }
  return axiosInstance
}
