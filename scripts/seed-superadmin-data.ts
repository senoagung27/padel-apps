import { createClient } from "@supabase/supabase-js";

type VenueSeed = {
  name: string;
  slug: string;
  address: string;
  description: string;
  phone: string;
  city: string;
  tier: "premium" | "standard" | "community";
  is_active: boolean;
};

const COURTS_PER_VENUE = 5;
const ACTIVE_VENUES = 10;

const venueBlueprints: Omit<VenueSeed, "is_active">[] = [
  {
    name: "Nusa Padel Senayan",
    slug: "nusa-padel-senayan",
    city: "Jakarta",
    tier: "premium",
    address: "Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan",
    description: "Venue premium indoor-outdoor dekat pusat bisnis Senayan.",
    phone: "0812-3100-1101",
  },
  {
    name: "Bandung Rally Courts",
    slug: "bandung-rally-courts",
    city: "Bandung",
    tier: "standard",
    address: "Jl. Setiabudi No. 188, Sukajadi, Bandung",
    description: "Kompleks padel modern dengan akses mudah dari area kampus.",
    phone: "0812-3100-1102",
  },
  {
    name: "Surabaya Smash Point",
    slug: "surabaya-smash-point",
    city: "Surabaya",
    tier: "standard",
    address: "Jl. HR Muhammad No. 89, Dukuh Pakis, Surabaya",
    description: "Venue keluarga dengan lounge dan area latihan privat.",
    phone: "0812-3100-1103",
  },
  {
    name: "Yogya Padel Pavilion",
    slug: "yogya-padel-pavilion",
    city: "Yogyakarta",
    tier: "community",
    address: "Jl. Kaliurang KM 5,2, Sleman, DI Yogyakarta",
    description: "Venue komunitas aktif dengan program coaching pemula.",
    phone: "0812-3100-1104",
  },
  {
    name: "Bali Ocean Court",
    slug: "bali-ocean-court",
    city: "Denpasar",
    tier: "premium",
    address: "Jl. Sunset Road No. 21, Kuta, Badung, Bali",
    description: "Venue premium bernuansa resort untuk pemain lokal dan turis.",
    phone: "0812-3100-1105",
  },
  {
    name: "Semarang Axis Padel",
    slug: "semarang-axis-padel",
    city: "Semarang",
    tier: "community",
    address: "Jl. Sisingamangaraja No. 41, Candisari, Semarang",
    description: "Venue kompak dengan jadwal liga komunitas setiap pekan.",
    phone: "0812-3100-1106",
  },
  {
    name: "Malang Court Hub",
    slug: "malang-court-hub",
    city: "Malang",
    tier: "community",
    address: "Jl. Soekarno Hatta No. 12, Lowokwaru, Malang",
    description: "Venue latihan rutin untuk pelajar dan mahasiswa.",
    phone: "0812-3100-1107",
  },
  {
    name: "Makassar Padel Yard",
    slug: "makassar-padel-yard",
    city: "Makassar",
    tier: "standard",
    address: "Jl. AP Pettarani No. 77, Panakkukang, Makassar",
    description: "Venue standar turnamen regional area Sulawesi.",
    phone: "0812-3100-1108",
  },
  {
    name: "Medan Northline Padel",
    slug: "medan-northline-padel",
    city: "Medan",
    tier: "standard",
    address: "Jl. Ring Road No. 30, Medan Sunggal, Medan",
    description: "Venue urban dengan jam operasional panjang.",
    phone: "0812-3100-1109",
  },
  {
    name: "Palembang Riverside Padel",
    slug: "palembang-riverside-padel",
    city: "Palembang",
    tier: "community",
    address: "Jl. Demang Lebar Daun No. 9, Ilir Barat I, Palembang",
    description: "Venue komunitas untuk program sparring mingguan.",
    phone: "0812-3100-1110",
  },
  {
    name: "Bogor Green Court",
    slug: "bogor-green-court",
    city: "Bogor",
    tier: "community",
    address: "Jl. Pajajaran No. 55, Bogor Tengah, Bogor",
    description: "Venue suburban dengan fokus kelas pemula.",
    phone: "0812-3100-1111",
  },
  {
    name: "Bekasi Urban Padel",
    slug: "bekasi-urban-padel",
    city: "Bekasi",
    tier: "standard",
    address: "Jl. Ahmad Yani No. 101, Bekasi Selatan, Bekasi",
    description: "Venue after-office untuk area industri dan perkantoran.",
    phone: "0812-3100-1112",
  },
  {
    name: "Tangerang Prime Padel",
    slug: "tangerang-prime-padel",
    city: "Tangerang",
    tier: "premium",
    address: "Jl. Boulevard Gading Serpong No. 88, Tangerang",
    description: "Venue premium dengan fasilitas recovery room.",
    phone: "0812-3100-1113",
  },
  {
    name: "Depok Padel Garage",
    slug: "depok-padel-garage",
    city: "Depok",
    tier: "community",
    address: "Jl. Margonda Raya No. 233, Pancoran Mas, Depok",
    description: "Venue komunitas untuk sesi night game.",
    phone: "0812-3100-1114",
  },
  {
    name: "Batam Seaside Padel",
    slug: "batam-seaside-padel",
    city: "Batam",
    tier: "standard",
    address: "Jl. Engku Putri No. 15, Batam Center, Batam",
    description: "Venue standar area kepulauan dengan event corporate.",
    phone: "0812-3100-1115",
  },
];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function buildVenue(index: number): VenueSeed {
  const source = venueBlueprints[index - 1];
  if (!source) {
    throw new Error(`Missing venue blueprint for index ${index}`);
  }

  return {
    ...source,
    is_active: index <= ACTIVE_VENUES,
  };
}

