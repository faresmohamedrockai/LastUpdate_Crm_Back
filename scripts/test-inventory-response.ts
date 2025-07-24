import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInventoryResponse() {
  console.log('🧪 Testing inventory response formatting...');

  try {
    // Get inventories with payment plans to test the response format
    const inventories = await prisma.inventory.findMany({
      include: {
        project: { 
          include: { 
            developer: true, 
            zone: true,
            paymentPlans: true 
          } 
        },
        leads: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${inventories.length} inventories to test...`);

    for (const inventory of inventories) {
      console.log(`\n🏠 Inventory: ${inventory.titleEn || inventory.title}`);
      console.log(`   - paymentPlanIndex: ${inventory.paymentPlanIndex}`);
      
      // Simulate the response formatting logic
      const formattedResponse = {
        ...inventory,
        images: inventory.images ?? [],
        paymentPlan: inventory.paymentPlanIndex !== null && inventory.project?.paymentPlans && inventory.project.paymentPlans[inventory.paymentPlanIndex]
          ? {
              ...inventory.project.paymentPlans[inventory.paymentPlanIndex],
              firstInstallmentDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate
                ? inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate!.toISOString().split('T')[0]
                : null,
              deliveryDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate
                ? inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate!.toISOString().split('T')[0]
                : null,
            }
          : null,
      };

      if (formattedResponse.paymentPlan) {
        console.log(`   ✅ Payment Plan Found:`);
        console.log(`      - firstInstallmentDate: "${formattedResponse.paymentPlan.firstInstallmentDate}" (type: ${typeof formattedResponse.paymentPlan.firstInstallmentDate})`);
        console.log(`      - deliveryDate: "${formattedResponse.paymentPlan.deliveryDate}" (type: ${typeof formattedResponse.paymentPlan.deliveryDate})`);
        
        // Test JSON serialization
        const jsonString = JSON.stringify(formattedResponse.paymentPlan);
        const parsedBack = JSON.parse(jsonString);
        
        console.log(`   🔍 JSON Test:`);
        console.log(`      - Serialized firstInstallmentDate: "${parsedBack.firstInstallmentDate}"`);
        console.log(`      - Serialized deliveryDate: "${parsedBack.deliveryDate}"`);
        
        // Test Date.parse compatibility
        if (parsedBack.firstInstallmentDate) {
          const parsed = Date.parse(parsedBack.firstInstallmentDate);
          console.log(`      - Date.parse(firstInstallmentDate): ${isNaN(parsed) ? 'FAILED ❌' : 'SUCCESS ✅'}`);
        }
        
        if (parsedBack.deliveryDate) {
          const parsed = Date.parse(parsedBack.deliveryDate);
          console.log(`      - Date.parse(deliveryDate): ${isNaN(parsed) ? 'FAILED ❌' : 'SUCCESS ✅'}`);
        }
      } else {
        console.log(`   ✅ No payment plan (properly returns null)`);
        
        // Test JSON serialization of null
        const jsonString = JSON.stringify({ paymentPlan: formattedResponse.paymentPlan });
        const parsedBack = JSON.parse(jsonString);
        console.log(`   🔍 JSON Test: paymentPlan = ${parsedBack.paymentPlan} (${typeof parsedBack.paymentPlan})`);
      }
    }

    // Test the problematic case - what happens with empty objects
    console.log('\n🔍 Testing problematic empty object case...');
    const problematicResponse = {
      firstInstallmentDate: {},
      deliveryDate: {}
    };
    
    console.log('❌ Problematic response (what we had before):');
    console.log(`   - firstInstallmentDate: ${JSON.stringify(problematicResponse.firstInstallmentDate)}`);
    console.log(`   - deliveryDate: ${JSON.stringify(problematicResponse.deliveryDate)}`);
    console.log(`   - Date.parse(firstInstallmentDate): ${Date.parse(problematicResponse.firstInstallmentDate as any)}`);
    console.log(`   - Date.parse(deliveryDate): ${Date.parse(problematicResponse.deliveryDate as any)}`);

  } catch (error) {
    console.error('❌ Error during inventory response testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if called directly
if (require.main === module) {
  testInventoryResponse();
}

export { testInventoryResponse }; 