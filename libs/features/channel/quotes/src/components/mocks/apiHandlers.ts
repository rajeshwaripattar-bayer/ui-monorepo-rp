import { HttpResponse, http } from 'msw'
import { newCart } from './cart'
import { cornProductsResponse, soyProductsResponse } from './products'
import { storageLocations } from './storage-locations'
import { discretionaryBudgets } from './discretionary-budgets'
import { bayerPrograms } from './bayer-programs'
import { quoteDetails } from './quote-details'

const cartServices = [
  http.get(/\/carts/, async () => HttpResponse.json(newCart)),
  http.put(/\/carts/, async () => HttpResponse.text('Ok')),
  http.delete(/\/carts/, async () => HttpResponse.text('Ok')),
  http.put(/\/bayer-entries/, async () => HttpResponse.text('Ok')),
  http.post(/\/bayer-entries/, async () => HttpResponse.text('Ok'))
]

const quoteServices = [
  http.post(/\/quotes/, async () => HttpResponse.text('Ok')),
  http.get(/\/quotes\/[0-9]/, async () => HttpResponse.json(quoteDetails))
]

const productServices = [
  http.get(/\/products/, async ({ request }) => {
    let response
    const url = new URL(request.url)
    const query = url.searchParams.get('query')

    if (query?.match(/:crop:Corn/)) {
      response = cornProductsResponse
    } else if (query?.match(/:crop:Soybeans/)) {
      response = soyProductsResponse
    }
    return HttpResponse.json(response)
  })
]

const discountServices = [
  http.post(/discretionary-budgets/, async () => HttpResponse.json(discretionaryBudgets)),
  http.get(/bayer-program/, async () => HttpResponse.json({ programs: bayerPrograms })),
  http.post(/recommended-range/, async () => HttpResponse.json([]))
]

const configDataServices = [http.get(/storage-locations/, async () => HttpResponse.json({ storageLocations }))]

export const handlers = [
  ...cartServices,
  ...quoteServices,
  ...productServices,
  ...configDataServices,
  ...discountServices
]
