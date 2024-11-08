import { EndpointDefinitions } from '@reduxjs/toolkit/query'
import { ApiSlice } from './api'

export type FgCcApiSlice = ApiSlice<'fgCcApi'>
export type ExtendedFgCcApiSlice<Definitions extends EndpointDefinitions> = ApiSlice<'fgCcApi', Definitions>