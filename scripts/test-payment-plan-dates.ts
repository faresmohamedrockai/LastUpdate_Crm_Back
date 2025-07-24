import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPaymentPlanDates() {
  console.log('🧪 Testing payment plan date validation...');

  try {
    // Get all payment plans to test
    const paymentPlans = await prisma.paymentPlan.findMany({
      include: {
        project: {
          select: { nameEn: true }
        }
      }
    });

    console.log(`📊 Testing ${paymentPlans.length} payment plans...`);

    let validCount = 0;
    let invalidCount = 0;

    for (const plan of paymentPlans) {
      const projectName = plan.project?.nameEn || 'Unknown';
      
      // Test firstInstallmentDate
      if (plan.firstInstallmentDate) {
        const firstDate = new Date(plan.firstInstallmentDate);
        if (isNaN(firstDate.getTime())) {
          console.log(`❌ Invalid firstInstallmentDate in plan ${plan.id} (Project: ${projectName})`);
          invalidCount++;
          continue;
        } else {
          console.log(`✅ Valid firstInstallmentDate: ${firstDate.toISOString().split('T')[0]} (Project: ${projectName})`);
        }
      }

      // Test deliveryDate
      if (plan.deliveryDate) {
        const deliveryDate = new Date(plan.deliveryDate);
        if (isNaN(deliveryDate.getTime())) {
          console.log(`❌ Invalid deliveryDate in plan ${plan.id} (Project: ${projectName})`);
          invalidCount++;
          continue;
        } else {
          console.log(`✅ Valid deliveryDate: ${deliveryDate.toISOString().split('T')[0]} (Project: ${projectName})`);
        }
      }

      // Test date order
      if (plan.firstInstallmentDate && plan.deliveryDate) {
        const firstDate = new Date(plan.firstInstallmentDate);
        const deliveryDate = new Date(plan.deliveryDate);
        
        if (deliveryDate <= firstDate) {
          console.log(`⚠️  Warning: Delivery date is not after first installment date in plan ${plan.id} (Project: ${projectName})`);
        } else {
          console.log(`✅ Correct date order: delivery after first installment (Project: ${projectName})`);
        }
      }

      validCount++;
    }

    console.log('\n📈 Test Results:');
    console.log(`✅ Valid payment plans: ${validCount}`);
    console.log(`❌ Invalid payment plans: ${invalidCount}`);
    
    if (invalidCount === 0) {
      console.log('🎉 All payment plan dates are valid!');
    } else {
      console.log('⚠️  Some payment plans have invalid dates and need attention.');
    }

    // Test Date.parse() compatibility
    console.log('\n🔍 Testing Date.parse() compatibility...');
    for (const plan of paymentPlans) {
      if (plan.firstInstallmentDate) {
        const parsed = Date.parse(plan.firstInstallmentDate.toISOString());
        if (isNaN(parsed)) {
          console.log(`❌ Date.parse() failed for firstInstallmentDate in plan ${plan.id}`);
        } else {
          console.log(`✅ Date.parse() successful for firstInstallmentDate in plan ${plan.id}`);
        }
      }
      
      if (plan.deliveryDate) {
        const parsed = Date.parse(plan.deliveryDate.toISOString());
        if (isNaN(parsed)) {
          console.log(`❌ Date.parse() failed for deliveryDate in plan ${plan.id}`);
        } else {
          console.log(`✅ Date.parse() successful for deliveryDate in plan ${plan.id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during payment plan date testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if called directly
if (require.main === module) {
  testPaymentPlanDates();
}

export { testPaymentPlanDates }; 