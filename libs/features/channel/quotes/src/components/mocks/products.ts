export const cornProductsResponse = {
  breadcrumbs: [
    {
      facetCode: 'crop',
      facetName: 'Crop',
      facetValueCode: 'Corn',
      facetValueName: 'Corn',
      removeQuery: {
        query: {
          value: ':relevance'
        },
        url: '/search?query=:relevance'
      }
    }
  ],
  currentQuery: {
    query: {
      value: ':relevance:crop:Corn'
    },
    url: '/search?query=:relevance:crop:Corn'
  },
  facets: [
    {
      category: false,
      code: 'specialTreatmentDescription',
      multiSelect: true,
      name: 'Treatment',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 6,
          facetName: 'specialTreatmentDescription',
          facetValue: '250+Rate',
          name: '250 Rate',
          query: {
            query: {
              value: ':relevance:crop:Corn:specialTreatmentDescription:250+Rate'
            },
            url: '/search?query=:relevance:crop:Corn:specialTreatmentDescription:250+Rate'
          },
          selected: false
        },
        {
          count: 5,
          facetName: 'specialTreatmentDescription',
          facetValue: 'Acceleron+500+%2B+B360',
          name: 'Acceleron 500 + B360',
          query: {
            query: {
              value: ':relevance:crop:Corn:specialTreatmentDescription:Acceleron+500+%2B+B360'
            },
            url: '/search?query=:relevance:crop:Corn:specialTreatmentDescription:Acceleron+500+%2B+B360'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'productTraits',
      multiSelect: false,
      name: 'Trait Code',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 3,
          facetName: 'productTraits',
          facetValue: 'SB2',
          name: 'SB2',
          query: {
            query: {
              value: ':relevance:crop:Corn:productTraits:SB2'
            },
            url: '/search?query=:relevance:crop:Corn:productTraits:SB2'
          },
          selected: false
        },
        {
          count: 6,
          facetName: 'productTraits',
          facetValue: 'SB9',
          name: 'SB9',
          query: {
            query: {
              value: ':relevance:crop:Corn:productTraits:SB9'
            },
            url: '/search?query=:relevance:crop:Corn:productTraits:SB9'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'packageType',
      multiSelect: true,
      name: 'Package Type',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 30,
          facetName: 'packageType',
          facetValue: 'Bag',
          name: 'Bag',
          query: {
            query: {
              value: ':relevance:crop:Corn:packageType:Bag'
            },
            url: '/search?query=:relevance:crop:Corn:packageType:Bag'
          },
          selected: false
        },
        {
          count: 56,
          facetName: 'packageType',
          facetValue: 'SP',
          name: 'SP',
          query: {
            query: {
              value: ':relevance:crop:Corn:packageType:SP'
            },
            url: '/search?query=:relevance:crop:Corn:packageType:SP'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'packageDescription',
      multiSelect: true,
      name: 'Package Size',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 27,
          facetName: 'packageDescription',
          facetValue: '40U',
          name: '40U',
          query: {
            query: {
              value: ':relevance:crop:Corn:packageDescription:40U'
            },
            url: '/search?query=:relevance:crop:Corn:packageDescription:40U'
          },
          selected: false
        },
        {
          count: 29,
          facetName: 'packageDescription',
          facetValue: '50U',
          name: '50U',
          query: {
            query: {
              value: ':relevance:crop:Corn:packageDescription:50U'
            },
            url: '/search?query=:relevance:crop:Corn:packageDescription:50U'
          },
          selected: false
        },
        {
          count: 30,
          facetName: 'packageDescription',
          facetValue: '80M',
          name: '80M',
          query: {
            query: {
              value: ':relevance:crop:Corn:packageDescription:80M'
            },
            url: '/search?query=:relevance:crop:Corn:packageDescription:80M'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'acronymID',
      multiSelect: false,
      name: 'Acronym Name Value',
      priority: 1000,
      searchFilter: false,
      values: [],
      visible: true
    }
  ],
  freeTextSearch: '',
  pagination: {
    currentPage: 0,
    pageSize: 50,
    sort: 'relevance',
    totalPages: 1,
    totalResults: 3
  },
  products: [
    {
      acronymID: 'PR114-20SSC',
      available: 0,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000045361189',
      crop: 'Corn',
      description: 'PR114-20SSC TRE 50USP F+I+N+B360',
      name: 'PR114-20SSC TRE 50USP F+I+N+B360',
      packageDescription: '50U',
      packageSizeCode: '87',
      packageType: 'SP',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 395.5
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '15',
      specialTreatmentCode: 'U7',
      specialTreatmentDescription: 'P500 + B360 + N314 + EDC',
      trait: 'SEL',
      canView: true,
      canOrder: false
    },
    {
      acronymID: '202-58SSPRIB',
      available: 0,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000089231477',
      crop: 'Corn',
      description: '202-58SSPRIB 40U BOX BAS500 N-B',
      name: '202-58SSPRIB 40U BOX BAS500 N-B',
      packageDescription: '40U',
      packageSizeCode: '29',
      packageType: 'SP',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 394
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '15',
      specialTreatmentCode: 'B7',
      specialTreatmentDescription: 'P500 + B360 + BASE',
      trait: 'SDW'
    },
    {
      acronymID: 'PR108-20SSCRIB',
      available: 0,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000045354220',
      crop: 'Corn',
      description: 'PR108-20SSCRIB VT2PRIB 40U BOX F+I+N+B360',
      name: 'PR108-20SSCRIB VT2PRIB 40U BOX F+I+N+B360',
      packageDescription: '40U',
      packageSizeCode: '29',
      packageType: 'SP',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 305.5
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '15',
      specialTreatmentCode: 'U7',
      specialTreatmentDescription: 'P500 + B360 + N314 + EDC',
      trait: 'SEE'
    }
  ],
  sorts: [
    {
      code: 'relevance',
      name: 'Relevance',
      selected: true
    },
    {
      code: 'name-asc',
      name: 'Name (ascending)',
      selected: false
    },
    {
      code: 'name-desc',
      name: 'Name (descending)',
      selected: false
    }
  ]
}

export const soyProductsResponse = {
  breadcrumbs: [
    {
      facetCode: 'crop',
      facetName: 'Crop',
      facetValueCode: 'Soybeans',
      facetValueName: 'Soybeans',
      removeQuery: {
        query: {
          value: ':relevance'
        },
        url: '/search?query=:relevance'
      }
    }
  ],
  currentQuery: {
    query: {
      value: ':relevance:crop:Soybeans'
    },
    url: '/search?query=:relevance:crop:Soybeans'
  },
  facets: [
    {
      category: false,
      code: 'specialTreatmentDescription',
      multiSelect: true,
      name: 'Treatment',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 2,
          facetName: 'specialTreatmentDescription',
          facetValue: 'Acc+Fung%2FILeVO',
          name: 'Acc Fung/ILeVO',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:specialTreatmentDescription:Acc+Fung%2FILeVO'
            },
            url: '/search?query=:relevance:crop:Soybeans:specialTreatmentDescription:Acc+Fung%2FILeVO'
          },
          selected: false
        },
        {
          count: 4,
          facetName: 'specialTreatmentDescription',
          facetValue: 'PYR%2BFLUX%2BMTL',
          name: 'PYR+FLUX+MTL',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:specialTreatmentDescription:PYR%2BFLUX%2BMTL'
            },
            url: '/search?query=:relevance:crop:Soybeans:specialTreatmentDescription:PYR%2BFLUX%2BMTL'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'productTraits',
      multiSelect: false,
      name: 'Trait Code',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 9,
          facetName: 'productTraits',
          facetValue: 'S00',
          name: 'S00',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:productTraits:S00'
            },
            url: '/search?query=:relevance:crop:Soybeans:productTraits:S00'
          },
          selected: false
        },
        {
          count: 5,
          facetName: 'productTraits',
          facetValue: 'SC2',
          name: 'SC2',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:productTraits:SC2'
            },
            url: '/search?query=:relevance:crop:Soybeans:productTraits:SC2'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'packageType',
      multiSelect: true,
      name: 'Package Type',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 14,
          facetName: 'packageType',
          facetValue: 'Bag',
          name: 'Bag',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:packageType:Bag'
            },
            url: '/search?query=:relevance:crop:Soybeans:packageType:Bag'
          },
          selected: false
        },
        {
          count: 1,
          facetName: 'packageType',
          facetValue: 'MB',
          name: 'MB',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:packageType:MB'
            },
            url: '/search?query=:relevance:crop:Soybeans:packageType:MB'
          },
          selected: false
        }
      ],
      visible: true
    },
    {
      category: false,
      code: 'packageDescription',
      multiSelect: true,
      name: 'Package Size',
      priority: 1000,
      searchFilter: false,
      values: [
        {
          count: 12,
          facetName: 'packageDescription',
          facetValue: '140M',
          name: '140M',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:packageDescription:140M'
            },
            url: '/search?query=:relevance:crop:Soybeans:packageDescription:140M'
          },
          selected: false
        },
        {
          count: 4,
          facetName: 'packageDescription',
          facetValue: '35SCU',
          name: '35SCU',
          query: {
            query: {
              value: ':relevance:crop:Soybeans:packageDescription:35SCU'
            },
            url: '/search?query=:relevance:crop:Soybeans:packageDescription:35SCU'
          },
          selected: false
        }
      ],
      visible: true
    }
  ],
  freeTextSearch: '',
  pagination: {
    currentPage: 0,
    pageSize: 50,
    sort: 'relevance',
    totalPages: 1,
    totalResults: 35
  },
  products: [
    {
      acronymID: '3823RXF',
      available: 0,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000089235782',
      crop: 'Soybeans',
      description: '3823RXF 40SCU BOX BASIC-F+ILEVO',
      name: '3823RXF 40SCU BOX BASIC-F+ILEVO',
      packageDescription: '40SCU',
      packageSizeCode: 'EB',
      packageType: 'SP',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 89
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '15',
      specialTreatmentCode: 'L1',
      specialTreatmentDescription: 'Acc Fung/ILeVO',
      trait: 'SD3'
    },
    {
      acronymID: '4023RXF/SR',
      available: 0,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000089235057',
      crop: 'Soybeans',
      description: '4023RXF/SR 140M BAG UNTR',
      name: '4023RXF/SR 140M BAG UNTR',
      packageDescription: '140M',
      packageSizeCode: 'DW',
      packageType: 'Bag',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 67
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '00',
      specialTreatmentCode: 'X',
      specialTreatmentDescription: 'Untreated',
      trait: 'SDX'
    }
  ],
  sorts: [
    {
      code: 'relevance',
      name: 'Relevance',
      selected: true
    },
    {
      code: 'name-asc',
      name: 'Name (ascending)',
      selected: false
    },
    {
      code: 'name-desc',
      name: 'Name (descending)',
      selected: false
    }
  ]
}
