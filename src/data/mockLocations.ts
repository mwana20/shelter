export interface LocationHierarchyNode {
  id: string;
  name: string;
  type: 'country' | 'region' | 'district' | 'subcounty' | 'neighborhood' | 'state' | 'county' | 'city' | 'ward';
  count?: number;
  children?: LocationHierarchyNode[];
}

export interface CountryAdministrativeConfig {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: string;
  labels: {
    level1: string; // e.g. "Region" or "State" or "Emirate" or "Province"
    level2: string; // e.g. "District / City" or "County" or "Municipality"
    level3: string; // e.g. "Division / Subcounty" or "City / Town" or "Area"
    level4: string; // e.g. "Village / Locality" or "Neighborhood" or "Estate"
  };
}

export const COUNTRY_ADMIN_CONFIGS: Record<string, CountryAdministrativeConfig> = {
  Uganda: {
    countryCode: 'UG',
    countryName: 'Uganda',
    flag: '🇺🇬',
    currency: 'UGX',
    labels: {
      level1: 'Region',
      level2: 'District / City',
      level3: 'Division / Subcounty',
      level4: 'Village / Parish / Locality'
    }
  },
  Kenya: {
    countryCode: 'KE',
    countryName: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    labels: {
      level1: 'Region / Province',
      level2: 'County',
      level3: 'Sub-County / Town',
      level4: 'Ward / Estate / Locality'
    }
  },
  'United Arab Emirates': {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'USD',
    labels: {
      level1: 'Emirate',
      level2: 'District / Zone',
      level3: 'Development / Sector',
      level4: 'Community / Island'
    }
  },
  'United Kingdom': {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    labels: {
      level1: 'Nation / Region',
      level2: 'County / Greater Area',
      level3: 'Borough / Town',
      level4: 'Neighborhood / Postal Area'
    }
  },
  'United States': {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    labels: {
      level1: 'State',
      level2: 'County',
      level3: 'City / Municipality',
      level4: 'Neighborhood / District'
    }
  },
  Tanzania: {
    countryCode: 'TZ',
    countryName: 'Tanzania',
    flag: '🇹🇿',
    currency: 'TZS',
    labels: {
      level1: 'Zone / Region',
      level2: 'Region / District',
      level3: 'Municipality / Town',
      level4: 'Ward / Suburb'
    }
  },
  'South Africa': {
    countryCode: 'ZA',
    countryName: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    labels: {
      level1: 'Province',
      level2: 'Metropolitan Municipality',
      level3: 'City / Region',
      level4: 'Suburb / Precinct'
    }
  }
};

