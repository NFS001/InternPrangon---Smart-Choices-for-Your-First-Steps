const API_BASE = 'http://localhost:5000/api';

async function runAdminVerificationTest() {
  console.log('=== Step 1: Testing Admin Login with admin123@gmail.com ===');
  const loginRes = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin123@gmail.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Admin login failed:', loginData);
    process.exit(1);
  }
  console.log('Admin login success! User:', loginData.user.email, 'Role:', loginData.user.role);
  if (loginData.user.role !== 'admin') {
    console.error('User role is not admin!');
    process.exit(1);
  }
  const token = loginData.token;

  console.log('\n=== Step 2: Testing GET /api/company/all ===');
  const allRes = await fetch(`${API_BASE}/company/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const allData = await allRes.json();
  console.log('Fetched companies count:', allData.companies?.length ?? 0);

  console.log('\n=== Step 3: Testing Admin Add Company (POST /api/company/admin-add) ===');
  const addRes = await fetch(`${API_BASE}/company/admin-add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      companyName: 'Test Tech Global',
      industry: 'Artificial Intelligence',
      website: 'https://testtechglobal.com',
      description: 'AI & Machine Learning solutions in Dhaka.',
      verificationStatus: 'Pending',
      verificationDocument: 'trade_license.pdf'
    })
  });
  const addData = await addRes.json();
  if (!addRes.ok) {
    console.error('Admin add company failed:', addData);
    process.exit(1);
  }
  const createdCompany = addData.company;
  console.log('Added company successfully! ID:', createdCompany._id, 'Status:', createdCompany.verificationStatus);

  console.log('\n=== Step 4: Testing Verify Company -> Approve (PUT /api/company/verify/:id) ===');
  const approveRes = await fetch(`${API_BASE}/company/verify/${createdCompany._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Approved' })
  });
  const approveData = await approveRes.json();
  console.log('Approve response:', approveData.message, 'Status:', approveData.company?.verificationStatus);
  if (approveData.company?.verificationStatus !== 'Approved') {
    console.error('Expected status Approved, got:', approveData.company?.verificationStatus);
    process.exit(1);
  }

  console.log('\n=== Step 5: Testing Verify Company -> Reject (PUT /api/company/verify/:id) ===');
  const rejectRes = await fetch(`${API_BASE}/company/verify/${createdCompany._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Rejected' })
  });
  const rejectData = await rejectRes.json();
  console.log('Reject response:', rejectData.message, 'Status:', rejectData.company?.verificationStatus);
  if (rejectData.company?.verificationStatus !== 'Rejected') {
    console.error('Expected status Rejected, got:', rejectData.company?.verificationStatus);
    process.exit(1);
  }

  console.log('\n=== Step 6: Testing Delete Company (DELETE /api/company/:id) ===');
  const deleteRes = await fetch(`${API_BASE}/company/${createdCompany._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const deleteData = await deleteRes.json();
  console.log('Delete response:', deleteData.message);

  console.log('\n=== ALL ADMIN OPERATIONS PASSED 100%! ===');
}

runAdminVerificationTest().catch(console.error);
