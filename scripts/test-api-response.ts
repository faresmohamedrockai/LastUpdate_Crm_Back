import axios from 'axios';

async function testApiResponse() {
  console.log('🔍 Testing actual API response...');

  try {
    // Test the projects endpoint
    const response = await axios.get('http://localhost:3000/projects');
    
    console.log('📊 API Response Status:', response.status);
    console.log('📋 Response Data Structure:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      const projects = response.data.data;
      
      for (const project of projects) {
        console.log(`\n🏗️  Project: ${project.nameEn}`);
        
        if (project.paymentPlans && project.paymentPlans.length > 0) {
          for (const plan of project.paymentPlans) {
            console.log(`  📋 Payment Plan ${plan.id}:`);
            console.log(`    - firstInstallmentDate: "${plan.firstInstallmentDate}" (type: ${typeof plan.firstInstallmentDate})`);
            console.log(`    - deliveryDate: "${plan.deliveryDate}" (type: ${typeof plan.deliveryDate})`);
            
            // Test Date.parse compatibility
            if (plan.firstInstallmentDate) {
              const parsed = Date.parse(plan.firstInstallmentDate);
              console.log(`    - Date.parse(firstInstallmentDate): ${isNaN(parsed) ? 'FAILED ❌' : 'SUCCESS ✅'}`);
              if (!isNaN(parsed)) {
                console.log(`    - Parsed date: ${new Date(parsed).toISOString()}`);
              }
            } else {
              console.log(`    - firstInstallmentDate is null/empty`);
            }
            
            if (plan.deliveryDate) {
              const parsed = Date.parse(plan.deliveryDate);
              console.log(`    - Date.parse(deliveryDate): ${isNaN(parsed) ? 'FAILED ❌' : 'SUCCESS ✅'}`);
              if (!isNaN(parsed)) {
                console.log(`    - Parsed date: ${new Date(parsed).toISOString()}`);
              }
            } else {
              console.log(`    - deliveryDate is null/empty`);
            }
          }
        } else {
          console.log(`  ℹ️  No payment plans found for project ${project.nameEn}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing API response:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testApiResponse();
}, 3000);

export { testApiResponse }; 