export const quoteDetails = {
  code: '1111111111',
  billToParties: [
    {
      isPrimaryBillTo: true,
      name: 'PRIMARY FARMER',
      paymentTerm: 'Z725',
      paymentTermDescription: 'SomePay/Standard Terms-Due Month 25',
      percentage: 35,
      sapAccountId: '0009222320'
    },
    {
      isPrimaryBillTo: false,
      name: 'OTHER FARMER',
      paymentTerm: 'ZNOV',
      paymentTermDescription: 'Harvest Plan-Due November 25',
      percentage: 65,
      sapAccountId: '0009216420'
    }
  ],
  brandDiscounts: [
    {
      programId: '7000068278',
      programName: 'MY25 BRAND 1st Down F',
      programTier: {
        bayerTierId: '45'
      },
      totalDiscount: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$14.10',
        priceType: 'BUY',
        value: 14.1
      },
      type: 'BRAND_DISCOUNT'
    },
    {
      programId: '100006',
      programName: 'SomePay',
      programTier: {
        bayerTierId: '26',
        paymentTypeCode: 'BRAND Brand'
      },
      totalDiscount: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$98.66',
        priceType: 'BUY',
        value: 98.66
      },
      type: 'BRAND_DISCOUNT'
    }
  ],
  creationTime: '2024-10-17T12:12:54-05:00',
  cropLevelDetails: [
    {
      crop: 'seed_corn',
      details: {
        averagePricePerUnit: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$360.95',
          priceType: 'BUY',
          value: 360.95
        },
        discounts: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$75.10',
          priceType: 'BUY',
          value: 75.1
        },
        grossPrice: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$797.00',
          priceType: 'BUY',
          value: 797
        },
        netPrice: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$721.90',
          priceType: 'BUY',
          value: 721.9
        },
        percentageDiscount: 9.42,
        productsCount: 2
      },
      discounts: [
        {
          programId: '7000068278',
          programName: 'MY25 BRAND 1st Down F',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$7.97',
            priceType: 'BUY',
            value: 7.970000000000001
          },
          type: 'BRAND_DISCOUNT'
        },
        {
          programId: '100006',
          programName: 'SomePay',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$55.79',
            priceType: 'BUY',
            value: 55.79
          },
          type: 'BRAND_DISCOUNT'
        },
        {
          programName: 'Milk / Beef Max Discount',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          type: 'DISCRETIONARY_DISCOUNT'
        },
        {
          programName: 'Volume / Growth Discount',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          type: 'DISCRETIONARY_DISCOUNT'
        },
        {
          programName: 'Loyalty Discount',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          type: 'DISCRETIONARY_DISCOUNT'
        }
      ]
    },
    {
      crop: 'seed_soybean',
      details: {
        averagePricePerUnit: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$56.35',
          priceType: 'BUY',
          value: 56.35
        },
        discounts: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$49.00',
          priceType: 'BUY',
          value: 49
        },
        grossPrice: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$612.50',
          priceType: 'BUY',
          value: 612.5
        },
        netPrice: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$563.50',
          priceType: 'BUY',
          value: 563.5
        },
        percentageDiscount: 8,
        productsCount: 4
      },
      discounts: [
        {
          programId: '7000068278',
          programName: 'MY25 BRAND 1st Down F',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$6.13',
            priceType: 'BUY',
            value: 6.129999999999999
          },
          type: 'BRAND_DISCOUNT'
        },
        {
          programId: '100006',
          programName: 'SomePay',
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$42.87',
            priceType: 'BUY',
            value: 42.870000000000005
          },
          type: 'BRAND_DISCOUNT'
        }
      ]
    }
  ],
  entries: [
    {
      brandDiscounts: [
        {
          itemNumber: '0',
          cropName: 'Corn',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$4.19',
            priceType: 'BUY',
            value: 4.19
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$4.19',
            priceType: 'BUY',
            value: 4.19
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          cropName: 'Corn',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$29.33',
            priceType: 'BUY',
            value: 29.33
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$29.33',
            priceType: 'BUY',
            value: 29.33
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_corn',
      cropName: 'Corn',
      deliveredQuantity: 0,
      entryNumber: 10,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$385.48',
        priceType: 'BUY',
        value: 385.48
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$385.48',
        priceType: 'BUY',
        value: 385.48
      },
      netQuantity: 1,
      product: {
        code: '000000000089238846',
        name: '217-01VT2PRIB 50U BOX ELT1250 N-B-E'
      },
      quantity: 1,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$33.52',
        priceType: 'BUY',
        value: 33.519999999999996
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$419.00',
        priceType: 'BUY',
        value: 419
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    },
    {
      brandDiscounts: [
        {
          itemNumber: '3',
          cropName: 'Corn',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '4',
          cropName: 'Corn',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$26.46',
            priceType: 'BUY',
            value: 26.46
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$26.46',
            priceType: 'BUY',
            value: 26.46
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_corn',
      cropName: 'Corn',
      deliveredQuantity: 0,
      discretionaryDiscounts: [
        {
          itemNumber: '0',
          brand: 'BRAND',
          cropName: 'Corn',
          discDescription: 'Proactive Discount',
          offerReason: 'Volume / Growth Discount',
          discount: 1,
          recDiscount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:27-05:00',
          discountProgram: {
            programId: '2025-Corn_Credit_Discount',
            programName: '2025-Corn Credit Discount',
            type: 'DISCRETIONARY_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          brand: 'BRAND',
          cropName: 'Corn',
          discDescription: 'Proactive Discount',
          offerReason: 'Milk / Beef Max Discount',
          discount: 1,
          recDiscount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:27-05:00',
          discountProgram: {
            programId: '2025-Corn_Credit_Discount',
            programName: '2025-Corn Credit Discount',
            type: 'DISCRETIONARY_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '2',
          brand: 'BRAND',
          cropName: 'Corn',
          discDescription: 'Proactive Discount',
          offerReason: 'Loyalty Discount',
          discount: 1,
          recDiscount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:27-05:00',
          discountProgram: {
            programId: '2025-Corn_Credit_Discount',
            programName: '2025-Corn Credit Discount',
            type: 'DISCRETIONARY_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$3.78',
            priceType: 'BUY',
            value: 3.78
          },
          totalPercentageDiscount: 1
        }
      ],
      entryNumber: 20,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$336.42',
        priceType: 'BUY',
        value: 336.42
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$336.42',
        priceType: 'BUY',
        value: 336.42
      },
      netQuantity: 1,
      product: {
        code: '000000000089231515',
        name: '202-58SSPRIB 40U BOX ELT500 N-B-E'
      },
      quantity: 1,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$41.58',
        priceType: 'BUY',
        value: 41.58
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$378.00',
        priceType: 'BUY',
        value: 378
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    },
    {
      brandDiscounts: [
        {
          itemNumber: '0',
          cropName: 'Soybean',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$0.90',
            priceType: 'BUY',
            value: 0.9
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$0.90',
            priceType: 'BUY',
            value: 0.9
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          cropName: 'Soybean',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$6.26',
            priceType: 'BUY',
            value: 6.26
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$6.26',
            priceType: 'BUY',
            value: 6.26
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      deliveredQuantity: 0,
      entryNumber: 30,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$82.34',
        priceType: 'BUY',
        value: 82.34
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$82.34',
        priceType: 'BUY',
        value: 82.34
      },
      netQuantity: 1,
      product: {
        code: '000000000089235758',
        name: '3823RXF 40SCU BOX STAND-FI'
      },
      quantity: 1,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$7.16',
        priceType: 'BUY',
        value: 7.16
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$89.50',
        priceType: 'BUY',
        value: 89.5
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    },
    {
      brandDiscounts: [
        {
          itemNumber: '0',
          cropName: 'Soybean',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$0.72',
            priceType: 'BUY',
            value: 0.72
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$1.44',
            priceType: 'BUY',
            value: 1.44
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          cropName: 'Soybean',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$5.04',
            priceType: 'BUY',
            value: 5.04
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$10.08',
            priceType: 'BUY',
            value: 10.08
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      deliveredQuantity: 0,
      entryNumber: 40,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$132.48',
        priceType: 'BUY',
        value: 132.48
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$66.24',
        priceType: 'BUY',
        value: 66.24
      },
      netQuantity: 2,
      product: {
        code: '000000000089235073',
        name: '4023RXF/SR 40SCU BOX UNTR'
      },
      quantity: 2,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$11.52',
        priceType: 'BUY',
        value: 11.52
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$72.00',
        priceType: 'BUY',
        value: 72
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    },
    {
      brandDiscounts: [
        {
          itemNumber: '0',
          cropName: 'Soybean',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$0.73',
            priceType: 'BUY',
            value: 0.73
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$2.19',
            priceType: 'BUY',
            value: 2.19
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          cropName: 'Soybean',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$5.11',
            priceType: 'BUY',
            value: 5.11
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$15.33',
            priceType: 'BUY',
            value: 15.33
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      deliveredQuantity: 0,
      entryNumber: 50,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$201.48',
        priceType: 'BUY',
        value: 201.48
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$67.16',
        priceType: 'BUY',
        value: 67.16
      },
      netQuantity: 3,
      product: {
        code: '000000000089252121',
        name: 'CT3923E SC-BULK-FG UNTR'
      },
      quantity: 3,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$17.52',
        priceType: 'BUY',
        value: 17.52
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$73.00',
        priceType: 'BUY',
        value: 73
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    },
    {
      brandDiscounts: [
        {
          itemNumber: '0',
          cropName: 'Soybean',
          discount: 1,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '7000068278',
            programName: 'MY25 BRAND 1st Down F',
            programTier: {
              bayerTierId: '45',
              deadline: '2024-09-30T07:00:00-05:00',
              discount: 1,
              fromDate: '2024-09-01T07:00:00-05:00',
              qualification: '$5000 Down Payment',
              sortOrder: 11,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$0.40',
            priceType: 'BUY',
            value: 0.4
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$1.60',
            priceType: 'BUY',
            value: 1.6
          },
          totalPercentageDiscount: 1
        },
        {
          itemNumber: '1',
          cropName: 'Soybean',
          discount: 7,
          discountType: '%',
          status: 'PENDING',
          isActive: true,
          creationTime: '2024-10-17T12:13:33-05:00',
          discountProgram: {
            programId: '100006',
            programName: 'SomePay',
            programTier: {
              bayerTierId: '26',
              deadline: '2025-08-31T07:00:00-05:00',
              discount: 7,
              fromDate: '2024-09-01T07:00:00-05:00',
              paymentTypeCode: 'BRAND Brand',
              paymentTypeValue: 'BRAND Brand',
              sortOrder: 0,
              type: '%'
            },
            type: 'BRAND_DISCOUNT'
          },
          discountPerUnit: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$2.80',
            priceType: 'BUY',
            value: 2.8
          },
          totalDiscount: {
            currencyIso: 'USD',
            currencySymbol: '$',
            formattedValue: '$11.20',
            priceType: 'BUY',
            value: 11.2
          },
          totalPercentageDiscount: 7
        }
      ],
      cropCode: 'seed_soybean',
      cropName: 'Soybean',
      deliveredQuantity: 0,
      entryNumber: 60,
      lineItemSubTotal: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$147.20',
        priceType: 'BUY',
        value: 147.2
      },
      netPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$36.80',
        priceType: 'BUY',
        value: 36.8
      },
      netQuantity: 4,
      product: {
        code: '000000000013016764',
        name: '2691C 35SCU BOX LGM UNTR'
      },
      quantity: 4,
      rejected: false,
      remainingToDeliverQuantity: 0,
      returnQuantity: 0,
      storageLocation: {
        code: '8V2U_WH02',
        locationCode: 'WH02',
        locationName: 'BRIAN HAVLIK - BEAN',
        plant: 'SM Kimball SD - Brian Havlik'
      },
      totalDiscountPrice: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$12.80',
        priceType: 'BUY',
        value: 12.799999999999999
      },
      totalPricePerUnit: {
        currencyIso: 'USD',
        currencySymbol: '$',
        formattedValue: '$40.00',
        priceType: 'BUY',
        value: 40
      },
      warehouse: {
        code: '8V2U',
        name: 'SM Kimball SD - Brian Havlik',
        plantCode: '8V2U'
      }
    }
  ],
  expirationTime: '2024-10-31T00:00:00-05:00',
  farmer: {
    name: 'GREG ISAACS',
    uid: '0009222320',
    sapAccountId: '0009222320'
  },
  netPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    formattedValue: '$1,285.40',
    priceType: 'BUY',
    value: 1285.4
  },
  nonRejectedLineItemsCount: 6,
  paymentTerm: 'Z725',
  paymentTermDescription: 'SomePay/Standard Terms-Due Month 25',
  primaryPayer: '0009222320',
  salesYear: '2025',
  status: 'BUYER_SUBMITTED',
  statusText: 'Created',
  totalBrandDiscount: {
    currencyIso: 'USD',
    currencySymbol: '$',
    formattedValue: '$112.76',
    priceType: 'BUY',
    value: 112.75999999999999
  },
  totalDiscountPercentage: 8.8,
  totalDiscountsPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    formattedValue: '$124.10',
    priceType: 'BUY',
    value: 124.1
  },
  totalPrice: {
    currencyIso: 'USD',
    currencySymbol: '$',
    formattedValue: '$1,409.50',
    priceType: 'BUY',
    value: 1409.5
  },
  updatedTime: '2024-10-17T12:13:51-05:00',
  user: {
    name: 'Test smit',
    uid: '9146406.smit@bayer.test'
  }
}
