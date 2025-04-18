document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  console.log('Form submitted'); // Log to confirm form submission

  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/auth/login', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are included in the request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Login failed: ${errorText}`);
      return;
    }

    // Login successful, redirect to search page
    window.location.href = 'search.html';
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong. Please check the console.');
  }
});