export const GLOBAL_LOCATIONS: LocationHierarchyNode[] = [
  // 1. UGANDA (Global Headquarters in Mbale)
  {
    id: 'uganda',
    name: 'Uganda',
    type: 'country',
    children: [
      {
        id: 'eastern-region-ug',
        name: 'Eastern Region (Mbale HQ)',
        type: 'region',
        children: [
          {
            id: 'mbale-city',
            name: 'Mbale City (Global HQ)',
            type: 'district',
            children: [
              { id: 'senior-quarters-mbale', name: 'Senior Quarters', type: 'neighborhood' },
              { id: 'republic-street', name: 'Republic Street CBD', type: 'neighborhood' },
              { id: 'wanale-ridge', name: 'Wanale Ridge Foothills', type: 'neighborhood' },
              { id: 'industrial-division-mbale', name: 'Industrial Division', type: 'neighborhood' },
              { id: 'northern-division-mbale', name: 'Northern Division', type: 'neighborhood' },
              { id: 'nakaloke', name: 'Nakaloke Ward', type: 'neighborhood' }
            ]
          },
          {
            id: 'jinja-city',
            name: 'Jinja City',
            type: 'district',
            children: [
              { id: 'jinja-cbd', name: 'Jinja CBD & Main Street', type: 'neighborhood' },
              { id: 'walukuba', name: 'Walukuba', type: 'neighborhood' },
              { id: 'bugembe', name: 'Bugembe', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'central-region-ug',
        name: 'Central Region',
        type: 'region',
        children: [
          {
            id: 'kampala-city',
            name: 'Kampala Capital City',
            type: 'district',
            children: [
              { id: 'kololo', name: 'Kololo Residential Hill', type: 'neighborhood' },
              { id: 'naguru', name: 'Naguru Heights', type: 'neighborhood' },
              { id: 'nakasero', name: 'Nakasero Business District', type: 'neighborhood' },
              { id: 'muyenga', name: 'Muyenga Tank Hill', type: 'neighborhood' },
              { id: 'bugolobi', name: 'Bugolobi', type: 'neighborhood' }
            ]
          },
          {
            id: 'mukono-district',
            name: 'Mukono District',
            type: 'district',
            children: [
              { id: 'seeta', name: 'Seeta', type: 'neighborhood' },
              { id: 'sonde', name: 'Sonde', type: 'neighborhood' },
              { id: 'mukono-municipality', name: 'Mukono Municipality', type: 'neighborhood' },
              { id: 'namugongo', name: 'Namugongo', type: 'neighborhood' },
              { id: 'kyetume', name: 'Kyetume', type: 'neighborhood' },
              { id: 'katosi-road', name: 'Katosi Road', type: 'neighborhood' }
            ]
          },
          {
            id: 'entebbe-municipality',
            name: 'Entebbe Peninsula',
            type: 'district',
            children: [
              { id: 'lunyo', name: 'Lunyo', type: 'neighborhood' },
              { id: 'manyago', name: 'Manyago', type: 'neighborhood' },
              { id: 'entebbe-lakeview', name: 'Lake Victoria Shore', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 2. KENYA
  {
    id: 'kenya',
    name: 'Kenya',
    type: 'country',
    children: [
      {
        id: 'nairobi-metropolis',
        name: 'Nairobi Metropolis',
        type: 'region',
        children: [
          {
            id: 'nairobi-county',
            name: 'Nairobi County',
            type: 'district',
            children: [
              { id: 'westlands', name: 'Westlands Commercial Hub', type: 'neighborhood' },
              { id: 'karen', name: 'Karen Luxury Suburb', type: 'neighborhood' },
              { id: 'kilimani', name: 'Kilimani & Kileleshwa', type: 'neighborhood' },
              { id: 'runda', name: 'Runda Diplomatic Estate', type: 'neighborhood' },
              { id: 'upperhill', name: 'Upper Hill Financial District', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'coastal-kenya',
        name: 'Coast Region',
        type: 'region',
        children: [
          {
            id: 'mombasa-county',
            name: 'Mombasa County',
            type: 'district',
            children: [
              { id: 'nyali', name: 'Nyali Beachfront', type: 'neighborhood' },
              { id: 'diani', name: 'Diani Beach', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 3. UNITED ARAB EMIRATES
  {
    id: 'uae',
    name: 'United Arab Emirates',
    type: 'country',
    children: [
      {
        id: 'dubai-emirate',
        name: 'Emirate of Dubai',
        type: 'region',
        children: [
          {
            id: 'dubai-city',
            name: 'Dubai Central & Coast',
            type: 'district',
            children: [
              { id: 'downtown-dubai', name: 'Downtown Dubai (Burj Khalifa)', type: 'neighborhood' },
              { id: 'palm-jumeirah', name: 'Palm Jumeirah Island', type: 'neighborhood' },
              { id: 'dubai-marina', name: 'Dubai Marina & JBR', type: 'neighborhood' },
              { id: 'business-bay', name: 'Business Bay Waterfront', type: 'neighborhood' },
              { id: 'emirates-hills', name: 'Emirates Hills Golf Estate', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'abu-dhabi-emirate',
        name: 'Emirate of Abu Dhabi',
        type: 'region',
        children: [
          {
            id: 'abu-dhabi-central',
            name: 'Abu Dhabi Islands',
            type: 'district',
            children: [
              { id: 'saadiyat-island', name: 'Saadiyat Island Cultural District', type: 'neighborhood' },
              { id: 'yas-island', name: 'Yas Island', type: 'neighborhood' },
              { id: 'al-reem', name: 'Al Reem Island', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 4. UNITED KINGDOM
  {
    id: 'uk',
    name: 'United Kingdom',
    type: 'country',
    children: [
      {
        id: 'england-region',
        name: 'England',
        type: 'region',
        children: [
          {
            id: 'greater-london',
            name: 'Greater London',
            type: 'district',
            children: [
              { id: 'kensington-chelsea', name: 'Royal Borough of Kensington & Chelsea', type: 'neighborhood' },
              { id: 'westminster-mayfair', name: 'Westminster & Mayfair', type: 'neighborhood' },
              { id: 'canary-wharf', name: 'Canary Wharf & Isle of Dogs', type: 'neighborhood' },
              { id: 'hampstead', name: 'Hampstead & Highgate', type: 'neighborhood' }
            ]
          },
          {
            id: 'greater-manchester',
            name: 'Greater Manchester',
            type: 'district',
            children: [
              { id: 'salford-quays', name: 'Salford Quays & MediaCity', type: 'neighborhood' },
              { id: 'manchester-centre', name: 'Manchester City Centre', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 5. UNITED STATES
  {
    id: 'usa',
    name: 'United States',
    type: 'country',
    children: [
      {
        id: 'florida-state',
        name: 'Florida',
        type: 'region',
        children: [
          {
            id: 'miami-dade-county',
            name: 'Miami-Dade County',
            type: 'district',
            children: [
              { id: 'miami-beach', name: 'Miami Beach Oceanfront', type: 'neighborhood' },
              { id: 'brickell-financial', name: 'Brickell Financial District', type: 'neighborhood' },
              { id: 'coral-gables', name: 'Coral Gables Estates', type: 'neighborhood' }
            ]
          },
          {
            id: 'orange-county-fl',
            name: 'Orange County (Orlando)',
            type: 'district',
            children: [
              { id: 'winter-park', name: 'Winter Park', type: 'neighborhood' },
              { id: 'lake-nona', name: 'Lake Nona Medical City', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'california-state',
        name: 'California',
        type: 'region',
        children: [
          {
            id: 'los-angeles-county',
            name: 'Los Angeles County',
            type: 'district',
            children: [
              { id: 'beverly-hills', name: 'Beverly Hills & Bel Air', type: 'neighborhood' },
              { id: 'santa-monica', name: 'Santa Monica Beachfront', type: 'neighborhood' },
              { id: 'pasadena', name: 'Pasadena Historic District', type: 'neighborhood' }
            ]
          },
          {
            id: 'santa-clara-county',
            name: 'Santa Clara County (Silicon Valley)',
            type: 'district',
            children: [
              { id: 'palo-alto', name: 'Palo Alto', type: 'neighborhood' },
              { id: 'mountain-view', name: 'Mountain View', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'new-york-state',
        name: 'New York',
        type: 'region',
        children: [
          {
            id: 'new-york-county',
            name: 'New York County (Manhattan)',
            type: 'district',
            children: [
              { id: 'tribeca', name: 'Tribeca & Soho', type: 'neighborhood' },
              { id: 'upper-east-side', name: 'Upper East Side', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 6. TANZANIA
  {
    id: 'tanzania',
    name: 'Tanzania',
    type: 'country',
    children: [
      {
        id: 'dar-es-salaam-region',
        name: 'Dar es Salaam Region',
        type: 'region',
        children: [
          {
            id: 'kinondoni-district',
            name: 'Kinondoni Municipality',
            type: 'district',
            children: [
              { id: 'masaki-peninsula', name: 'Masaki Peninsula', type: 'neighborhood' },
              { id: 'oyster-bay', name: 'Oyster Bay Coastal', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'zanzibar-island',
        name: 'Zanzibar Archipelago',
        type: 'region',
        children: [
          {
            id: 'zanzibar-urban',
            name: 'Urban West / Stone Town',
            type: 'district',
            children: [
              { id: 'stone-town', name: 'Stone Town Heritage', type: 'neighborhood' },
              { id: 'nungwi-beach', name: 'Nungwi Beach Coast', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  },

  // 7. SOUTH AFRICA
  {
    id: 'south-africa',
    name: 'South Africa',
    type: 'country',
    children: [
      {
        id: 'western-cape-prov',
        name: 'Western Cape',
        type: 'region',
        children: [
          {
            id: 'cape-town-metro',
            name: 'City of Cape Town',
            type: 'district',
            children: [
              { id: 'camps-bay', name: 'Camps Bay Oceanfront', type: 'neighborhood' },
              { id: 'constantia', name: 'Constantia Wine Valley', type: 'neighborhood' },
              { id: 'waterfront-greenpoint', name: 'V&A Waterfront & Green Point', type: 'neighborhood' }
            ]
          }
        ]
      },
      {
        id: 'gauteng-prov',
        name: 'Gauteng',
        type: 'region',
        children: [
          {
            id: 'johannesburg-metro',
            name: 'City of Johannesburg',
            type: 'district',
            children: [
              { id: 'sandton-cbd', name: 'Sandton Financial City', type: 'neighborhood' },
              { id: 'rosebank', name: 'Rosebank & Houghton', type: 'neighborhood' }
            ]
          }
        ]
      }
    ]
  }
];

export const POPULAR_COUNTRIES = [
  'Uganda',
  'Kenya',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Tanzania',
  'South Africa'
];
