// Test script to create a rule and then fetch its content
const API_URL = 'http://localhost:3000/rpc';

async function testRuleCreation() {
  // First, you need to login and get a token
  console.log('Please login first and copy your JWT token from localStorage');
  console.log('In browser console, run: localStorage.getItem("access_token")');
  console.log('Then update the TOKEN variable below');
  
  const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzZGQ0OTdmMS0yMmYwLTRiZTMtOWFlYi02ZjVkZGM4YTIzNDYiLCJlbWFpbCI6Im1hdHR5YWNvY2Fjb3JhMEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6Im1hdHR5YXRlYSIsImVtYWlsVmVyaWZpZWQiOnRydWUsImlhdCI6MTc1MzA3OTEyOCwiZXhwIjoxNzUzNjgzOTI4fQ.i1Kvb704hOtc0ZBdieHc-8Nazy6DK2znVvLJpYmpQyE'; // Update this!
  
  if (TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.error('Please update the TOKEN variable with your actual JWT token');
    return;
  }
  
  // Create a test rule
  console.log('Creating test rule...');
  const createResponse = await fetch(`${API_URL}/rules/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      json: {
        name: `testrule${Date.now()}`,
        description: 'Test rule to verify content storage',
        visibility: 'public',
        tags: ['test'],
        content: '# Test Rule\n\nThis is a test rule to verify that content is properly stored in R2.'
      }
    })
  });
  
  const createResult = await createResponse.json();
  console.log('Create result:', createResult);
  
  if (createResult.json && createResult.json.data && createResult.json.data.issues) {
    console.error('Validation errors:');
    createResult.json.data.issues.forEach(issue => {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  
  if (!createResult.id) {
    console.error('Failed to create rule');
    return;
  }
  
  // Now try to fetch the content
  console.log('\nFetching rule content...');
  const getContentResponse = await fetch(`${API_URL}/rules/getContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      json: {
        id: createResult.id
      }
    })
  });
  
  console.log('Response status:', getContentResponse.status);
  const contentResult = await getContentResponse.json();
  console.log('Content result:', contentResult);
}

// Instructions
console.log('=== Test Rule Creation Script ===');
console.log('1. Login to the application first');
console.log('2. Open browser developer console');
console.log('3. Run: localStorage.getItem("access_token")');
console.log('4. Copy the token value');
console.log('5. Update the TOKEN variable in this script');
console.log('6. Run: testRuleCreation()');

testRuleCreation()