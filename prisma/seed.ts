import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@propai.com' },
    update: {},
    create: {
      email: 'admin@propai.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create sales admin
  const salesAdmin = await prisma.user.upsert({
    where: { email: 'salesadmin@propai.com' },
    update: {},
    create: {
      email: 'salesadmin@propai.com',
      name: 'Sales Admin',
      password: hashedPassword,
      role: 'sales_admin',
    },
  });

  // Create team leader
  const teamLeader = await prisma.user.upsert({
    where: { email: 'teamleader@propai.com' },
    update: {},
    create: {
      email: 'teamleader@propai.com',
      name: 'Team Leader',
      password: hashedPassword,
      role: 'team_leader',
    },
  });

  // Create sales rep
  const salesRep = await prisma.user.upsert({
    where: { email: 'salesrep@propai.com' },
    update: {},
    create: {
      email: 'salesrep@propai.com',
      name: 'Sales Representative',
      password: hashedPassword,
      role: 'sales_rep',
      teamLeaderId: teamLeader.id,
    },
  });

  // Create zones
  const zone1 = await prisma.zone.create({
    data: {
      nameEn: 'Downtown',
      nameAr: 'وسط المدينة',
      description: 'Central business district',
      latitude: 24.7136,
      longitude: 46.6753,
    },
  });

  const zone2 = await prisma.zone.create({
    data: {
      nameEn: 'North Riyadh',
      nameAr: 'شمال الرياض',
      description: 'Northern residential area',
      latitude: 24.7743,
      longitude: 46.7384,
    },
  });

  // Create developers
  const developer1 = await prisma.developer.create({
    data: {
      nameEn: 'Al Rajhi Development',
      nameAr: 'تطوير الراجحي',
      location: 'Riyadh, Saudi Arabia',
      established: '2010',
      email: 'info@alrajhi-dev.com',
      phone: '+966-11-123-4567',
    },
  });

  const developer2 = await prisma.developer.create({
    data: {
      nameEn: 'Saudi Real Estate',
      nameAr: 'العقارات السعودية',
      location: 'Jeddah, Saudi Arabia',
      established: '2005',
      email: 'contact@saudi-realestate.com',
      phone: '+966-12-987-6543',
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      nameEn: 'Downtown Towers',
      nameAr: 'أبراج وسط المدينة',
      type: 'residential',
      description: 'Luxury residential towers in downtown',
      images: [],
      developerId: developer1.id,
      zoneId: zone1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      nameEn: 'North Gardens',
      nameAr: 'حدائق الشمال',
      type: 'residential',
      description: 'Family-friendly residential complex',
      images: [],
      developerId: developer2.id,
      zoneId: zone2.id,
    },
  });

  // Create payment plans
  const paymentPlan1 = await prisma.paymentPlan.create({
    data: {
      downpayment: 100000,
      installment: 5000,
      delivery: 50000,
      schedule: 'Monthly',
      description: 'Standard payment plan',
      yearsToPay: 10,
      installmentPeriod: 'monthly',
      firstInstallmentDate: new Date('2025-01-01'),
      deliveryDate: new Date('2026-06-01'),
      projectId: project1.id,
    },
  });

  const paymentPlan2 = await prisma.paymentPlan.create({
    data: {
      downpayment: 80000,
      installment: 4000,
      delivery: 40000,
      schedule: 'Quarterly',
      description: 'Flexible payment plan',
      yearsToPay: 8,
      installmentPeriod: 'quarterly',
      firstInstallmentDate: new Date('2025-03-01'),
      deliveryDate: new Date('2026-12-01'),
      projectId: project2.id,
    },
  });

  // Create inventories
  const inventory1 = await prisma.inventory.create({
    data: {
      title: 'Luxury Apartment 101',
      titleEn: 'Luxury Apartment 101',
      titleAr: 'شقة فاخرة 101',
      type: 'apartment',
      price: 1500000,
      location: 'Downtown Riyadh',
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['pool', 'gym', 'parking'],
      status: 'available',
      zoneId: zone1.id,
      projectId: project1.id,
      developerId: developer1.id,
      paymentPlanIndex: 0,
      parking: '2 cars',
    },
  });

  const inventory2 = await prisma.inventory.create({
    data: {
      title: 'Family Villa 202',
      titleEn: 'Family Villa 202',
      titleAr: 'فيلا عائلية 202',
      type: 'villa',
      price: 2500000,
      location: 'North Riyadh',
      area: 200,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['garden', 'pool', 'gym'],
      status: 'available',
      zoneId: zone2.id,
      projectId: project2.id,
      developerId: developer2.id,
      paymentPlanIndex: 0,
      parking: '3 cars',
    },
  });

  // Create leads
  const lead1 = await prisma.lead.create({
    data: {
      nameEn: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الرشيد',
      contact: '+966-50-123-4567',
      email: 'ahmed@example.com',
      budget: 2000000,
      source: 'website',
      status: 'fresh_lead',
      notes: ['Interested in luxury apartments', 'Budget: 2M SAR'],
      ownerId: salesRep.id,
      inventoryInterestId: inventory1.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      nameEn: 'Fatima Al-Zahra',
      nameAr: 'فاطمة الزهراء',
      contact: '+966-55-987-6543',
      email: 'fatima@example.com',
      budget: 3000000,
      source: 'referral',
      status: 'follow_up',
      notes: ['Looking for family villa', 'Has 3 children'],
      ownerId: teamLeader.id,
      inventoryInterestId: inventory2.id,
    },
  });

  // Create some calls
  await prisma.call.create({
    data: {
      date: new Date().toISOString(),
      outcome: 'Interested in viewing',
      duration: '15 minutes',
      notes: 'Client showed strong interest in the property',
      leadId: lead1.id,
      projectId: project1.id,
      createdBy: salesRep.id,
    },
  });

  // Create some visits
  await prisma.visit.create({
    data: {
      date: new Date().toISOString(),
      notes: 'Property viewing scheduled',
      objections: 'Price is a bit high',
      leadId: lead2.id,
      inventoryId: inventory2.id,
      createdById: teamLeader.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.zone.count()} zones`);
  console.log(`   - ${await prisma.developer.count()} developers`);
  console.log(`   - ${await prisma.project.count()} projects`);
  console.log(`   - ${await prisma.inventory.count()} inventories`);
  console.log(`   - ${await prisma.lead.count()} leads`);
  console.log(`   - ${await prisma.call.count()} calls`);
  console.log(`   - ${await prisma.visit.count()} visits`);

  console.log('\n🔑 Test Accounts:');
  console.log('   Admin: admin@propai.com / admin123');
  console.log('   Sales Admin: salesadmin@propai.com / admin123');
  console.log('   Team Leader: teamleader@propai.com / admin123');
  console.log('   Sales Rep: salesrep@propai.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 