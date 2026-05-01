import { db } from "./index";
import { venues, courts, users, accounts } from "./schema";
import { slugify } from "@/lib/utils";

/**
 * Database Seed Script
 * 
 * Run: npm run db:seed
 * 
 * Creates sample venues, courts, and a superadmin account.
 */
async function seed() {
  console.log("🌱 Seeding database...");

  // Create superadmin user
  const [admin] = await db
    .insert(users)
    .values({
      id: "superadmin-001",
      name: "Super Admin",
      email: "admin@padelbook.id",
      emailVerified: true,
      role: "superadmin",
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    // Create account with password (hashed "admin123")
    await db.insert(accounts).values({
      id: "account-admin-001",
      accountId: admin.id,
      providerId: "credential",
      userId: admin.id,
      // Note: You need to login via Better Auth to set proper password
      // Use /api/auth/sign-up to create the actual account
    }).onConflictDoNothing();
    console.log("✅ Superadmin created: admin@padelbook.id");
  }

  // Create sample operator
  const [operator] = await db
    .insert(users)
    .values({
      id: "operator-001",
      name: "Operator Demo",
      email: "operator@padelbook.id",
      emailVerified: true,
      role: "operator",
    })
    .onConflictDoNothing()
    .returning();

  if (operator) {
    console.log("✅ Operator created: operator@padelbook.id");
  }

  // Create sample venues
  const venueData = [
    {
      name: "Padel Arena Jakarta",
      address: "Jl. Sudirman No. 123, Jakarta Selatan",
      description: "Arena padel premium di pusat kota Jakarta. Dilengkapi dengan 4 court indoor berstandar internasional, area lounge, dan pro shop.",
      phone: "021-12345678",
      bankName: "BCA",
      bankAccount: "1234567890",
      bankHolder: "PT Padel Arena Jakarta",
    },
    {
      name: "Green Padel Club",
      address: "Jl. BSD Green Office Park, Tangerang Selatan",
      description: "Club padel modern dengan fasilitas lengkap. Court outdoor dengan pencahayaan malam hari dan lapangan berumput sintetis premium.",
      phone: "021-87654321",
      bankName: "Mandiri",
      bankAccount: "9876543210",
      bankHolder: "Green Padel Club",
    },
    {
      name: "Padel Hub Bandung",
      address: "Jl. Dago No. 45, Bandung",
      description: "Tempat bermain padel favorit di Bandung. Suasana sejuk pegunungan dengan view kota yang indah.",
      phone: "022-11223344",
      bankName: "BNI",
      bankAccount: "1122334455",
      bankHolder: "Padel Hub Bandung",
    },
  ];

  for (const v of venueData) {
    const [venue] = await db
      .insert(venues)
      .values({
        ...v,
        slug: slugify(v.name),
        imageUrl: null,
      })
      .onConflictDoNothing()
      .returning();

    if (venue) {
      console.log(`✅ Venue: ${venue.name}`);

      // Create courts for each venue
      const courtNames = ["Court A", "Court B", "Court C"];
      const prices = [150000, 175000, 200000];

      for (let i = 0; i < courtNames.length; i++) {
        const [court] = await db
          .insert(courts)
          .values({
            venueId: venue.id,
            name: courtNames[i],
            description: `${courtNames[i]} - ${i === 2 ? "Premium" : "Standard"} court`,
            pricePerHour: prices[i],
          })
          .onConflictDoNothing()
          .returning();

        if (court) {
          console.log(`   └── ${court.name}: Rp ${court.pricePerHour.toLocaleString()}/jam`);
        }
      }
    }
  }

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
