const axios = require('axios');

async function testLiveAPI() {
  console.log('🔍 Testing live API endpoint...');
  
  try {
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test the properties endpoint
    const response = await axios.get('http://localhost:3000/properties');
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Number of properties:', response.data.properties?.length || 0);
    
    if (response.data.properties && response.data.properties.length > 0) {
      response.data.properties.forEach((property, index) => {
        console.log(`\n🏠 Property ${index + 1}: ${property.titleEn || property.title || 'Unknown'}`);
        console.log(`   - paymentPlanIndex: ${property.paymentPlanIndex}`);
        
        if (property.paymentPlan) {
          console.log(`   ✅ Payment Plan:`);
          console.log(`      - firstInstallmentDate: "${property.paymentPlan.firstInstallmentDate}" (${typeof property.paymentPlan.firstInstallmentDate})`);
          console.log(`      - deliveryDate: "${property.paymentPlan.deliveryDate}" (${typeof property.paymentPlan.deliveryDate})`);
          
          // Test if these are the problematic empty objects
          if (typeof property.paymentPlan.firstInstallmentDate === 'object' && 
              property.paymentPlan.firstInstallmentDate !== null &&
              Object.keys(property.paymentPlan.firstInstallmentDate).length === 0) {
            console.log(`      ❌ PROBLEM: firstInstallmentDate is empty object {}`);
          } else {
            console.log(`      ✅ firstInstallmentDate format looks good`);
          }
          
          if (typeof property.paymentPlan.deliveryDate === 'object' && 
              property.paymentPlan.deliveryDate !== null &&
              Object.keys(property.paymentPlan.deliveryDate).length === 0) {
            console.log(`      ❌ PROBLEM: deliveryDate is empty object {}`);
          } else {
            console.log(`      ✅ deliveryDate format looks good`);
          }
        } else {
          console.log(`   ⚪ No payment plan (${property.paymentPlan})`);
        }
      });
    } else {
      console.log('ℹ️  No properties found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Server not running or not accessible on localhost:3000');
    }
  }
}

testLiveAPI(); 