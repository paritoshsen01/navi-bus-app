// Simple floating particles animation in background using canvas
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > width) this.speedX = -this.speedX;
      if (this.y < 0 || this.y > height) this.speedY = -this.speedY;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 0, ${this.alpha})`;
      ctx.fill();
    }
  }

  const particles = [];
  const particleCount = 80;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

const googleClientId = '482679912867-70lsamqvtrlt04v12t6oqvn6rapcesbl.apps.googleusercontent.com';

// Google login integration
function handleCredentialResponse(response) {
  // Decode JWT token to extract user info
  const base64Url = response.credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  const user = JSON.parse(jsonPayload);

  // Send login notification to backend
  fetch('http://localhost:3001/notify-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: user.email,
      name: user.name
    })
  }).then(response => response.json())
    .then(data => {
      console.log('Notification response:', data);
    })
    .catch(error => {
      console.error('Notification error:', error);
    });

  // Redirect to dashboard with user info in query params
  const params = new URLSearchParams({
    name: user.name,
    picture: user.picture
  });
  window.location.href = 'customer-dashboard.html?' + params.toString();
}

window.onload = function() {
  google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    document.getElementById('google-login-btn'),
    { theme: 'outline', size: 'large' }
  );
  google.accounts.id.prompt();
};
