import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in listing-backend/.env before seeding.');
  }
  if (adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Seed the administrator using credentials provided outside source control.
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      fullName: process.env.ADMIN_FULL_NAME?.trim() || 'System Administrator',
      role: 'ADMIN',
      emailVerified: true
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: process.env.ADMIN_FULL_NAME?.trim() || 'System Administrator',
      dateOfBirth: new Date('1988-06-15'),
      country: process.env.ADMIN_COUNTRY?.trim() || 'Uganda',
      role: 'ADMIN',
      emailVerified: true,
      phoneVerified: true
    }
  });

  // 2. Seed Location Lock Settings (DISABLED BY DEFAULT!)
  await prisma.locationLockSetting.upsert({
    where: { id: 'global_setting' },
    update: {},
    create: {
      id: 'global_setting',
      enabledGlobally: false, // MANDATORY: Disabled by default
      unlockFeeAmount: 15.00,
      unlockFeeCurrency: 'USD',
      gatewayEnabled: true,
      merchantCodeEnabled: true,
      merchantCode: 'SHELTER-MBL-784',
      merchantName: 'Sheltered Global Escrow Services Ltd',
      paymentInstructions: 'Transfer the exact unlock fee to merchant code SHELTER-MBL-784 via Mobile Money (MTN *165*3# / Airtel *185*9#), Stanbic FlexiPay, or Bank Wire. Then submit your transaction reference ID.',
      supportedChannels: [
        'MTN Mobile Money (Pay Code: 784011)',
        'Airtel Money (Pay Code: 994210)',
        'Stanbic Bank FlexiPay (Merchant: 882194)',
        'Bank Wire / SWIFT (Stanbic Bank Uganda - Acct: 903001884210)'
      ],
      txIdMinLength: 6,
      txIdMaxLength: 30,
      txIdRegexPattern: '^[A-Za-z0-9_-]+$',
      verificationMode: 'AUTOMATIC'
    }
  });

  // 3. Seed Properties
  const prop1 = await prisma.property.upsert({
    where: { slug: 'executive-5-bedroom-hillside-villa-senior-quarters-mbale' },
    update: {},
    create: {
      slug: 'executive-5-bedroom-hillside-villa-senior-quarters-mbale',
      title: 'Executive 5-Bedroom Hillside Villa in Senior Quarters, Mbale',
      description: 'Exclusive multi-level luxury residence offering panoramic views of Wanale Ridge. Features private swimming pool, manicured gardens, perimeter electric fence, and servant quarters.',
      propertyType: 'Residential Villa',
      listingType: 'SALE',
      price: 340000.00,
      currency: 'USD',
      status: 'ACTIVE',
      bedrooms: 5,
      bathrooms: 4.5,
      landSizeSqFt: 21780,
      builtYear: 2021,
      featured: true,
      country: 'Uganda',
      region: 'Eastern Region',
      district: 'Mbale',
      neighborhood: 'Senior Quarters',
      // Confidential data withheld until unlocked
      exactAddress: 'Plot 14-16 Wanale View Crescent, Senior Quarters, Mbale City',
      latitude: 1.07842,
      longitude: 34.17581,
      directionsGuide: 'Ascend Gangama Hill via Republic Street, turn left at Senior Quarters Gate 2.',
      cadastralPlotNumber: 'FRV-MBL-4491-FOL-12',
      ownerId: adminUser.id
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
