/**
 * app.js — Login form logic, validation, animations, counter
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM refs ────────────────────────────────────────────────── */
  const form        = document.getElementById('loginForm');
  const emailInput  = document.getElementById('email');
  const passInput   = document.getElementById('password');
  const emailError  = document.getElementById('emailError');
  const passError   = document.getElementById('passwordError');
  const fieldEmail  = document.getElementById('fieldEmail');
  const fieldPw     = document.getElementById('fieldPassword');
  const submitBtn   = document.getElementById('submitBtn');
  const togglePw    = document.getElementById('togglePw');
  const eyeOpen     = togglePw.querySelector('.eye-open');
  const eyeClosed   = togglePw.querySelector('.eye-closed');
  const googleBtn   = document.getElementById('googleBtn');
  const registerLink = document.getElementById('registerLink');
  const formCard    = document.getElementById('formCard');

  /* ── Animated counters (brand stats) ─────────────────────────── */
  function animateCounter(el, end, duration = 1800) {
    const suffix = el.nextElementSibling?.classList.contains('stat-suffix')
      ? el.nextElementSibling.textContent
      : '';
    const start     = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease     = 1 - (1 - progress) * (1 - progress);
      const current  = Math.floor(start + (end - start) * ease);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger counters when panel is visible
  const statNums = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach(el => {
          animateCounter(el, parseInt(el.dataset.count, 10));
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  if (statNums.length) observer.observe(statNums[0].closest('.brand-stats'));


  /* ── Toggle password visibility ──────────────────────────────── */
  togglePw.addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type   = isPass ? 'text' : 'password';
    eyeOpen.style.display   = isPass ? 'none'  : '';
    eyeClosed.style.display = isPass ? ''      : 'none';
    passInput.focus();
  });


  /* ── Validation helpers ───────────────────────────────────────── */
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function setFieldState(field, errorEl, state, msg = '') {
    field.classList.toggle('is-valid',  state === 'valid');
    field.classList.toggle('is-error',  state === 'error');
    errorEl.textContent = msg;
  }

  function validateEmail() {
    const val = emailInput.value;
    if (!val) {
      setFieldState(fieldEmail, emailError, 'error', 'Email address is required.');
      return false;
    }
    if (!isValidEmail(val)) {
      setFieldState(fieldEmail, emailError, 'error', 'Please enter a valid email.');
      return false;
    }
    setFieldState(fieldEmail, emailError, 'valid');
    return true;
  }

  function validatePassword() {
    const val = passInput.value;
    if (!val) {
      setFieldState(fieldPw, passError, 'error', 'Password is required.');
      return false;
    }
    if (val.length < 6) {
      setFieldState(fieldPw, passError, 'error', 'Password must be at least 6 characters.');
      return false;
    }
    setFieldState(fieldPw, passError, 'valid');
    return true;
  }

  // Live validation on blur
  emailInput.addEventListener('blur', () => {
    if (emailInput.value) validateEmail();
  });

  passInput.addEventListener('blur', () => {
    if (passInput.value) validatePassword();
  });

  // Clear errors on input
  emailInput.addEventListener('input', () => {
    if (fieldEmail.classList.contains('is-error')) {
      setFieldState(fieldEmail, emailError, '');
    }
  });

  passInput.addEventListener('input', () => {
    if (fieldPw.classList.contains('is-error')) {
      setFieldState(fieldPw, passError, '');
    }
  });


  /* ── Ripple effect on button ──────────────────────────────────── */
  function createRipple(btn, e) {
    const rect   = btn.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;
      width:0;height:0;
      border-radius:50%;
      background:rgba(255,255,255,0.25);
      left:${x}px;top:${y}px;
      transform:translate(-50%,-50%);
      animation:ripple-anim 0.6s ease-out forwards;
      pointer-events:none;
    `;
    if (!document.getElementById('ripple-style')) {
      const s = document.createElement('style');
      s.id = 'ripple-style';
      s.textContent = `@keyframes ripple-anim{to{width:240px;height:240px;opacity:0}}`;
      document.head.appendChild(s);
    }
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  submitBtn.addEventListener('click', (e) => {
    createRipple(submitBtn, e);
  });


  /* ── Form submit ──────────────────────────────────────────────── */
  function showSuccess() {
    // Build success overlay dynamically
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="check-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3>You're in!</h3>
      <p>Redirecting to your dashboard…</p>
    `;
    formCard.style.position = 'relative';
    formCard.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOk = validateEmail();
    const passOk  = validatePassword();

    if (!emailOk || !passOk) {
      // Shake the form card
      formCard.style.animation = 'none';
      formCard.offsetHeight; // reflow
      formCard.style.animation = 'shake 0.4s ease';
      if (!document.getElementById('shake-style')) {
        const s = document.createElement('style');
        s.id = 'shake-style';
        s.textContent = `
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-8px)}
            40%{transform:translateX(8px)}
            60%{transform:translateX(-5px)}
            80%{transform:translateX(5px)}
          }
        `;
        document.head.appendChild(s);
      }
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');

    // Simulate async login (replace with real fetch)
    await new Promise(r => setTimeout(r, 1800));

    submitBtn.classList.remove('loading');
    showSuccess();
  });


  /* ── Google button interaction ───────────────────────────────── */
  googleBtn.addEventListener('click', () => {
    googleBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { googleBtn.style.transform = ''; }, 150);
    // Placeholder: wire up OAuth here
    console.log('Google OAuth triggered');
  });


  /* ── Register link animation ──────────────────────────────────── */
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    formCard.style.animation = 'none';
    formCard.offsetHeight;
    formCard.style.animation = 'card-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both';
    // Show toast
    showToast('Registration page coming soon!');
  });


  /* ── Toast notification ───────────────────────────────────────── */
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position:fixed;
      bottom:28px;left:50%;
      transform:translateX(-50%) translateY(20px);
      background:rgba(20,22,40,0.95);
      border:1px solid rgba(99,102,241,0.3);
      color:#e8eaf6;
      padding:10px 20px;
      border-radius:100px;
      font-family:'DM Sans',sans-serif;
      font-size:0.82rem;
      white-space:nowrap;
      z-index:9999;
      opacity:0;
      transition:all 0.3s ease;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      toast.addEventListener('transitionend', () => toast.remove());
    }, 2800);
  }

  /* ── Keyboard shortcut: Enter to submit ──────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement !== submitBtn) {
      if (
        document.activeElement === emailInput ||
        document.activeElement === passInput
      ) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
  });

});
