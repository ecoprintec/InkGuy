/**
 * InkGuy - Main Interactive JavaScript Module
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Navigation
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const body = document.body;

  if (menuToggle && mobileOverlay) {
    function toggleMenu() {
      const isOpen = body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function closeMenu() {
      body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    menuToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', closeMenu);

    // Close menu when clicking navigation links
    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) {
        closeMenu();
      }
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '전송';

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
        } else {
          const data = await response.json();
          if (data && data.errors) {
            showFormMessage(form, 'error', '입력 항목 오류: ' + data.errors.map(err => err.message).join(', '));
          } else {
            showFormMessage(form, 'error', '전송 실패: 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
        }
      } catch (error) {
        showFormMessage(form, 'error', '네트워크 연결 오류: 인터넷 연결 상태를 확인 후 다시 시도해 주세요.');
      } finally {
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
});