function buildCourtTemplate(venue: VenueSeed, courtNo: number) {
  const premiumNames = ["Championship", "Skyline", "Sunset", "Arena", "Center"];
  const standardNames = ["North Wing", "East Wing", "West Wing", "South Wing", "Practice"];
  const communityNames = ["Komunitas A", "Komunitas B", "Komunitas C", "Komunitas D", "Komunitas E"];

  const priceBaseByTier: Record<VenueSeed["tier"], number> = {
    premium: 260000,
    standard: 190000,
    community: 140000,
  };

  const cityAdjustments: Record<string, number> = {
    Jakarta: 35000,
    Denpasar: 25000,
    Tangerang: 20000,
    Surabaya: 15000,
    Bandung: 10000,
    Bekasi: 5000,
    Medan: 5000,
    Makassar: 5000,
    Batam: 5000,
    Yogyakarta: 0,
    Semarang: 0,
    Malang: -5000,
    Palembang: -5000,
    Bogor: 0,
    Depok: 0,
  };

  const namesByTier: Record<VenueSeed["tier"], string[]> = {
    premium: premiumNames,
    standard: standardNames,
    community: communityNames,
  };

  const suffix = namesByTier[venue.tier][courtNo - 1] ?? `Court ${courtNo}`;
  const price = priceBaseByTier[venue.tier] + (cityAdjustments[venue.city] ?? 0) + courtNo * 5000;

  return {
    name: `${venue.city} ${suffix}`,
    description: `Lapangan ${courtNo} - kelas ${venue.tier} di ${venue.city}`,
    price_per_hour: price,
  };
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let insertedVenues = 0;
  let updatedVenues = 0;
  let insertedCourts = 0;

  for (let i = 1; i <= venueBlueprints.length; i += 1) {
    const venue = buildVenue(i);

    const { data: existingVenue, error: existingVenueError } = await supabase
      .from("venues")
      .select("id")
      .eq("slug", venue.slug)
      .maybeSingle();

    if (existingVenueError) {
      throw existingVenueError;
    }

    const { data: upsertedVenue, error: venueError } = await supabase
      .from("venues")
      .upsert(
        {
          name: venue.name,
          slug: venue.slug,
          address: venue.address,
          description: venue.description,
          phone: venue.phone,
          is_active: venue.is_active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();

    if (venueError || !upsertedVenue) {
      throw venueError ?? new Error(`Failed to upsert venue ${venue.slug}`);
    }

    if (existingVenue) {
      updatedVenues += 1;
    } else {
      insertedVenues += 1;
    }

    const { data: existingCourts, error: courtsReadError } = await supabase
      .from("courts")
      .select("id, name")
      .eq("venue_id", upsertedVenue.id)
      .order("created_at", { ascending: true });

    if (courtsReadError) {
      throw courtsReadError;
    }

    const currentCourts = existingCourts ?? [];

    const courtsToInsert = [];
    if (currentCourts.length < COURTS_PER_VENUE) {
      for (let courtNo = currentCourts.length + 1; courtNo <= COURTS_PER_VENUE; courtNo += 1) {
        const template = buildCourtTemplate(venue, courtNo);
        courtsToInsert.push({
          venue_id: upsertedVenue.id,
          name: template.name,
          description: template.description,
          price_per_hour: template.price_per_hour,
          is_active: true,
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (courtsToInsert.length > 0) {
      const { error: insertCourtsError } = await supabase.from("courts").insert(courtsToInsert);
      if (insertCourtsError) {
        throw insertCourtsError;
      }
      insertedCourts += courtsToInsert.length;
    }

    const { data: allCourts, error: allCourtsError } = await supabase
      .from("courts")
      .select("id")
      .eq("venue_id", upsertedVenue.id)
      .order("created_at", { ascending: true })
      .limit(COURTS_PER_VENUE);

    if (allCourtsError) {
      throw allCourtsError;
    }

    const venueCourts = allCourts ?? [];
    for (let courtNo = 1; courtNo <= venueCourts.length; courtNo += 1) {
      const template = buildCourtTemplate(venue, courtNo);
      const targetCourt = venueCourts[courtNo - 1];
      const { error: updateCourtError } = await supabase
        .from("courts")
        .update({
          name: template.name,
          description: template.description,
          price_per_hour: template.price_per_hour,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetCourt.id);

      if (updateCourtError) {
        throw updateCourtError;
      }
    }

    const { data: operators, error: operatorsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "operator");

    if (operatorsError) {
      throw operatorsError;
    }

    for (const operator of operators ?? []) {
      const { error: assignmentError } = await supabase
        .from("operator_venues")
        .upsert(
          {
            user_id: operator.id,
            venue_id: upsertedVenue.id,
          },
          { onConflict: "user_id,venue_id" }
        );

      if (assignmentError) {
        throw assignmentError;
      }
    }
  }

  const seededSlugs = venueBlueprints.map((v) => v.slug);

  const { count: totalDemoVenues, error: venueCountError } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .in("slug", seededSlugs);

  if (venueCountError) {
    throw venueCountError;
  }

  const { data: demoVenueIds, error: demoVenueIdsError } = await supabase
    .from("venues")
    .select("id")
    .in("slug", seededSlugs);

  if (demoVenueIdsError) {
    throw demoVenueIdsError;
  }

  const ids = (demoVenueIds ?? []).map((v) => v.id);

  const { count: totalDemoCourts, error: courtCountError } = await supabase
    .from("courts")
    .select("id", { count: "exact", head: true })
    .in("venue_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);

  if (courtCountError) {
    throw courtCountError;
  }

  const { data: allVenueIds, error: allVenueIdsError } = await supabase
    .from("venues")
    .select("id");

  if (allVenueIdsError) {
    throw allVenueIdsError;
  }

  const { data: allOperators, error: allOperatorsError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "operator");

  if (allOperatorsError) {
    throw allOperatorsError;
  }

  let createdAssignments = 0;
  for (const operator of allOperators ?? []) {
    for (const venue of allVenueIds ?? []) {
      const { error: assignmentError } = await supabase
        .from("operator_venues")
        .upsert(
          {
            user_id: operator.id,
            venue_id: venue.id,
          },
          { onConflict: "user_id,venue_id" }
        );

      if (assignmentError) {
        throw assignmentError;
      }

      createdAssignments += 1;
    }
  }

  console.log("Seed superadmin selesai");
  console.log(`Venue inserted: ${insertedVenues}`);
  console.log(`Venue updated: ${updatedVenues}`);
  console.log(`Court inserted: ${insertedCourts}`);
  console.log(`Total demo venues: ${totalDemoVenues ?? 0}`);
  console.log(`Total demo courts: ${totalDemoCourts ?? 0}`);
  console.log(`Operator-venue assignment upserts: ${createdAssignments}`);

  const { count: activeCount, error: activeCountError } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .in("slug", seededSlugs)
    .eq("is_active", true);

  if (activeCountError) {
    throw activeCountError;
  }

  console.log(`Active seeded venues: ${activeCount ?? 0}`);
  console.log(`Non-active seeded venues: ${(totalDemoVenues ?? 0) - (activeCount ?? 0)}`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
