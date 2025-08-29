document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('form');
    
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const termsAccepted = document.getElementById('terms').checked;

      // Basic validation
      if (!termsAccepted) {
          alert("Please accept the Terms of Service in our Privacy Policy.");
          return;
      }

      if (password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
      }

      // Create the user object to be sent to the backend
      const newUser = {
          email,
          username,
          password
      };

      try {
        // Send registration data to backend
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Registration successful!');
          window.location.href = './login.html'; // Redirect to login page
        } else {
          alert(result.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
      }
    });
  }
});
