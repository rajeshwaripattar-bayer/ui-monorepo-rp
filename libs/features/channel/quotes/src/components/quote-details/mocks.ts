export const quoteDetails = {
  billToParties: [
    {
      isPrimaryBillTo: true,
      name: 'WECO GRAND FORKS RETAIL',
      paymentTerm: 'NF01',
      percentage: 60,
      sapAccountId: '0009126896'
    },
    {
      isPrimaryBillTo: false,
      name: 'WILBUR ELLIS EL NIDO',
      paymentTerm: 'NF02',
      percentage: 25,
      sapAccountId: '0009126895'
    },
    {
      isPrimaryBillTo: false,
      name: 'WILBUR ELLIS GREAT FALLS',
      paymentTerm: 'NF03',
      percentage: 15,
      sapAccountId: '0009126898'
    }
  ],
  code: '0000102792',
  creationTime: '03/05/2024',
  cropLevelDetails: [
    {
      crop: '',
      details: {
        averagePricePerUnit: 94,
        currency: 'USD',
        discountPrice: 90,
        grossPrice: 1500,
        netPrice: 1410,
        percentageDiscount: 6,
        productsCount: 2
      }
    },
    {
      crop: 'seed_corn',
      details: {
        averagePricePerUnit: 91.67,
        currency: 'USD',
        discountPrice: 25,
        grossPrice: 300,
        netPrice: 275,
        percentageDiscount: 8.33,
        productsCount: 2
      }
    },
    {
      crop: 'seed_soybean',
      details: {
        averagePricePerUnit: 94.09,
        currency: 'USD',
        discountPrice: 65,
        grossPrice: 1100,
        netPrice: 1035,
        percentageDiscount: 5.91,
        productsCount: 2
      }
    },
    {
      crop: 'seed_sorghum',
      details: {
        averagePricePerUnit: 93.57,
        currency: 'USD',
        discountPrice: 45,
        grossPrice: 700,
        netPrice: 655,
        percentageDiscount: 6.43,
        productsCount: 2
      }
    }
  ],
  entries: [
    {
      cropCode: 'seed_corn',
      cropName: 'Corn',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 10
        }
      ],
      entryNumber: 110,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$90.00',
        priceType: 'BUY',
        value: 90
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$90.00',
        priceType: 'BUY',
        value: 90
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$90.00',
        priceType: 'BUY',
        value: 90
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011236265',
        name: 'C.DK.DKC64-69.SAF.AR.50USP.A8.US'
      },
      quantity: 1,
      totalDiscountPercentage: 10,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$10.00',
        priceType: 'BUY',
        value: 10
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_corn',
      cropName: 'Corn',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 15
        }
      ],
      entryNumber: 210,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$185.00',
        priceType: 'BUY',
        value: 185
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$185.00',
        priceType: 'BUY',
        value: 185
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$92.50',
        priceType: 'BUY',
        value: 92.5
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000012279464',
        name: '214-00DGVT2PRIB 80M BAG BAS250'
      },
      quantity: 2,
      totalDiscountPercentage: 7.5,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$15.00',
        priceType: 'BUY',
        value: 15
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$200.00',
        priceType: 'BUY',
        value: 200
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_sorghum',
      cropName: 'Sorghum',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 20
        }
      ],
      entryNumber: 310,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$279.99',
        priceType: 'BUY',
        value: 279.99
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$280.00',
        priceType: 'BUY',
        value: 280
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$93.33',
        priceType: 'BUY',
        value: 93.33
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011132144',
        name: '6B02 50# BAG Concep'
      },
      quantity: 3,
      totalDiscountPercentage: 6.67,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$20.00',
        priceType: 'BUY',
        value: 20
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$300.00',
        priceType: 'BUY',
        value: 300
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_sorghum',
      cropName: 'Sorghum',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 25
        }
      ],
      entryNumber: 410,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$375.00',
        priceType: 'BUY',
        value: 375
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$375.00',
        priceType: 'BUY',
        value: 375
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$93.75',
        priceType: 'BUY',
        value: 93.75
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011132145',
        name: '6B02 50# BAG Concep/Poncho'
      },
      quantity: 4,
      totalDiscountPercentage: 6.25,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$25.00',
        priceType: 'BUY',
        value: 25
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$400.00',
        priceType: 'BUY',
        value: 400
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 30
        }
      ],
      entryNumber: 510,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$470.00',
        priceType: 'BUY',
        value: 470
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$470.00',
        priceType: 'BUY',
        value: 470
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$94.00',
        priceType: 'BUY',
        value: 94
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011312910',
        name: '4500R2/STS 40SCU BOX UNTR'
      },
      quantity: 5,
      totalDiscountPercentage: 6,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$30.00',
        priceType: 'BUY',
        value: 30
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$500.00',
        priceType: 'BUY',
        value: 500
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 35
        }
      ],
      entryNumber: 610,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$565.02',
        priceType: 'BUY',
        value: 565.02
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$565.00',
        priceType: 'BUY',
        value: 565
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$94.17',
        priceType: 'BUY',
        value: 94.17
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011330680',
        name: '2903R2 140M BAG AFI'
      },
      quantity: 6,
      totalDiscountPercentage: 5.83,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$35.00',
        priceType: 'BUY',
        value: 35
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$600.00',
        priceType: 'BUY',
        value: 600
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_alfalfa_lucerne',
      cropName: 'Alfalfa/Lucerne',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 40
        }
      ],
      entryNumber: 710,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$660.03',
        priceType: 'BUY',
        value: 660.03
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$660.00',
        priceType: 'BUY',
        value: 660
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$94.29',
        priceType: 'BUY',
        value: 94.29
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000011334603',
        name: 'ROUGHRIDER 50# BAG 34% Clay Coated'
      },
      quantity: 7,
      totalDiscountPercentage: 5.71,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$40.00',
        priceType: 'BUY',
        value: 40
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$700.00',
        priceType: 'BUY',
        value: 700
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    },
    {
      cropCode: 'seed_alfalfa_lucerne',
      cropName: 'Alfalfa/Lucerne',
      discountValues: [
        {
          code: 'QuoteDiscount',
          isoCode: 'USD',
          value: 50
        }
      ],
      entryNumber: 810,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$750.00',
        priceType: 'BUY',
        value: 750
      },
      netPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$750.00',
        priceType: 'BUY',
        value: 750
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$93.75',
        priceType: 'BUY',
        value: 93.75
      },
      numberOfDiscountsApplied: 1,
      product: {
        code: '000000000012220360',
        name: 'A.CL.RR440.S80.50#.34.US'
      },
      quantity: 8,
      totalDiscountPercentage: 6.25,
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$50.00',
        priceType: 'BUY',
        value: 50
      },
      totalPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$800.00',
        priceType: 'BUY',
        value: 800
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$100.00',
        priceType: 'BUY',
        value: 100
      }
    }
  ],
  expirationTime: '03/05/2025',
  farmer: {
    name: 'WECO GRAND FORKS RETAIL',
    sapAccountId: '0009126896'
  },
  name: 'Quote 0000102792',
  netPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    value: 3375
  },
  nonRejectedLineItemsCount: 8,
  paymentTerm: 'NF01',
  primaryPayer: '0009126896',
  salesYear: '2025',
  status: 'BUYER_SUBMITTED',
  statusText: 'Created',
  totalDiscountPercentage: 6.25,
  totalDiscountsPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    value: 225
  },
  totalPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    value: 3600
  },
  updatedTime: '03/05/2024',
  user: {
    name: 'CB US Test User',
    uid: '9126896.cbus@bayer.test'
  }
}
