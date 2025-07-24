import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPaymentPlanDates() {
  console.log('🔍 Starting payment plan date cleanup...');

  try {
    // Get all payment plans with potentially invalid dates
    const paymentPlans = await prisma.paymentPlan.findMany({
      include: {
        project: {
          select: { nameEn: true }
        }
      }
    });

    console.log(`📊 Found ${paymentPlans.length} payment plans to check...`);

    let fixedCount = 0;
    const defaultFirstInstallmentDate = new Date('2024-12-01');
    const defaultDeliveryDate = new Date('2026-12-01');

    for (const plan of paymentPlans) {
      let needsUpdate = false;
      const updateData: any = {};

      // Check and fix firstInstallmentDate
      if (!plan.firstInstallmentDate || isNaN(plan.firstInstallmentDate.getTime())) {
        updateData.firstInstallmentDate = defaultFirstInstallmentDate;
        needsUpdate = true;
        console.log(`⚠️  Fixed invalid firstInstallmentDate for plan ${plan.id} in project "${plan.project?.nameEn}"`);
      }

      // Check and fix deliveryDate
      if (!plan.deliveryDate || isNaN(plan.deliveryDate.getTime())) {
        updateData.deliveryDate = defaultDeliveryDate;
        needsUpdate = true;
        console.log(`⚠️  Fixed invalid deliveryDate for plan ${plan.id} in project "${plan.project?.nameEn}"`);
      }

      // Ensure delivery date is after first installment date
      const firstDate = updateData.firstInstallmentDate || plan.firstInstallmentDate;
      const deliveryDate = updateData.deliveryDate || plan.deliveryDate;

      if (deliveryDate && firstDate && deliveryDate <= firstDate) {
        // Set delivery date to 2 years after first installment
        updateData.deliveryDate = new Date(firstDate.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
        needsUpdate = true;
        console.log(`⚠️  Adjusted deliveryDate to be after firstInstallmentDate for plan ${plan.id}`);
      }

      if (needsUpdate) {
        await prisma.paymentPlan.update({
          where: { id: plan.id },
          data: updateData
        });
        fixedCount++;
      }
    }

    console.log(`✅ Payment plan date cleanup completed!`);
    console.log(`📈 Fixed ${fixedCount} out of ${paymentPlans.length} payment plans`);

    // Verify the fixes
    const invalidPlans = await prisma.paymentPlan.findMany({
      where: {
        OR: [
          { firstInstallmentDate: null },
          { deliveryDate: null }
        ]
      }
    });

    if (invalidPlans.length === 0) {
      console.log('🎉 All payment plans now have valid dates!');
    } else {
      console.log(`⚠️  Still ${invalidPlans.length} plans with null dates (these might be intentional)`);
    }

  } catch (error) {
    console.error('❌ Error during payment plan date cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  fixPaymentPlanDates();
}

export { fixPaymentPlanDates }; 