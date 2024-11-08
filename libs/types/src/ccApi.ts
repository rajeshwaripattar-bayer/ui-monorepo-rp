import { EndpointDefinitions } from '@reduxjs/toolkit/query'
import { ApiSlice } from './api'

export type CCApiSlice = ApiSlice<'ccApi'>
export type ExtendedCCApiSlice<Definitions extends EndpointDefinitions> = ApiSlice<'ccApi', Definitions>
