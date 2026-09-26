// app-info.js - منطق صفحة معلومات التطبيق وشريط التنقل والقائمة الجانبية
document.addEventListener('DOMContentLoaded', () => {
  // عناصر القائمة الجانبية
  const menuBtn = document.getElementById('menu-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerScrollLinks = document.querySelectorAll('.drawer-scroll-link');

  // عناصر البحث
  const topSearchInput = document.getElementById('top-search-input');
  const clearTopSearch = document.getElementById('clear-top-search');
  const drawerSearchInput = document.getElementById('drawer-search-input');

  // عناصر التثبيت والإشعار
  const mainInstallBtn = document.getElementById('main-install-btn');
  const installText = document.getElementById('install-text');
  const installProgressBar = document.getElementById('install-progress-bar');
  const shareBtn = document.getElementById('share-btn');
  const appToast = document.getElementById('app-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-msg');

  let toastTimeout = null;

  // ==========================================================================
  // 1. التحكم في القائمة الجانبية (Side Drawer)
  // ==========================================================================
  function openDrawer() {
    if (!sideDrawer || !drawerOverlay) return;
    sideDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    sideDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!sideDrawer || !drawerOverlay) return;
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    sideDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item').forEach((item) => {
    item.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // ==========================================================================
  // دعم سحب اللمس المعكوس: اسحب يسار تفتح، اسحب يمين تغلق
  // ==========================================================================
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const timeElapsed = Date.now() - touchStartTime;

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.15 && timeElapsed < 650) {
      const isDrawerOpen = sideDrawer && sideDrawer.classList.contains('open');

      if (!isDrawerOpen) {
        // اسحب يسار تفتح (diffX < -35)
        if (diffX < -35) {
          openDrawer();
        }
      } else {
        // اسحب يمين تغلق (diffX > 35)
        if (diffX > 35) {
          closeDrawer();
        }
      }
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // التنقل السلس عند الضغط على روابط الأقسام في القائمة
  drawerScrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        closeDrawer();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const topOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - topOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ==========================================================================
  // 2. البحث التفاعلي (Search Functionality)
  // ==========================================================================
  function handleSearch(query) {
    const q = query.trim().toLowerCase();
    const contentCards = document.querySelectorAll('.content-card, .app-hero-card');

    if (!q) {
      contentCards.forEach((card) => {
        card.style.display = '';
        card.style.opacity = '1';
      });
      return;
    }

    contentCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      if (text.includes(q)) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.opacity = '0.25';
      }
    });
  }

  if (topSearchInput) {
    topSearchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      if (clearTopSearch) {
        clearTopSearch.style.display = value ? 'block' : 'none';
      }
      handleSearch(value);
    });
  }

  if (clearTopSearch) {
    clearTopSearch.addEventListener('click', () => {
      if (topSearchInput) {
        topSearchInput.value = '';
        clearTopSearch.style.display = 'none';
        handleSearch('');
        topSearchInput.focus();
      }
    });
  }

  if (drawerSearchInput) {
    drawerSearchInput.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase().trim();
      const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-app-item');
      drawerLinks.forEach((el) => {
        const text = el.textContent.toLowerCase();
        el.style.display = !value || text.includes(value) ? '' : 'none';
      });
    });
  }

  // ==========================================================================
  // 3. التثبيت الداخلي والتنزيل الصامت (Silent In-App Install APK)
  // ==========================================================================
  function showToast(title, message, duration = 3500) {
    if (!appToast) return;
    if (toastTimeout) clearTimeout(toastTimeout);

    if (toastTitle) toastTitle.textContent = title;
    if (toastMsg) toastMsg.textContent = message;

    appToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      appToast.classList.remove('show');
    }, duration);
  }

  function downloadApkSilently(url, filename = 'aloushstores.apk') {
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    a.setAttribute('target', '_self');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
    }, 1000);
  }

  // عناصر التثبيت الجديد والتقدم الدائري
  const circleProgressWrap = document.getElementById('circle-progress-wrap');
  const progressCircle = document.getElementById('progress-circle');
  const progressPercent = document.getElementById('progress-percent');
  const installedActionsGroup = document.getElementById('installed-actions-group');
  const openAppBtn = document.getElementById('open-app-btn');
  const uninstallBtn = document.getElementById('uninstall-btn');
  const installIcon = document.getElementById('install-icon');

  const CIRCUMFERENCE = 94.25; // 2 * PI * 15

  // التحقق من حالة التثبيت المحفوظة مسبقاً
  function checkInstalledState() {
    const isInstalled = localStorage.getItem('aloush_installed') === 'true';
    if (isInstalled && mainInstallBtn && installedActionsGroup) {
      mainInstallBtn.style.display = 'none';
      installedActionsGroup.style.display = 'flex';
    } else if (mainInstallBtn && installedActionsGroup) {
      mainInstallBtn.style.display = 'flex';
      installedActionsGroup.style.display = 'none';
      if (installText) installText.textContent = 'تثبيت';
      if (circleProgressWrap) circleProgressWrap.style.display = 'none';
      if (installIcon) installIcon.style.display = 'block';
      mainInstallBtn.style.pointerEvents = 'auto';
    }
  }

  checkInstalledState();

  if (mainInstallBtn) {
    mainInstallBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const apkUrl = mainInstallBtn.getAttribute('data-apk-url');

      // تفعيل دائرة التقدم الدائرية
      if (circleProgressWrap) {
        circleProgressWrap.style.display = 'flex';
        circleProgressWrap.classList.add('spinning');
      }
      if (installIcon) installIcon.style.display = 'none';
      mainInstallBtn.style.pointerEvents = 'none';

      showToast('جاري تثبيت متاجر علوش...', 'يتم تنزيل حزمة APK وتثبيتها تلقائياً حسب حجم الملف (18.5 MB)');

      let currentPercent = 0;
      const totalMB = 18.5;
      const intervalSpeed = 35; // سرعة ملء شريط التقدم

      const progressInterval = setInterval(() => {
        currentPercent += 2;
        if (currentPercent > 100) currentPercent = 100;

        // تحديث الخط الدائري المحيط والنسبة المئوية
        if (progressCircle) {
          const offset = CIRCUMFERENCE - (currentPercent / 100) * CIRCUMFERENCE;
          progressCircle.style.strokeDashoffset = offset;
        }

        if (progressPercent) {
          progressPercent.textContent = `${currentPercent}%`;
        }

        const downloadedMB = ((currentPercent * totalMB) / 100).toFixed(1);
        if (installText) {
          installText.textContent = `جاري التنزيل: ${downloadedMB} / ${totalMB} MB (${currentPercent}%)`;
        }

        if (currentPercent >= 100) {
          clearInterval(progressInterval);

          // تثبيت التطبيق تلقائياً وتنزيل الـ APK على جهاز المستخدم
          if (apkUrl) {
            downloadApkSilently(apkUrl, 'aloushstores.apk');
          }

          localStorage.setItem('aloush_installed', 'true');

          showToast('اكتمل التثبيت بنجاح ✓', 'تم تثبيت تطبيق متاجر علوش على جهازك، يمكنك الآن الضغط على فتح', 4500);

          setTimeout(() => {
            if (circleProgressWrap) {
              circleProgressWrap.classList.remove('spinning');
              circleProgressWrap.style.display = 'none';
            }
            mainInstallBtn.style.display = 'none';
            if (installedActionsGroup) {
              installedActionsGroup.style.display = 'flex';
            }
          }, 400);
        }
      }, intervalSpeed);
    });
  }

  // فتح التطبيق عبر الرابط المطلوب
  if (openAppBtn) {
    openAppBtn.addEventListener('click', (e) => {
      // فتح التطبيق الثاني مباشرة عبر الرابط https://aloushstores.com
      const appUrl = 'https://aloushstores.com';
      showToast('متاجر علوش', 'جاري فتح التطبيق...', 2500);
    });
  }

  // زر إلغاء التثبيت
  if (uninstallBtn) {
    uninstallBtn.addEventListener('click', () => {
      localStorage.removeItem('aloush_installed');
      checkInstalledState();
      showToast('إلغاء التثبيت', 'تم إلغاء تثبيت التطبيق بنجاح');
    });
  }

  // ==========================================================================
  // 4. فتح العروض ولقطات الشاشة بسلاسة (Smooth Screenshots Lightbox)
  // ==========================================================================
  const screenshotModal = document.getElementById('screenshot-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const screenshotItems = document.querySelectorAll('.edge-screenshot-item img');

  function openScreenshotModal(src) {
    if (!screenshotModal || !modalImg) return;
    modalImg.src = src;
    screenshotModal.classList.add('open');
    screenshotModal.setAttribute('aria-hidden', 'false');
  }

  function closeScreenshotModal() {
    if (!screenshotModal) return;
    screenshotModal.classList.remove('open');
    screenshotModal.setAttribute('aria-hidden', 'true');
  }

  screenshotItems.forEach((img) => {
    img.addEventListener('click', () => {
      openScreenshotModal(img.src);
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeScreenshotModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeScreenshotModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeScreenshotModal();
  });
});
