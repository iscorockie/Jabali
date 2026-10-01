import { withBasePath } from '@/lib/base-path';

export interface DayItinerary {
  day: number;
  title: string;
  location: string;
  altitude: string;
  description: string;
  accommodation: string;
  meals: string;
}

export interface Expedition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'gorilla-trekking' | 'primates-wildlife' | 'savannah-safari' | 'walking-wilderness' | 'cross-border';
  categoryLabel: string;
  durationDays: number;
  maxGroupSize: number;
  difficulty: 'Moderate' | 'Challenging' | 'Easy–Moderate' | 'Strenuous';
  coordinates: string;
  primaryPark: string;
  trekkingSector?: string;
  heroImage: string;
  gallery: string[];
  basePriceUsd: number; // Base expedition price per person (excluding mandatory UWA permit fee shown transparently)
  greenSeasonDiscountUsd: number; // Discount during Apr-May & Nov emerald seasons
  gorillaPermitUsd: number; // UWA government-regulated permit ($800 Foreign Non-Resident)
  chimpPermitUsd: number; // UWA Kibale Chimp permit ($250 Foreign Non-Resident)
  permitSummary: string;
  privateVehicleUpgradePerPersonUsd: number;
  luxuryLodgeUpgradePerPersonUsd: number;
  stripeProductId: string;
  stripePriceEnvKey: string;
  featured: boolean;
  badge: string;
  summary: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: DayItinerary[];
  bestMonths: string[];
  dailyPermitQuota: number;
}

export interface BookingAddon {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  perPerson: boolean;
  badge?: string;
}

export const BOOKING_ADDONS: BookingAddon[] = [
  {
    id: 'gorilla-habituation',
    name: 'UWA 4-Hour Gorilla Habituation Upgrade (Rushaga)',
    description:
      'Spend 4 full hours alongside UWA researchers and semi-habituated mountain gorilla families instead of the standard 1-hour trek (limited to 4 guests per family).',
    priceUsd: 700,
    perPerson: true,
    badge: 'UWA Official Upgrade',
  },
  {
    id: 'aerolink-flight',
    name: 'AeroLink Bush Flight (Entebbe ↔ Kihihi/Kasese)',
    description:
      'Skip the 8-hour road transfer with a scenic 75-minute morning bush flight over Lake Victoria and the Virunga volcanoes.',
    priceUsd: 480,
    perPerson: true,
    badge: 'Most Popular',
  },
  {
    id: 'dedicated-porter-pack',
    name: 'Personal Community Porter & Trail Gear Pack',
    description:
      'Pre-arranged local Bwindi/Kibale community porter for all trekking days plus waterproof gaiters, carved eucalyptus walking staff, and dry-bag.',
    priceUsd: 65,
    perPerson: true,
  },
  {
    id: 'entebbe-arrival-night',
    name: 'Pre-Expedition Boutique Night in Entebbe + VIP Airport Fast-Track',
    description:
      'Private VIP meet-and-greet at Entebbe International Airport (EBB) and overnight at Karibu Guest House or Hotel No.5 with breakfast.',
    priceUsd: 240,
    perPerson: true,
  },
];

