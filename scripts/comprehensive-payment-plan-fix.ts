import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensivePaymentPlanFix() {
  console.log('🔍 Starting comprehensive payment plan examination and fix...');

  try {
    // Get ALL payment plans including those with null dates
    const paymentPlans = await prisma.paymentPlan.findMany({
      include: {
        project: {
          select: { nameEn: true, id: true }
        }
      }
    });

    console.log(`📊 Found ${paymentPlans.length} payment plans to examine...`);

    // Examine each payment plan in detail
    for (const plan of paymentPlans) {
      const projectName = plan.project?.nameEn || 'Unknown';
      console.log(`\n🔎 Examining plan ${plan.id} in project "${projectName}":`);
      
      console.log(`  - firstInstallmentDate: ${plan.firstInstallmentDate}`);
      console.log(`  - deliveryDate: ${plan.deliveryDate}`);
      console.log(`  - firstInstallmentDate type: ${typeof plan.firstInstallmentDate}`);
      console.log(`  - deliveryDate type: ${typeof plan.deliveryDate}`);
    }

    // Now fix ALL payment plans systematically
    console.log('\n🔧 Starting systematic fix...');
    
    let fixedCount = 0;
    const currentDate = new Date();
    const defaultFirstInstallmentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1); // Next month, 1st day
    const defaultDeliveryDate = new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), 1); // 2 years later

    for (const plan of paymentPlans) {
      let needsUpdate = false;
      const updateData: any = {};
      const projectName = plan.project?.nameEn || 'Unknown';

      // Check firstInstallmentDate
      if (!plan.firstInstallmentDate || 
          plan.firstInstallmentDate === null || 
          (plan.firstInstallmentDate && isNaN(new Date(plan.firstInstallmentDate).getTime()))) {
        updateData.firstInstallmentDate = defaultFirstInstallmentDate;
        needsUpdate = true;
        console.log(`⚠️  Fixed firstInstallmentDate for plan ${plan.id} in project "${projectName}"`);
      }

      // Check deliveryDate
      if (!plan.deliveryDate || 
          plan.deliveryDate === null || 
          (plan.deliveryDate && isNaN(new Date(plan.deliveryDate).getTime()))) {
        updateData.deliveryDate = defaultDeliveryDate;
        needsUpdate = true;
        console.log(`⚠️  Fixed deliveryDate for plan ${plan.id} in project "${projectName}"`);
      }

      // If we have updates, apply them
      if (needsUpdate) {
        try {
          await prisma.paymentPlan.update({
            where: { id: plan.id },
            data: updateData
          });
          fixedCount++;
          console.log(`✅ Successfully updated plan ${plan.id}`);
        } catch (error) {
          console.error(`❌ Failed to update plan ${plan.id}:`, error);
        }
      }
    }

    console.log(`\n📈 Fix completed! Updated ${fixedCount} payment plans.`);

    // Verify the fix by re-checking all payment plans
    console.log('\n🔍 Verifying fix...');
    const verifyPlans = await prisma.paymentPlan.findMany({
      include: {
        project: {
          select: { nameEn: true }
        }
      }
    });

    let allValid = true;
    for (const plan of verifyPlans) {
      const projectName = plan.project?.nameEn || 'Unknown';
      
      // Check if dates are valid
      const firstDateValid = plan.firstInstallmentDate && !isNaN(new Date(plan.firstInstallmentDate).getTime());
      const deliveryDateValid = plan.deliveryDate && !isNaN(new Date(plan.deliveryDate).getTime());
      
      if (!firstDateValid || !deliveryDateValid) {
        console.log(`❌ Plan ${plan.id} in project "${projectName}" still has invalid dates`);
        allValid = false;
      } else {
        const firstDate = new Date(plan.firstInstallmentDate!);
        const deliveryDate = new Date(plan.deliveryDate!);
        console.log(`✅ Plan ${plan.id} in project "${projectName}" - First: ${firstDate.toISOString().split('T')[0]}, Delivery: ${deliveryDate.toISOString().split('T')[0]}`);
      }
    }

    if (allValid) {
      console.log('\n🎉 All payment plans now have valid dates!');
    } else {
      console.log('\n⚠️  Some payment plans still have issues.');
    }

    // Test API response format
    console.log('\n🔍 Testing API response format...');
    const apiTestPlans = verifyPlans.map(plan => ({
      ...plan,
      firstInstallmentDate: plan.firstInstallmentDate 
        ? plan.firstInstallmentDate.toISOString().split('T')[0] 
        : null,
      deliveryDate: plan.deliveryDate 
        ? plan.deliveryDate.toISOString().split('T')[0] 
        : null,
    }));

    for (const plan of apiTestPlans) {
      console.log(`📋 Plan ${plan.id}:`);
      console.log(`  - API firstInstallmentDate: "${plan.firstInstallmentDate}"`);
      console.log(`  - API deliveryDate: "${plan.deliveryDate}"`);
      
      // Test Date.parse compatibility
      if (plan.firstInstallmentDate) {
        const parsed = Date.parse(plan.firstInstallmentDate);
        console.log(`  - Date.parse(firstInstallmentDate): ${isNaN(parsed) ? 'FAILED' : 'SUCCESS'}`);
      }
      
      if (plan.deliveryDate) {
        const parsed = Date.parse(plan.deliveryDate);
        console.log(`  - Date.parse(deliveryDate): ${isNaN(parsed) ? 'FAILED' : 'SUCCESS'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during comprehensive payment plan fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  comprehensivePaymentPlanFix();
}

export { comprehensivePaymentPlanFix }; 