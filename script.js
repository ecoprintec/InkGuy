/**
 * INKGUY - Main Interactive JavaScript Module
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Navigation
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const body = document.body;

  if (menuToggle && mobileOverlay) {
    const dropdowns = document.querySelectorAll('.nav .dropdown');

    function setMenuState(isOpen) {
      body.classList.toggle('menu-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-open');
        const trigger = dropdown.querySelector(':scope > a');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }

    function toggleMenu() {
      setMenuState(!body.classList.contains('menu-open'));
    }

    function closeMenu() {
      setMenuState(false);
    }

    menuToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', closeMenu);

    // Close menu when clicking destination navigation links (exclude dropdown trigger in mobile drawer)
    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        const dropdownParent = link.closest('.dropdown');
        const isDropdownTrigger = dropdownParent && link === dropdownParent.querySelector(':scope > a');

        if (window.innerWidth <= 980 && isDropdownTrigger) {
          e.preventDefault();
          const isExpanded = dropdownParent.classList.toggle('is-open');
          link.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
          return;
        }

        if (window.innerWidth <= 980) closeMenu();
      });
    });

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && body.classList.contains('menu-open')) closeMenu();
    });
  }

  // 2. Scroll to Top Floating Button
  const scrollTopBtn = document.querySelector('.scroll-to-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 3. Formspree AJAX Contact Form Handling
  const form = document.querySelector('#contact form');
  if (form) {
    let isCooldown = false;
    let cooldownTimer = null;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isCooldown) {
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent.trim() : '문의하기';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '전송 중...';
      }

      // Remove existing status messages
      const existingMessage = form.querySelector('.form-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset();
          showFormMessage(form, 'success', '문의가 성공적으로 접수되었습니다! 빠른 시일 내에 연락드리겠습니다.');
          startCooldown(10);
        } else {
          const data = await response.json().catch(() => null);
          if (data && data.errors) {
            showFormMessage(form, 'error', '입력 항목 오류: ' + data.errors.map(err => err.message).join(', '));
          } else {
            showFormMessage(form, 'error', '전송 실패: 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
          resetButton();
        }
      } catch (error) {
        showFormMessage(form, 'error', '네트워크 연결 오류: 인터넷 연결 상태를 확인 후 다시 시도해 주세요.');
        resetButton();
      }

      function startCooldown(seconds) {
        isCooldown = true;
        let remaining = seconds;
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = `재문의 대기 중 (${remaining}초)`;

          if (cooldownTimer) clearInterval(cooldownTimer);
          cooldownTimer = setInterval(() => {
            remaining -= 1;
            if (remaining > 0) {
              submitButton.textContent = `재문의 대기 중 (${remaining}초)`;
            } else {
              clearInterval(cooldownTimer);
              cooldownTimer = null;
              resetButton();
            }
          }, 1000);
        }
      }

      function resetButton() {
        isCooldown = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  function showFormMessage(targetForm, type, messageText) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = messageText;

    const submitButton = targetForm.querySelector('button[type="submit"]');
    if (submitButton) {
      targetForm.insertBefore(messageDiv, submitButton);
    } else {
      targetForm.appendChild(messageDiv);
    }

    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 4. Auto-select Service in Contact Form based on URL parameter or link context
  const serviceSelect = document.querySelector('#service');
  if (serviceSelect) {
    const serviceMap = {
      'printer': '프린터 임대',
      'copier': '복합기 임대',
      'supplies': '잉크·토너 공급',
      'maintenance': '유지보수 | A/S',
      'remote': '원격지원',
      'support': '원격지원'
    };

    function selectServiceOption(serviceKey) {
      if (!serviceKey) return;
      const targetText = serviceMap[serviceKey.toLowerCase()] || serviceKey;
      for (let i = 0; i < serviceSelect.options.length; i++) {
        const opt = serviceSelect.options[i];
        if (opt.text.includes(targetText) || opt.value.includes(targetText)) {
          serviceSelect.selectedIndex = i;
          serviceSelect.dispatchEvent(new Event('change'));
          // Visual focus and highlight feedback
          serviceSelect.style.borderColor = 'var(--primary)';
          serviceSelect.style.boxShadow = '0 0 0 3px rgba(22, 93, 255, 0.2)';
          setTimeout(() => {
            serviceSelect.style.borderColor = '';
            serviceSelect.style.boxShadow = '';
          }, 1800);
          break;
        }
      }
    }

    // Check URL query parameters or hash on initial load
    const urlParams = new URLSearchParams(window.location.search);
    let serviceParam = urlParams.get('service');
    if (!serviceParam && window.location.hash.includes('service=')) {
      const hashQuery = window.location.hash.split('?')[1];
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        serviceParam = hashParams.get('service');
      }
    }

    if (serviceParam) {
      selectServiceOption(serviceParam);
    }

    // In-page CTA buttons with service intent
    document.querySelectorAll('a[href*="service="], a[data-service], #support a[href*="#contact"]').forEach(cta => {
      cta.addEventListener('click', () => {
        const dataService = cta.getAttribute('data-service');
        const href = cta.getAttribute('href') || '';
        if (dataService) {
          selectServiceOption(dataService);
        } else if (href.includes('service=')) {
          const match = href.match(/service=([a-zA-Z0-9_\-]+)/);
          if (match && match[1]) {
            selectServiceOption(match[1]);
          }
        } else if (cta.closest('#support')) {
          selectServiceOption('maintenance');
        }
      });
    });
  }

  // 5. Dark Mode Theme Toggle
  const themeToggles = document.querySelectorAll('.theme-toggle');

  function getPreferredTheme() {
    return localStorage.getItem('inkguy-theme') || 'light';
  }

  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      localStorage.setItem('inkguy-theme', theme);
    }
    themeToggles.forEach(toggle => {
      const isDark = theme === 'dark';
      toggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
      toggle.setAttribute('title', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }

  // Initialize theme (default to light mode unless explicitly saved)
  applyTheme(getPreferredTheme(), !!localStorage.getItem('inkguy-theme'));

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme, true);
    });
  });
});