export const EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-bwindi-gorilla-5d',
    slug: 'bwindi-mist-mountain-gorillas',
    title: 'Bwindi Mist & Mountain Gorillas',
    subtitle: 'Intimate rainforest trekking in the ancient Buhoma & Ruhija sectors of Bwindi Impenetrable Forest',
    category: 'gorilla-trekking',
    categoryLabel: 'Gorilla Trekking',
    durationDays: 5,
    maxGroupSize: 6,
    difficulty: 'Challenging',
    coordinates: "01°02'S 29°41'E",
    primaryPark: 'Bwindi Impenetrable National Park',
    trekkingSector: 'Buhoma /Nkuringo Sector',
    heroImage: withBasePath('/images/bwindi-silverback.jpg'),
    gallery: [
      withBasePath('/images/bwindi-silverback.jpg'),
      withBasePath('/images/bwindi-gorilla-infant.jpg'),
      withBasePath('/images/bwindi-gorilla-family.jpg'),
      withBasePath('/images/luxury-lodge.jpg'),
    ],
    basePriceUsd: 3450,
    greenSeasonDiscountUsd: 350,
    gorillaPermitUsd: 800,
    chimpPermitUsd: 0,
    permitSummary: '1x UWA Mountain Gorilla Permit ($800/pp)',
    privateVehicleUpgradePerPersonUsd: 490,
    luxuryLodgeUpgradePerPersonUsd: 850,
    stripeProductId: 'prod_jabali_bwindi_5d',
    stripePriceEnvKey: 'STRIPE_PRICE_BWINDI_GORILLA_5D',
    featured: true,
    badge: 'Signature Primate Trek',
    summary:
      'Designed for travelers seeking a deeply focused, unhurried encounter with Uganda’s endangered mountain gorillas. Track a habituated family alongside our veteran UWA-certified lead naturalists, walk with Batwa forest elders, and unwind in misty timbered eco-sanctuaries perched on the Albertine Rift.',
    highlights: [
      'Guaranteed UWA Mountain Gorilla Trekking Permit in Buhoma or Nkuringo sector',
      'Optional second gorilla trek or Batwa heritage forest trail with local conservationists',
      'Private 4x4 extended-wheelbase Land Cruiser with pop-up roof & onboard refreshments',
      'Behind-the-scenes briefing with Gorilla Doctors or Ride 4 a Woman community cooperative',
      'Canoe excursion on high-altitude Lake Mutanda beneath the Virunga volcano chain',
    ],
    included: [
      '4 nights accommodation in handpicked forest eco-lodges (full board)',
      'All ground transport in custom 4x4 Safari Land Cruiser with fuel & driver-naturalist',
      'UWA Park Entrance fees, armed ranger escort, and community conservation levy',
      'Batwa cultural forest walk & Lake Mutanda dugout canoe excursion',
      'Complimentary stainless-steel field water bottle & unlimited filtered drinking water',
      'AMREF Flying Doctors emergency air evacuation coverage',
    ],
    excluded: [
      'UWA Mountain Gorilla Permit ($800 per person — itemized separately at checkout for 100% transparency)',
      'International flights into Entebbe (EBB) & Uganda Tourist Visa ($50)',
      'Optional domestic AeroLink flight upgrade ($480/pp)',
      'Personal tips for UWA rangers, porters ($20 recommended), and lodge staff',
    ],
    bestMonths: ['Jan', 'Feb', 'Jun', 'Jul', 'Aug', 'Sep', 'Dec'],
    dailyPermitQuota: 8,
    itinerary: [
      {
        day: 1,
        title: 'Entebbe to the Southwestern Highlands & Equator Crossing',
        location: 'Entebbe → Lake Mburo / Kabale Highlands',
        altitude: '1,850m',
        description:
          'Depart Entebbe at dawn in our custom 4x4 Land Cruiser (or opt for the morning AeroLink bush flight to Kihihi). Stop at the Equator line and wind through Ankole long-horned cattle country into the terraced Kigezi hills before arriving at the edge of Bwindi Impenetrable Forest.',
        accommodation: 'Mahogany Springs Lodge / Buhoma Haven Lodge',
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Into the Impenetrable Canopy — Gorilla Trekking Day',
        location: 'Buhoma Sector, Bwindi Impenetrable Forest',
        altitude: '1,500m – 2,300m',
        description:
          'Report to the UWA Ranger Headquarters at 07:30 for your sector briefing and family allocation (Rushegura, Habinyanja, or Mubare group). Follow expert trackers through ancient tree ferns and lianas until you spend one unforgettable hour within meters of a silverback and his family.',
        accommodation: 'Mahogany Springs Lodge / Buhoma Haven Lodge',
        meals: 'Breakfast, Packed Trail Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Munyaga Waterfall Trail, Batwa Forest Lore & Community Conservation',
        location: 'Buhoma → Nkuringo Ridge',
        altitude: '2,160m',
        description:
          'Morning guided botanical and birding walk along the Munyaga River trail (home to 23 Albertine Rift endemic bird species). Afternoon visit to the Ride 4 a Woman micro-enterprise project and forest interpretation walk with Batwa elders.',
        accommodation: 'Nkuringo Bwindi Gorilla Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Lake Mutanda Volcanic Panorama & Sunset Dugout Excursion',
        location: 'Lake Mutanda & Virunga Foothills',
        altitude: '1,800m',
        description:
          'Descend from the Nkuringo ridge toward crystalline Lake Mutanda, framed by the volcanic cones of Muhabura, Gahinga, and Sabinyo. Paddle across the island-dotted waters with local boatmen and enjoy a sundowner bush dinner.',
        accommodation: 'Mutanda Lake Resort / Chameleon Hill Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Return Across the Albertine Rift to Entebbe',
        location: 'Bwindi / Kisoro → Entebbe International Airport (EBB)',
        altitude: '1,135m',
        description:
          'Enjoy a leisurely breakfast overlooking the Virunga volcanoes before returning to Entebbe by scenic overland drive or 75-minute scheduled bush flight from Kisoro/Kihihi airstrip in time for evening international departures.',
        accommodation: 'Day Room Available on Request',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
  {
    id: 'exp-primate-kingdom-8d',
    slug: 'primate-kingdom-kibale-chimps-bwindi-gorillas',
    title: 'Primate Kingdom: Kibale Chimps & Bwindi Gorillas',
    subtitle: 'The definitive Ugandan primate and savannah circuit linking Kibale, Queen Elizabeth & Bwindi',
    category: 'primates-wildlife',
    categoryLabel: 'Primates & Big Game',
    durationDays: 8,
    maxGroupSize: 6,
    difficulty: 'Moderate',
    coordinates: "00°29'N 30°21'E",
    primaryPark: 'Kibale, Queen Elizabeth & Bwindi NP',
    trekkingSector: 'Kanyanchu (Kibale) & Buhoma (Bwindi)',
    heroImage: withBasePath('/images/kibale-chimpanzee.jpg'),
    gallery: [
      withBasePath('/images/kibale-chimpanzee.jpg'),
      withBasePath('/images/bwindi-gorilla-closeup.jpg'),
      withBasePath('/images/savannah-lions.webp'),
      withBasePath('/images/kazinga-elephants.jpg'),
    ],
    basePriceUsd: 5290,
    greenSeasonDiscountUsd: 490,
    gorillaPermitUsd: 800,
    chimpPermitUsd: 250,
    permitSummary: '1x Gorilla Permit ($800) + 1x Kibale Chimp Permit ($250)',
    privateVehicleUpgradePerPersonUsd: 680,
    luxuryLodgeUpgradePerPersonUsd: 1290,
    stripeProductId: 'prod_jabali_primate_8d',
    stripePriceEnvKey: 'STRIPE_PRICE_PRIMATE_KINGDOM_8D',
    featured: true,
    badge: 'Bestseller · Dual Permits',
    summary:
      'Our most sought-after 8-day expedition unites the two titans of African primatology—chimpanzee tracking in the towering fig forests of Kibale and mountain gorilla trekking in Bwindi—bridged by private boat launches on the Kazinga Channel and tracking famous tree-climbing lions in Ishasha.',
    highlights: [
      'Track habituated wild chimpanzees in Kibale Forest (home to 1,500+ chimpanzees & 12 other primate species)',
      'Private launch cruise along the Kazinga Channel amidst hundreds of hippos, buffalo, and elephants',
      'Search for the iconic fig-tree-climbing lions of Queen Elizabeth’s remote Ishasha plains',
      'Full-day mountain gorilla trekking expedition in Bwindi Impenetrable National Park',
      'Guided swamp walk in Bigodi Wetland Sanctuary spotting the Great Blue Turaco and red colobus',
    ],
    included: [
      '7 nights luxury tented camp & eco-lodge accommodation on full-board basis',
      'Custom 4x4 Toyota Land Cruiser with pop-up roof, window seats guaranteed, and fridge',
      'Private Kazinga Channel wildlife boat cruise & Ishasha game drives',
      'Bigodi Wetland community walk & Crater Lakes rim hike',
      'All UWA National Park entrance fees & armed ranger-guide fees',
      '5% Jabali Conservation & Community Levy + AMREF Air Ambulance cover',
    ],
    excluded: [
      'UWA Gorilla Permit ($800/pp) & Kibale Chimpanzee Permit ($250/pp) — calculated clearly in booking engine',
      'International flights & Uganda / East Africa Tourist Visa',
      'Optional Gorilla Habituation upgrade or domestic flights',
      'Gratuities and premium cellar wines/spirits',
    ],
    bestMonths: ['Jan', 'Feb', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Dec'],
    dailyPermitQuota: 6,
    itinerary: [
      {
        day: 1,
        title: 'Entebbe to Fort Portal & the Ndali-Kasenda Crater Lakes',
        location: 'Entebbe → Kibale Forest Rim',
        altitude: '1,520m',
        description:
          'Depart Entebbe westward past emerald tea estates and the foothills of the Rwenzori Mountains ("Mountains of the Moon"). Settle into your crater-rim lodge overlooking ancient volcanic lakes.',
        accommodation: 'Primate Lodge Kibale / Papaya Lake Lodge',
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Chimpanzee Tracking in Kibale & Bigodi Wetland Walk',
        location: 'Kanyanchu Trailhead, Kibale National Park',
        altitude: '1,400m',
        description:
          'Enter the rainforest at dawn listening for pant-hoots echoing through the ironwood trees. Spend an hour observing wild chimpanzees feeding, grooming, and patrolling, followed by an afternoon primate and bird walk in community-run Bigodi Wetland.',
        accommodation: 'Primate Lodge Kibale / Papaya Lake Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Across the Equator into Queen Elizabeth National Park',
        location: 'Kibale → Kasenyi Plains, Queen Elizabeth NP',
        altitude: '950m',
        description:
          'Descend the Rift Valley escarpment into Queen Elizabeth National Park. Afternoon game drive across the Kasenyi mating grounds tracking Uganda kob, lions, leopards, and large elephant herds.',
        accommodation: 'Kyambura Gorge Lodge / Mweya Safari Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Savannah Dawn Drive & Kazinga Channel Private Boat Safari',
        location: 'Kazinga Channel, Queen Elizabeth NP',
        altitude: '915m',
        description:
          'Early predator tracking on the Kasenyi tracks, followed by an afternoon boat cruise on the natural Kazinga Channel linking Lake George and Lake Edward—boasting the highest concentration of hippos in Africa.',
        accommodation: 'Kyambura Gorge Lodge / Ishasha Wilderness Camp',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Tree-Climbing Lions of Ishasha to Bwindi Impenetrable Forest',
        location: 'Ishasha Sector → Buhoma Sector, Bwindi',
        altitude: '1,480m',
        description:
          'Game drive through the southern Ishasha sector where prides of lions lounge in the gnarled branches of giant sycamore fig trees. Continue into the mist-shrouded hills of Bwindi.',
        accommodation: 'Buhoma Lodge / Sanctuary Gorilla Forest Camp',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Mountain Gorilla Trekking in Bwindi Impenetrable Forest',
        location: 'Buhoma Sector, Bwindi',
        altitude: '1,500m – 2,250m',
        description:
          'The pinnacle of your East African journey. Hike with UWA trackers into the emerald heart of Bwindi to sit quietly with a habituated mountain gorilla family. Receive your official UWA Gorilla Trekking Certificate in the afternoon.',
        accommodation: 'Buhoma Lodge / Sanctuary Gorilla Forest Camp',
        meals: 'Breakfast, Packed Lunch, Dinner',
      },
      {
        day: 7,
        title: 'Bwindi Community Hospital Visit & Transfer to Lake Mburo',
        location: 'Bwindi → Lake Mburo National Park',
        altitude: '1,250m',
        description:
          'Tour Dr. Scott Kellerman’s pioneering Bwindi Community Hospital and Conservation Through Public Health HQ before journeying east to acacia-dotted Lake Mburo for a night game drive in search of leopards and bushbabies.',
        accommodation: 'Mihingo Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 8,
        title: 'Walking Safari with Giraffes & Return to Entebbe',
        location: 'Lake Mburo → Entebbe International Airport',
        altitude: '1,135m',
        description:
          'Set out on foot at sunrise with an armed UWA ranger to track Rothschild’s giraffes, Burchell’s zebras, and eland at eye level before returning to Entebbe by late afternoon.',
        accommodation: 'Departure',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
  {
    id: 'exp-great-rift-nile-7d',
    slug: 'great-rift-nile-safari-murchison-queen-elizabeth',
    title: 'Great Rift & Nile Safari: Murchison to Queen Elizabeth',
    subtitle: 'White rhinos on foot, the thunderous Victoria Nile gorge, and classic Albertine Rift big game',
    category: 'savannah-safari',
    categoryLabel: 'Classic Game & Nile',
    durationDays: 7,
    maxGroupSize: 6,
    difficulty: 'Easy–Moderate',
    coordinates: "02°16'N 31°41'E",
    primaryPark: 'Murchison Falls & Queen Elizabeth NP',
    trekkingSector: 'Ziwa Rhino Sanctuary & Victoria Nile Delta',
    heroImage: withBasePath('/images/murchison-falls.jpg'),
    gallery: [
      withBasePath('/images/murchison-falls.jpg'),
      withBasePath('/images/kazinga-elephants.jpg'),
      withBasePath('/images/safari-land-cruiser.jpg'),
      withBasePath('/images/queen-elizabeth-savannah.webp'),
    ],
    basePriceUsd: 3890,
    greenSeasonDiscountUsd: 390,
    gorillaPermitUsd: 0,
    chimpPermitUsd: 0,
    permitSummary: 'Includes Ziwa Rhino Foot Permit & Murchison Boat Launches (No Gorilla Permit Required)',
    privateVehicleUpgradePerPersonUsd: 520,
    luxuryLodgeUpgradePerPersonUsd: 980,
    stripeProductId: 'prod_jabali_rift_7d',
    stripePriceEnvKey: 'STRIPE_PRICE_GREAT_RIFT_NILE_7D',
    featured: true,
    badge: 'Big Five & Victoria Nile',
    summary:
      'Experience the raw power of the Victoria Nile plunging 43 meters through a 7-meter cleft at Murchison Falls, track southern white rhinos on foot at Ziwa Sanctuary, search for the prehistoric Shoebill stork in the Nile Delta, and cruise the wildlife-rich Kazinga Channel.',
    highlights: [
      'Track endangered southern white rhinos on foot with rangers at Ziwa Rhino Sanctuary',
      'Hike to the top of Murchison Falls where the world’s longest river explodes through Devil’s Cauldron',
      'Private boat expedition to the Lake Albert Nile Delta searching for the elusive Shoebill stork',
      'Borassus palm savannah game drives teeming with Rothschild’s giraffes, lions, and Jackson’s hartebeest',
      'Budongo Forest mahogany walk & Queen Elizabeth National Park Kazinga Channel launch',
    ],
    included: [
      '6 nights full-board accommodation in riverfront and crater-edge safari lodges',
      'All game drives in 4x4 Land Cruiser with Swarovski spotting scope & field library on board',
      'Ziwa Rhino on-foot tracking permit & Budongo Royal Mile birding walk',
      'Upstream Murchison Falls boat cruise & Kazinga Channel wildlife cruise',
      'All UWA park fees, ferry crossings, and conservation levies',
    ],
    excluded: [
      'International airfare & Uganda visa',
      'Optional Budongo Chimpanzee tracking permit ($130/pp if requested)',
      'Personal insurance and gratuities',
    ],
    bestMonths: ['Jan', 'Feb', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep', 'Dec'],
    dailyPermitQuota: 10,
    itinerary: [
      {
        day: 1,
        title: 'Entebbe to Ziwa Rhino Sanctuary & Murchison Falls',
        location: 'Nakasongola → Murchison Falls NP',
        altitude: '1,050m',
        description:
          'Drive north from Entebbe to Ziwa Rhino Sanctuary—home to Uganda’s only wild southern white rhinos. Track rhinos on foot with dedicated rangers before crossing the Victoria Nile into Murchison Falls National Park.',
        accommodation: 'Nile Safari Lodge / Paraa Safari Lodge',
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Buligi Peninsula Game Drive & Launch to the Devil’s Cauldron',
        location: 'Northern Bank & Victoria Nile, Murchison Falls',
        altitude: '650m',
        description:
          'Dawn safari across the Borassus palm plains of the Buligi circuit tracking lions, leopards, oribi, and Patas monkeys. Afternoon river launch upstream to the base of Murchison Falls followed by a guided hike to the top of the gorge.',
        accommodation: 'Nile Safari Lodge / Paraa Safari Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: ' Albert Nile Delta Shoebill Expedition & Budongo Mahogany Forest',
        location: 'Lake Albert Delta & Budongo Escarpment',
        altitude: '620m – 1,100m',
        description:
          'Morning boat voyage downriver into the papyrus wetlands of the Lake Albert delta to spot the prehistoric Shoebill stork, Goliath heron, and Nile crocodiles. Afternoon walk beneath 80-meter ironwood trees in Budongo Forest.',
        accommodation: 'Bakers Lodge / Kabalega Wilderness Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Along the Albertine Rift Escarpment to Fort Portal',
        location: 'Murchison Falls → Fort Portal Highlands',
        altitude: '1,500m',
        description:
          'Journey south along the dramatic Lake Albert escarpment with views into the Congo Blue Mountains, arriving at the lush tea plantations and volcanic crater lakes of Fort Portal.',
        accommodation: 'Kyaninga Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Rwenzori Foothills to Queen Elizabeth National Park',
        location: 'Fort Portal → Queen Elizabeth NP',
        altitude: '950m',
        description:
          'Morning walk around Lake Kyaninga before descending into Queen Elizabeth National Park for an afternoon crater drive through the Baboon Cliffs and explosion craters.',
        accommodation: 'Mweya Safari Lodge / Katara Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Kasenyi Predator Tracking & Kazinga Channel Sundowner Cruise',
        location: 'Kasenyi & Kazinga Channel',
        altitude: '915m',
        description:
          'Full day dedicated to Queen Elizabeth’s diverse ecosystems: morning big-cat tracking on the Kasenyi plains and a private golden-hour boat safari on the Kazinga Channel.',
        accommodation: 'Mweya Safari Lodge / Katara Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 7,
        title: 'Ankole Cattle Country & Return to Entebbe',
        location: 'Queen Elizabeth NP → Entebbe',
        altitude: '1,135m',
        description:
          'Return to Entebbe via the Igongo cultural heartland and the Equator crossing, arriving in time for evening flights or post-safari relaxation on Lake Victoria.',
        accommodation: 'Departure',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
  {
    id: 'exp-kidepo-walking-6d',
    slug: 'kidepo-valley-karamoja-walking-expedition',
    title: 'Kidepo Valley & Karamoja Walking Expedition',
    subtitle: 'Untamed frontier walking safaris, Narus Valley predators, and Ik mountain encounters in far-north Uganda',
    category: 'walking-wilderness',
    categoryLabel: 'Walking & Frontier',
    durationDays: 6,
    maxGroupSize: 6,
    difficulty: 'Challenging',
    coordinates: "03°54'N 33°51'E",
    primaryPark: 'Kidepo Valley National Park',
    trekkingSector: 'Narus Valley & Mount Morungole',
    heroImage: withBasePath('/images/kidepo-valley.jpg'),
    gallery: [
      withBasePath('/images/kidepo-valley.jpg'),
      withBasePath('/images/safari-land-cruiser.jpg'),
      withBasePath('/images/lion-cub.webp'),
      withBasePath('/images/queen-elizabeth-savannah.webp'),
    ],
    basePriceUsd: 4650,
    greenSeasonDiscountUsd: 400,
    gorillaPermitUsd: 0,
    chimpPermitUsd: 0,
    permitSummary: 'Includes UWA Armed Ranger Walking Permits & Karamoja Community Fees',
    privateVehicleUpgradePerPersonUsd: 590,
    luxuryLodgeUpgradePerPersonUsd: 1150,
    stripeProductId: 'prod_jabali_kidepo_6d',
    stripePriceEnvKey: 'STRIPE_PRICE_KIDEPO_WALKING_6D',
    featured: true,
    badge: 'Remote Wilderness · Fly-In',
    summary:
      'Ranked among Africa’s purest last wildernesses, Kidepo Valley lies tucked in Uganda’s rugged northeast borderlands with South Sudan and Kenya. Track 4,000-strong buffalo herds, cheetahs, and ostriches on foot with armed rangers, and hike Mount Morungole to meet the indigenous Ik people.',
    highlights: [
      'Round-trip scenic charter/scheduled bush flight from Entebbe to Kidepo Airstrip included',
      'Guided multi-hour walking safaris across the dry Kidepo River sandbed & Borassus palm oases',
      'Spot wildlife found nowhere else in Uganda: cheetahs, bat-eared foxes, caracals, and Kori bustards',
      'Full-day ridge hike up Mount Morungole (2,750m) for a respectful cultural exchange with the Ik community',
      'Sundowners atop inselberg kopjes overlooking the Narus Valley without another vehicle in sight',
    ],
    included: [
      'Round-trip bush flights Entebbe ↔ Kidepo Valley (Apoka Airstrip)',
      '5 nights full-board accommodation at Apoka Safari Lodge / Adere Safari Lodge',
      'Daily armed UWA ranger walking safaris & open-sided 4x4 game drives',
      'Mount Morungole Ik cultural hike & Karamojong manyatta visit',
      'All park entrance fees, conservation levies, and flying doctors cover',
    ],
    excluded: [
      'International flights & Uganda visa',
      'Personal trekking boots and gratuities',
    ],
    bestMonths: ['Jan', 'Feb', 'Mar', 'Sep', 'Oct', 'Nov', 'Dec'],
    dailyPermitQuota: 8,
    itinerary: [
      {
        day: 1,
        title: 'Bush Flight from Entebbe Across the Nile to Kidepo Valley',
        location: 'Entebbe → Apoka Airstrip, Kidepo Valley NP',
        altitude: '1,180m',
        description:
          'Board our morning bush aircraft from Entebbe, flying low over Lake Kyoga and the dramatic granitic inselbergs of Karamoja. Land in the heart of Kidepo Valley for an afternoon game drive in the Narus Valley.',
        accommodation: 'Apoka Safari Lodge',
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Narus Valley Dawn Walk & Kopje Lion Tracking',
        location: 'Narus Valley, Kidepo NP',
        altitude: '1,150m',
        description:
          'Step out on foot at sunrise alongside an armed UWA tracker and Jabali lead naturalist. Read spoor in the dust, observe Rothschild’s giraffes and zebras from ground level, and track lions perched on granite kopjes.',
        accommodation: 'Apoka Safari Lodge',
        meals: 'Breakfast, Bush Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Kidepo Sand River Expedition & Kanangarok Hot Springs',
        location: 'Kidepo Valley & South Sudan Frontier',
        altitude: '1,020m',
        description:
          'Venture north across the 50-meter-wide dry Kidepo River bed lined with rustling Borassus palms toward the Kanangarok Hot Springs, searching for wild ostriches, secretary birds, and cheetah.',
        accommodation: 'Apoka Safari Lodge',
        meals: 'Breakfast, Packed Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Mount Morungole Trek & the Indigenous Ik Community',
        location: 'Mount Morungole (2,750m)',
        altitude: '2,400m',
        description:
          'Embark on a rewarding full-day mountain trek into the Morungole range to visit the Ik—one of East Africa’s smallest and earliest indigenous mountain communities, guided by local Ik interpreters.',
        accommodation: 'Apoka Safari Lodge',
        meals: 'Breakfast, Trail Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Karamojong Pastoralist Heritage & Night Spotlight Drive',
        location: 'Kawolakol & Narus Plains',
        altitude: '1,200m',
        description:
          'Morning visit to a traditional Karamojong homestead (manyatta) to learn about pastoralist ecology and cattle lore. After dusk, head out with a red-filter spotlight to find aardwolf, striped hyena, and white-tailed mongoose.',
        accommodation: 'Apoka Safari Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Final Sunrise Walk & Charter Return to Entebbe',
        location: 'Kidepo Valley → Entebbe (EBB)',
        altitude: '1,135m',
        description:
          'Savor a final bush breakfast overlooking the Narus waterhole before boarding your return flight to Entebbe International Airport.',
        accommodation: 'Departure',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
  {
    id: 'exp-pearl-circuit-12d',
    slug: 'ultimate-pearl-of-africa-grand-circuit',
    title: 'Ultimate Pearl of Africa Grand Circuit',
    subtitle: 'A comprehensive 12-day expedition across Murchison Falls, Kibale, Queen Elizabeth, Bwindi & Lake Mburo',
    category: 'primates-wildlife',
    categoryLabel: 'Grand Expedition',
    durationDays: 12,
    maxGroupSize: 6,
    difficulty: 'Moderate',
    coordinates: "00°18'N 31°12'E",
    primaryPark: '5 National Parks across Western Uganda',
    trekkingSector: 'Kibale (Kanyanchu) + Bwindi (Buhoma/Rushaga)',
    heroImage: withBasePath('/images/bwindi-gorilla-family.jpg'),
    gallery: [
      withBasePath('/images/bwindi-gorilla-family.jpg'),
      withBasePath('/images/murchison-falls.jpg'),
      withBasePath('/images/kibale-chimpanzee.jpg'),
      withBasePath('/images/savannah-lions.webp'),
    ],
    basePriceUsd: 7950,
    greenSeasonDiscountUsd: 750,
    gorillaPermitUsd: 800,
    chimpPermitUsd: 250,
    permitSummary: '1x Gorilla Permit ($800) + 1x Kibale Chimp Permit ($250) + Ziwa Rhino Permit',
    privateVehicleUpgradePerPersonUsd: 950,
    luxuryLodgeUpgradePerPersonUsd: 1890,
    stripeProductId: 'prod_jabali_pearl_12d',
    stripePriceEnvKey: 'STRIPE_PRICE_PEARL_CIRCUIT_12D',
    featured: false,
    badge: 'Complete 5-Park Odyssey',
    summary:
      'For travelers who want the complete story of Uganda in one seamless arc. From tracking white rhinos on foot and feeling the spray of Murchison Falls to chimpanzee habituation walks in Kibale, tree-climbing lions in Ishasha, and mountain gorillas in Bwindi.',
    highlights: [
      'Covers all five of western Uganda’s flagship national parks at an unhurried, photographer-friendly pace',
      'Includes Ziwa Rhino tracking, Murchison Nile cruise, Kibale Chimps, Kazinga boat, and Bwindi Gorillas',
      'Stay in Uganda’s finest conservation-driven lodges from the Victoria Nile to Lake Mutanda',
      'Led from start to finish by a senior Jabali master naturalist and ornithologist',
    ],
    included: [
      '11 nights full-board accommodation across 5 national parks',
      'Private or max-6-guest 4x4 extended Land Cruiser with unlimited mileage',
      'All park entrance fees, 2 private boat cruises, Ziwa rhino trek & Bigodi wetland walk',
      'Domestic return bush flight from Kihihi (Bwindi) to Entebbe on Day 12',
    ],
    excluded: [
      'UWA Gorilla Permit ($800/pp) & Kibale Chimp Permit ($250/pp) — itemized at checkout',
      'International airfare & visa',
    ],
    bestMonths: ['Jan', 'Feb', 'Jun', 'Jul', 'Aug', 'Sep', 'Dec'],
    dailyPermitQuota: 6,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Entebbe & Lake Victoria Botanical Briefing',
        location: 'Entebbe',
        altitude: '1,135m',
        description: 'VIP airport pickup at Entebbe International Airport and private expedition briefing at your boutique hotel.',
        accommodation: 'Hotel No.5 Entebbe',
        meals: 'Dinner',
      },
      {
        day: 2,
        title: 'Ziwa White Rhino Tracking & Murchison Falls',
        location: 'Ziwa → Murchison Falls NP',
        altitude: '1,050m',
        description: 'Track southern white rhinos on foot before continuing to the banks of the Victoria Nile.',
        accommodation: 'Nile Safari Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Murchison Northern Bank & Top of the Falls Hike',
        location: 'Murchison Falls NP',
        altitude: '650m',
        description: 'Morning savannah game drive and afternoon boat launch to the base of Murchison Falls.',
        accommodation: 'Nile Safari Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Lake Albert Delta Shoebill Search & Escarpment Drive',
        location: 'Murchison → Hoima / Kibale Rim',
        altitude: '1,300m',
        description: 'Dawn delta boat trip followed by scenic transfer south along the Albertine Rift.',
        accommodation: 'Kyaninga Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Kibale Chimpanzee Tracking & Crater Lakes Walk',
        location: 'Kibale Forest National Park',
        altitude: '1,500m',
        description: 'Morning chimpanzee tracking in Kanyanchu sector and afternoon crater rim hike.',
        accommodation: 'Papaya Lake Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Bigodi Wetland & Queen Elizabeth Explosion Craters',
        location: 'Kibale → Queen Elizabeth NP',
        altitude: '950m',
        description: 'Morning birding in Bigodi Swamp before crossing the Equator into Queen Elizabeth NP.',
        accommodation: 'Kyambura Gorge Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 7,
        title: 'Kasenyi Plains & Kazinga Channel Private Launch',
        location: 'Queen Elizabeth NP',
        altitude: '915m',
        description: 'Track lions and elephants in the morning and cruise the Kazinga Channel at sunset.',
        accommodation: 'Kyambura Gorge Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 8,
        title: 'Ishasha Tree-Climbing Lions to Bwindi Impenetrable Forest',
        location: 'Ishasha → Buhoma Sector, Bwindi',
        altitude: '1,550m',
        description: 'Search for tree-climbing lions in Ishasha before ascending into Bwindi.',
        accommodation: 'Sanctuary Gorilla Forest Camp',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 9,
        title: 'Bwindi Mountain Gorilla Trekking Experience',
        location: 'Bwindi Impenetrable Forest',
        altitude: '2,100m',
        description: 'Full-day mountain gorilla tracking with UWA rangers and trackers.',
        accommodation: 'Sanctuary Gorilla Forest Camp',
        meals: 'Breakfast, Packed Lunch, Dinner',
      },
      {
        day: 10,
        title: 'Batwa Cultural Trail & Transfer to Lake Mburo',
        location: 'Bwindi → Lake Mburo NP',
        altitude: '1,250m',
        description: 'Morning Batwa forest experience before heading east to Lake Mburo National Park.',
        accommodation: 'Mihingo Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 11,
        title: 'Walking Safari, Horseback Ride & Night Leopard Drive',
        location: 'Lake Mburo NP',
        altitude: '1,250m',
        description: 'Walk among giraffes and zebras in the morning and join a nocturnal spotlight drive after dinner.',
        accommodation: 'Mihingo Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 12,
        title: 'Return to Entebbe & International Departure',
        location: 'Lake Mburo → Entebbe (EBB)',
        altitude: '1,135m',
        description: 'Transfer to Entebbe with Equator stop and day-room access before your evening flight.',
        accommodation: 'Departure',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
  {
    id: 'exp-east-africa-crossborder-10d',
    slug: 'east-africa-bwindi-gorillas-serengeti-migration',
    title: 'East Africa Icons: Bwindi Gorillas & Serengeti Plains',
    subtitle: 'Seamless fly-in cross-border expedition pairing Uganda’s mountain gorillas with Tanzania’s Great Migration',
    category: 'cross-border',
    categoryLabel: 'Uganda & Tanzania Fly-In',
    durationDays: 10,
    maxGroupSize: 6,
    difficulty: 'Moderate',
    coordinates: "02°19'S 34°49'E",
    primaryPark: 'Bwindi Impenetrable NP (Uganda) & Serengeti NP (Tanzania)',
    trekkingSector: 'Buhoma (Bwindi) & Kogatende/Seronera (Serengeti)',
    heroImage: withBasePath('/images/safari-land-cruiser.jpg'),
    gallery: [
      withBasePath('/images/safari-land-cruiser.jpg'),
      withBasePath('/images/bwindi-silverback.jpg'),
      withBasePath('/images/savannah-lions.webp'),
      withBasePath('/images/luxury-lodge.jpg'),
    ],
    basePriceUsd: 9400,
    greenSeasonDiscountUsd: 850,
    gorillaPermitUsd: 800,
    chimpPermitUsd: 0,
    permitSummary: '1x UWA Gorilla Permit ($800) + TANAPA Serengeti & Ngorongoro Fees Included',
    privateVehicleUpgradePerPersonUsd: 1100,
    luxuryLodgeUpgradePerPersonUsd: 2150,
    stripeProductId: 'prod_jabali_eastafrica_10d',
    stripePriceEnvKey: 'STRIPE_PRICE_EAST_AFRICA_10D',
    featured: false,
    badge: 'Cross-Border Fly-In',
    summary:
      'Thanks to direct bush flight links between Entebbe, Kihihi (Bwindi), and the Serengeti airstrips across Lake Victoria, you can lock eyes with a Bwindi silverback on Tuesday and watch wildebeest cross the Mara River in the Serengeti by Thursday.',
    highlights: [
      'Direct regional bush flights connecting Entebbe, Bwindi (Kihihi), and Serengeti (Kogatende/Seronera)',
      'Mountain gorilla trekking in Uganda’s Bwindi Impenetrable Forest with UWA permit',
      'Four days of endless plains game viewing in the Serengeti and Ngorongoro Crater rim',
      'Seamless cross-border VIP customs clearance handled by Jabali field concierges',
    ],
    included: [
      'All regional bush flights (Entebbe → Kihihi → Entebbe → Serengeti → Kilimanjaro)',
      '9 nights luxury tented camps & forest lodges (all-inclusive beverages & laundry)',
      'TANAPA Serengeti & Ngorongoro Crater conservation fees',
      'Private 4x4 safari vehicles in both Uganda and Tanzania',
    ],
    excluded: [
      'UWA Mountain Gorilla Permit ($800/pp) — itemized at checkout',
      'East Africa & Tanzania visas, international long-haul flights',
    ],
    bestMonths: ['Jan', 'Feb', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Dec'],
    dailyPermitQuota: 4,
    itinerary: [
      {
        day: 1,
        title: 'Arrive Entebbe, Uganda — Lake Victoria Welcome',
        location: 'Entebbe, Uganda',
        altitude: '1,135m',
        description: 'Private VIP arrival transfer to your boutique hotel in Entebbe.',
        accommodation: 'Hotel No.5 Entebbe',
        meals: 'Dinner',
      },
      {
        day: 2,
        title: 'Bush Flight to Bwindi Impenetrable Forest',
        location: 'Entebbe → Kihihi → Buhoma, Bwindi',
        altitude: '1,550m',
        description: 'Morning AeroLink flight to Kihihi and afternoon community conservation walk in Buhoma.',
        accommodation: 'Clouds Mountain Gorilla Lodge / Buhoma Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Mountain Gorilla Trekking in Bwindi',
        location: 'Bwindi Impenetrable Forest',
        altitude: '2,100m',
        description: 'Track a habituated mountain gorilla family with UWA trackers in Bwindi.',
        accommodation: 'Clouds Mountain Gorilla Lodge / Buhoma Lodge',
        meals: 'Breakfast, Packed Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Second Optional Forest Walk or Batwa Trail',
        location: 'Bwindi Impenetrable Forest',
        altitude: '2,000m',
        description: 'Explore the waterfalls and orchid-draped trails of Bwindi with a Batwa elder and ornithologist.',
        accommodation: 'Clouds Mountain Gorilla Lodge / Buhoma Lodge',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Fly Across Lake Victoria to the Serengeti Plains',
        location: 'Bwindi → Entebbe → Serengeti National Park, Tanzania',
        altitude: '1,450m',
        description: 'Morning bush flight via Entebbe across Lake Victoria to the Serengeti, arriving for an afternoon game drive.',
        accommodation: 'Namiri Plains / Sayari Camp',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Full Day Tracking the Great Wildebeest Migration',
        location: 'Serengeti National Park',
        altitude: '1,450m',
        description: 'Full-day private 4x4 safari tracking mega-herds of wildebeest, zebra, lions, and cheetahs.',
        accommodation: 'Namiri Plains / Sayari Camp',
        meals: 'Breakfast, Bush Lunch, Dinner',
      },
      {
        day: 7,
        title: 'Granite Kopjes & Big Cats of the Eastern Serengeti',
        location: 'Serengeti National Park',
        altitude: '1,500m',
        description: 'Explore ancient granite kopjes that shelter leopards and cheetah families.',
        accommodation: 'Namiri Plains / Sayari Camp',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 8,
        title: 'Serengeti to the Ngorongoro Crater Highlands',
        location: 'Serengeti → Ngorongoro Conservation Area',
        altitude: '2,280m',
        description: 'Game drive en route to the forested rim of the Ngorongoro Caldera.',
        accommodation: 'Entamanu Ngorongoro',
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 9,
        title: 'Dawn Descent into the Ngorongoro Crater Floor',
        location: 'Ngorongoro Crater',
        altitude: '1,700m',
        description: 'Descend 600 meters into the volcanic caldera at first light to spot black rhino, tusker elephants, and lions.',
        accommodation: 'Entamanu Ngorongoro',
        meals: 'Breakfast, Picnic Lunch, Dinner',
      },
      {
        day: 10,
        title: 'Lake Manyara Flight to Kilimanjaro (JRO) Departure',
        location: 'Manyara Airstrip → Kilimanjaro International Airport',
        altitude: '900m',
        description: 'Morning bush flight to Kilimanjaro Airport in time for international homeward connections.',
        accommodation: 'Departure',
        meals: 'Breakfast, Lunch',
      },
    ],
  },
];

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: 'Uganda' | 'East Africa Extension';
  coordinates: string;
  elevation: string;
  areaSqKm: string;
  signatureSpecies: string[];
  heroImage: string;
  tagline: string;
  description: string;
  sectorsOrZones: { name: string; detail: string }[];
  travelLogistics: string;
  bestTime: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'dest-bwindi',
    slug: 'bwindi-impenetrable-national-park',
    name: 'Bwindi Impenetrable Forest',
    region: 'Southwestern Albertine Rift',
    country: 'Uganda',
    coordinates: "01°02'S 29°41'E",
    elevation: '1,160m – 2,607m',
    areaSqKm: '321 km² UNESCO World Heritage Site',
    signatureSpecies: ['Mountain Gorilla (459+ individuals)', 'L’Hoest’s Monkey', 'African Green Broadbill', 'Forest Elephant'],
    heroImage: withBasePath('/images/bwindi-silverback.jpg'),
    tagline: 'A 25,000-year-old Pleistocene refugium sheltering nearly half the world’s mountain gorillas.',
    description:
      'Draped across steep ridges of the Albertine Rift, Bwindi Impenetrable National Park boasts 25 habituated mountain gorilla families across four distinct trekking sectors. Its mist-laden valleys harbor 160 species of trees, 100 species of ferns, and 350 bird species including 23 Albertine Rift endemics.',
    sectorsOrZones: [
      {
        name: 'Buhoma Sector (North)',
        detail: 'The historic birthplace of Ugandan gorilla tourism (Mubare, Habinyanja, Rushegura, Katwe families). Moderate terrain and direct access from Ishasha.',
      },
      {
        name: 'Ruhija Sector (East)',
        detail: 'High-altitude ridge (2,350m+) famous for the Bitukura, Oruzogo, and Kyaguriro families and world-class Mubwindi Swamp birding.',
      },
      {
        name: 'Rushaga Sector (South)',
        detail: 'Holds the highest number of habituated families (8+ groups) and is the exclusive hub for the 4-hour UWA Gorilla Habituation Experience.',
      },
      {
        name: 'Nkuringo Sector (Southwest)',
        detail: 'Dramatic ridge overlooking the Virunga Volcanoes; home to the Nkuringo, Bushaho, and Christmas families—strenuous, deeply rewarding hikes.',
      },
    ],
    travelLogistics: '75-minute scheduled AeroLink bush flight from Entebbe (EBB) to Kihihi or Kisoro airstrips, or 8–9 hours overland via Lake Mburo/Queen Elizabeth.',
    bestTime: 'June–September & December–February (Dry Seasons for firmer trails); March–May & November offer lush emerald photography and lodge rate reductions.',
  },
  {
    id: 'dest-kibale',
    slug: 'kibale-forest-national-park',
    name: 'Kibale Forest National Park',
    region: 'Western Uganda · Ndali-Kasenda Crater Rim',
    country: 'Uganda',
    coordinates: "00°29'N 30°21'E",
    elevation: '1,100m – 1,590m',
    areaSqKm: '795 km² Tropical Rainforest Corridor',
    signatureSpecies: ['Eastern Chimpanzee (1,500+)', 'Ugandan Red Colobus', 'Red-tailed Monkey', 'Great Blue Turaco'],
    heroImage: withBasePath('/images/kibale-chimpanzee.jpg'),
    tagline: 'The primate capital of East Africa, boasting the highest density and diversity of primates on Earth.',
    description:
      'Kibale’s towering mahogany and fig canopy shelters 13 primate species. Tracking the Kanyanchu chimpanzee communities offers >95% sighting success, complemented by community-run walks in adjacent Bigodi Wetland Sanctuary and hikes around dozens of volcanic explosion craters.',
    sectorsOrZones: [
      {
        name: 'Kanyanchu Visitor Center',
        detail: 'Primary trailhead for twice-daily Chimpanzee Tracking (08:00 & 14:00) and full-day Chimpanzee Habituation Experience (CHEX).',
      },
      {
        name: 'Bigodi Wetland Sanctuary',
        detail: 'Community-managed papyrus swamp renowned for 8 primate species and 200+ bird species led by local KAFRED guides.',
      },
    ],
    travelLogistics: '5 hours scenic tarmac drive west of Entebbe via Fort Portal, or 60-minute flight from Entebbe to Kasese Airstrip.',
    bestTime: 'Year-round tracking; fig fruiting peaks in June–September and December–February bring chimpanzees lower into the canopy.',
  },
  {
    id: 'dest-queen-elizabeth',
    slug: 'queen-elizabeth-national-park',
    name: 'Queen Elizabeth National Park',
    region: 'Kasese & Rubirizi · Albertine Rift Floor',
    country: 'Uganda',
    coordinates: "00°12'S 30°00'E",
    elevation: '910m – 1,350m',
    areaSqKm: '1,978 km² Biosphere Reserve',
    signatureSpecies: ['Tree-Climbing Lions (Ishasha)', 'African Savanna Elephant', 'Nile Hippo', 'Uganda Kob', '600+ Bird Species'],
    heroImage: withBasePath('/images/queen-elizabeth-savannah.webp'),
    tagline: 'Crater-studded savannahs, sunken tropical gorges, and the wildlife-packed Kazinga Channel.',
    description:
      'Set against the jagged snow-peaked Rwenzori Mountains, Queen Elizabeth National Park spans open acacia savannah, salt-producing volcanic craters, the sunken rainforest of Kyambura Gorge, and the 32-kilometer natural Kazinga Channel linking Lake George and Lake Edward.',
    sectorsOrZones: [
      {
        name: 'Kasenyi Plains & Mweya Peninsula',
        detail: 'Prime Uganda kob breeding grounds patrolled by lions and spotted hyenas, adjacent to the Kazinga Channel boat launch.',
      },
      {
        name: 'Ishasha Southern Sector',
        detail: 'Remote riverine wilderness famous for lion prides that climb giant sycamore fig trees to catch the breeze and escape tsetse flies.',
      },
      {
        name: 'Kyambura Gorge ("Valley of Apes")',
        detail: 'A dramatic 100-meter-deep tectonic fissure slicing across the savannah, home to an isolated community of wild chimpanzees.',
      },
    ],
    travelLogistics: 'Connected to Kibale (2 hrs north) and Bwindi Buhoma (2.5 hrs south via Ishasha); daily flights into Mweya and Kasese airstrips.',
    bestTime: 'January–February and June–September for dry-season waterhole concentrations along the Kazinga Channel.',
  },
  {
    id: 'dest-murchison',
    slug: 'murchison-falls-national-park',
    name: 'Murchison Falls National Park',
    region: 'Northwestern Uganda · Victoria Nile',
    country: 'Uganda',
    coordinates: "02°16'N 31°41'E",
    elevation: '615m – 1,187m',
    areaSqKm: '3,893 km² (Uganda’s Largest Park)',
    signatureSpecies: ['Rothschild’s Giraffe', 'Shoebill Stork', 'Nile Crocodile', 'Lion & Leopard', 'White Rhino (Ziwa Corridor)'],
    heroImage: withBasePath('/images/murchison-falls.jpg'),
    tagline: 'Where the entire Victoria Nile compresses through a 7-meter rock cleft before thundering into Lake Albert.',
    description:
      'Bisected by the Victoria Nile, Uganda’s oldest and largest conservation area combines Borassus palm savannah in the north with dense ironwood forest in the south (Budongo). En route, travelers stop at Ziwa Rhino Sanctuary to track Uganda’s reintroduced southern white rhinos on foot.',
    sectorsOrZones: [
      {
        name: 'Buligi Peninsula & Northern Bank',
        detail: 'Open palm-dotted grasslands holding Uganda’s largest population of endangered Rothschild’s giraffes, elephants, and lions.',
      },
      {
        name: 'Victoria Nile Gorge & Lake Albert Delta',
        detail: 'Boat safaris upstream to the boiling Devil’s Cauldron and downstream into papyrus beds to spot the rare Shoebill stork.',
      },
    ],
    travelLogistics: '4.5–5 hours drive northwest of Entebbe (via Ziwa Rhino Sanctuary), or 60-minute bush flight to Pakuba or Bugungu airstrips.',
    bestTime: 'December–March and June–September; Shoebill sightings peak during low-water months (January–March).',
  },
  {
    id: 'dest-kidepo',
    slug: 'kidepo-valley-national-park',
    name: 'Kidepo Valley National Park',
    region: 'Karamoja Frontier · Far Northeast',
    country: 'Uganda',
    coordinates: "03°54'N 33°51'E",
    elevation: '914m – 2,750m (Mount Morungole)',
    areaSqKm: '1,442 km² Semi-Arid Wilderness',
    signatureSpecies: ['Cheetah', '4,000+ Cape Buffalo Herds', 'North African Ostrich', 'Bat-Eared Fox', 'Kori Bustard'],
    heroImage: withBasePath('/images/kidepo-valley.jpg'),
    tagline: 'Vast, golden amphitheaters ringed by rugged mountains on the South Sudan and Kenya frontier.',
    description:
      'Harboring 28 wildlife species found in no other Ugandan park, Kidepo delivers an intimate, crowd-free East African safari experience. Because visitor numbers remain tiny, walking safaris along the dry Kidepo sand river and sundowners on granite kopjes feel completely private.',
    sectorsOrZones: [
      {
        name: 'Narus Valley',
        detail: 'Perennial waterpoints attract massive buffalo herds, elephants, lions, and cheetahs throughout the dry season.',
      },
      {
        name: 'Kidepo Valley & Mount Morungole',
        detail: 'Semi-arid sand rivers, Kanangarok Hot Springs, and high-altitude hiking trails to indigenous Ik mountain villages.',
      },
    ],
    travelLogistics: '2-hour scheduled or private charter flight from Entebbe to Apoka Airstrip.',
    bestTime: 'September–March when wildlife congregates tightly around the Narus Valley wetlands.',
  },
  {
    id: 'dest-serengeti-extension',
    slug: 'serengeti-masai-mara-extensions',
    name: 'Serengeti & Masai Mara Extensions',
    region: 'Cross-Border East Africa Circuit',
    country: 'East Africa Extension',
    coordinates: "02°19'S 34°49'E",
    elevation: '1,100m – 2,000m',
    areaSqKm: '30,000 km² Greater Ecosystem',
    signatureSpecies: ['1.5M Wildebeest Migration', 'Black Rhino (Ngorongoro)', 'East African Lion', 'Leopard & Cheetah'],
    heroImage: withBasePath('/images/savannah-lions.webp'),
    tagline: 'Pair Bwindi’s rainforest primates with the endless plains of Tanzania and Kenya via direct Lake Victoria bush flights.',
    description:
      'Jabali Trails operates seamless cross-border itineraries linking Uganda’s Kihihi and Entebbe hubs directly to the Serengeti (Tanzania) and Masai Mara (Kenya) airstrips—allowing travelers to experience both mountain gorillas and the Great Wildebeest Migration in a single journey.',
    sectorsOrZones: [
      {
        name: 'Northern Serengeti & Mara River (Jul–Oct)',
        detail: 'Dramatic Mara River crossings as mega-herds move between Tanzania and Kenya.',
      },
      {
        name: 'Southern Serengeti & Ngorongoro (Jan–Mar)',
        detail: 'Calving season on the short-grass Ndutu plains paired with Ngorongoro Crater floor descents.',
      },
    ],
    travelLogistics: 'Morning bush flight from Bwindi (Kihihi) via Entebbe directly into Kogatende, Seronera, or Musiara airstrips.',
    bestTime: 'July–October for river crossings; January–March for Ndutu calving season.',
  },
];

export interface GuideProfile {
  name: string;
  role: string;
  experienceYears: number;
  homeRegion: string;
  specialties: string[];
  languages: string[];
  bio: string;
  quote: string;
  image: string;
}

export const LEAD_GUIDES: GuideProfile[] = [
  {
    name: 'moses-tumusiime',
    role: 'Co-Founder & Chief Primatologist Guide',
    experienceYears: 17,
    homeRegion: 'Buhoma, Bwindi Impenetrable Forest',
    specialties: ['Mountain Gorilla Behavior', 'Albertine Rift Endemic Birds', 'Botanical Ethnomedicine'],
    languages: ['English', 'Runyankole-Rukiga', 'Swahili', 'French'],
    bio: 'Born three kilometers from the Buhoma trailhead, Moses served 8 years as a Uganda Wildlife Authority tracker before co-founding Jabali Trails. He has logged over 1,100 hours observing Bwindi’s Rushegura, Mubare, and Nkuringo gorilla families.',
    quote: 'When a 200-kilogram silverback rumbles softly in his chest, he is telling the forest—and you—that peace holds here.',
    image: withBasePath('/images/bwindi-gorilla-rest.jpg'),
  },
  {
    name: 'grace-namatovu',
    role: 'Head of Expedition Logistics & Lead Ornithologist',
    experienceYears: 12,
    homeRegion: 'Fort Portal & Kibale Crater Rim',
    specialties: ['Chimpanzee Habituation', 'Shoebill & Wetland Ecology', 'Conservation Community Partnerships'],
    languages: ['English', 'Rutooro', 'Luganda', 'German'],
    bio: 'Holds an M.Sc. in Tropical Conservation Biology from Makerere University’s Biological Field Station in Kibale. Grace leads our Primate Kingdom expeditions and oversees Jabali’s 5% Community & Conservation Levy distribution.',
    quote: 'Uganda packs West African rainforest and East African savannah into one rift valley. In eight days you witness evolution in real time.',
    image: withBasePath('/images/kibale-canopy.jpg'),
  },
  {
    name: 'samuel-lomuria',
    role: 'Senior Walking Safari & Frontier Specialist',
    experienceYears: 14,
    homeRegion: 'Kotido, Karamoja & Kidepo Valley',
    specialties: ['Armed Foot Safaris', 'Predator Spoor Tracking', 'Karamojong & Ik Cultural Interpretation'],
    languages: ['English', 'Ng’akarimojong', 'Swahili'],
    bio: 'Trained in advanced bushcraft and rifle-escorted walking safaris across Kidepo and Murchison Falls, Samuel specializes in reading subtle predator tracks and guiding respectful high-altitude treks on Mount Morungole.',
    quote: 'In a vehicle you look at Africa; on foot in the Narus Valley, your heartbeat syncs with the wind and the buffalo herds.',
    image: withBasePath('/images/safari-land-cruiser.jpg'),
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    guest: 'Dr. Elena Vance & Marcus Vance',
    origin: 'Zurich, Switzerland',
    expedition: 'Primate Kingdom: Kibale Chimps & Bwindi Gorillas (8 Days)',
    date: 'August 2026',
    rating: 5,
    quote:
      'Having traveled with major luxury outfitters in Botswana and Tanzania, Jabali Trails stood in a league of its own. Having our UWA Buhoma gorilla permits locked in instantly at booking and tracking with Moses—who knew every individual gorilla by nose-print—was extraordinary.',
  },
  {
    id: 't2',
    guest: 'Jonathan & Claire Sterling',
    origin: 'Seattle, WA, USA',
    expedition: 'Bwindi Mist & Mountain Gorillas (5 Days · Private Charter)',
    date: 'July 2026',
    rating: 5,
    quote:
      'We upgraded to the 4-hour Gorilla Habituation experience in Rushaga and the AeroLink bush flight from Entebbe. The transparency around the $800 UWA permit fee, the community porters, and the immaculate Land Cruiser made every single day effortless.',
  },
  {
    id: 't3',
    guest: 'Liam O’Connor',
    origin: 'Dublin, Ireland',
    expedition: 'Kidepo Valley & Karamoja Walking Expedition (6 Days)',
    date: 'February 2026',
    rating: 5,
    quote:
      'Five days in Kidepo Valley and we saw only two other safari vehicles the entire week—yet we watched a herd of 2,000 buffalo from on foot and tracked lions on granite kopjes at sunrise. Samuel’s knowledge of Karamoja is unmatched.',
  },
];

export function getExpeditionBySlug(slug: string): Expedition | undefined {
  return EXPEDITIONS.find((e) => e.slug === slug);
}

export function getExpeditionById(id: string): Expedition | undefined {
  return EXPEDITIONS.find((e) => e.id === id);
}
