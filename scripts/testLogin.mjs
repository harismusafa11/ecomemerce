// Test login API endpoint
async function testLogin() {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@tapakpamungkas.com',
                password: 'admin123'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (data.isAdmin) {
            console.log('✅ User is admin!');
        } else {
            console.log('❌ User is NOT admin');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
