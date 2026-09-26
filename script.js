// Screen and app interactions initialized
document.addEventListener('DOMContentLoaded', () => {
  // عناصر القائمة الجانبية في الصفحة الرئيسية
  const menuBtn = document.getElementById('menu-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerSearchInput = document.getElementById('drawer-search-input');

  // عناصر البحث السريع في الصفحة الرئيسية
  const searchBtn = document.getElementById('search-btn');
  const quickSearchBar = document.getElementById('quick-search-bar');
  const homeSearchInput = document.getElementById('home-search-input');
  const closeSearchBtn = document.getElementById('close-search-btn');

  // عناصر تثبيت التطبيقات
  const installButtons = document.querySelectorAll('.install-btn:not(.disabled-btn)');
  const toast = document.getElementById('install-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');

  let toastTimer = null;

  // ==========================================================================
  // 1. القائمة الجانبية (Side Drawer)
  // ==========================================================================
  function openDrawer() {
    if (!sideDrawer || !drawerOverlay) return;
    sideDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    sideDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    if (!sideDrawer || !drawerOverlay) return;
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    sideDrawer.setAttribute('aria-hidden', 'true');
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

    // التحقق من أن السحب أفقي وغير متداخل مع التمرير الرأسي
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.15 && timeElapsed < 650) {
      const isDrawerOpen = sideDrawer && sideDrawer.classList.contains('open');

      if (!isDrawerOpen) {
        // اسحب يسار تفتح (سحب من اليمين باتجاه اليسار diffX < -35)
        if (diffX < -35) {
          openDrawer();
        }
      } else {
        // اسحب يمين تغلق (سحب باتجاه اليمين لإعادة إدخال القائمة diffX > 35)
        if (diffX > 35) {
          closeDrawer();
        }
      }
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeSearch();
    }
  });

  if (drawerSearchInput) {
    drawerSearchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.drawer-link, .drawer-app-item');
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = !val || text.includes(val) ? '' : 'none';
      });
    });
  }

  // ==========================================================================
  // 2. البحث السريع في الصفحة الرئيسية (Quick Search)
  // ==========================================================================
  function openSearch() {
    if (!quickSearchBar) return;
    quickSearchBar.classList.add('active');
    if (homeSearchInput) {
      setTimeout(() => homeSearchInput.focus(), 150);
    }
  }

  function closeSearch() {
    if (!quickSearchBar) return;
    quickSearchBar.classList.remove('active');
    if (homeSearchInput) {
      homeSearchInput.value = '';
      filterHomeApps('');
    }
  }

  if (searchBtn) searchBtn.addEventListener('click', () => {
    if (quickSearchBar && quickSearchBar.classList.contains('active')) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  function filterHomeApps(query) {
    const q = query.trim().toLowerCase();
    const appCards = document.querySelectorAll('.apps-grid .app-card');

    appCards.forEach((card) => {
      const name = card.querySelector('.app-name')?.textContent?.toLowerCase() || '';
      if (!q || name.includes(q)) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.opacity = '0.25';
        card.style.transform = 'scale(0.92)';
      }
    });
  }

  if (homeSearchInput) {
    homeSearchInput.addEventListener('input', (e) => {
      filterHomeApps(e.target.value);
    });
  }

  // ==========================================================================
  // 3. التثبيت المباشر الداخلي لملف الـ APK
  // ==========================================================================
  function showToast(title, desc, duration = 3500) {
    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);

    if (toastTitle) toastTitle.textContent = title;
    if (toastDesc) toastDesc.textContent = desc;

    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function downloadApkSilently(apkUrl, filename = 'aloushstores.apk') {
    // تنزيل ملف الـ APK داخلياً بدون مغادرة الصفحة
    const a = document.createElement('a');
    a.href = apkUrl;
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

  // ==========================================================================
  // مزامنة حالة تثبيت التطبيقات (متاجر علوش، TOO ID، واتساب) مع الصفحة الرئيسية
  // ==========================================================================
  function updateAppsInstalledState() {
    // 1. متاجر علوش
    const isAloushInstalled = localStorage.getItem('aloush_installed') === 'true';
    const aloushBtns = document.querySelectorAll(
      '.install-btn[data-app-id="aloush_stores"], .install-btn[data-app-name="متاجر علوش"]'
    );
    aloushBtns.forEach((btn) => {
      if (isAloushInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح التطبيق');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت التطبيق');
      }
    });

    // 2. TOO ID
    const isTooIdInstalled = localStorage.getItem('tooid_installed') === 'true';
    const tooIdBtns = document.querySelectorAll(
      '.install-btn[data-app-id="too_id"], .install-btn[data-app-name="TOO ID"]'
    );
    tooIdBtns.forEach((btn) => {
      if (isTooIdInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح تطبيق TOO ID');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت تطبيق TOO ID');
      }
    });

    // 3. كروم Chrome
    const isChromeInstalled = localStorage.getItem('chrome_installed') === 'true';
    const chromeBtns = document.querySelectorAll(
      '.install-btn[data-app-id="chrome"], .install-btn[data-app-name="كروم Chrome"]'
    );
    chromeBtns.forEach((btn) => {
      if (isChromeInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح متصفح كروم Chrome');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت متصفح كروم Chrome');
      }
    });

    // 4. واتساب (WhatsApp)
    const isWhatsAppInstalled = localStorage.getItem('whatsapp_installed') === 'true';
    const whatsappBtns = document.querySelectorAll(
      '.install-btn[data-app-id="whatsapp"], .install-btn[data-app-name="واتساب"]'
    );
    whatsappBtns.forEach((btn) => {
      if (isWhatsAppInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح تطبيق واتساب');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت تطبيق واتساب');
      }
    });

    // 5. تيك توك (TikTok)
    const isTikTokInstalled = localStorage.getItem('tiktok_installed') === 'true';
    const tiktokBtns = document.querySelectorAll(
      '.install-btn[data-app-id="tiktok"], .install-btn[data-app-name="تيك توك"]'
    );
    tiktokBtns.forEach((btn) => {
      if (isTikTokInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح تطبيق تيك توك');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت تطبيق تيك توك');
      }
    });

    // 6. انستقرام (Instagram)
    const isInstagramInstalled = localStorage.getItem('instagram_installed') === 'true';
    const instagramBtns = document.querySelectorAll(
      '.install-btn[data-app-id="instagram"], .install-btn[data-app-name="انستقرام"]'
    );
    instagramBtns.forEach((btn) => {
      if (isInstagramInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح تطبيق انستقرام');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت تطبيق انستقرام');
      }
    });

    // 7. جيميل (Gmail)
    const isGmailInstalled = localStorage.getItem('gmail_installed') === 'true';
    const gmailBtns = document.querySelectorAll(
      '.install-btn[data-app-id="gmail"], .install-btn[data-app-name="جيميل"]'
    );
    gmailBtns.forEach((btn) => {
      if (isGmailInstalled) {
        btn.textContent = 'فتح';
        btn.classList.add('open-state', 'installed');
        btn.setAttribute('title', 'فتح تطبيق جيميل');
      } else {
        btn.textContent = 'تثبيت';
        btn.classList.remove('open-state', 'installed');
        btn.setAttribute('title', 'تثبيت تطبيق جيميل');
      }
    });
  }

  // فحص الحالة عند فتح الصفحة وعند العودة إليها عبر المتصفح
  updateAppsInstalledState();
  window.addEventListener('pageshow', updateAppsInstalledState);
  window.addEventListener('storage', (e) => {
    if (e.key === 'aloush_installed' || e.key === 'tooid_installed' || e.key === 'chrome_installed' || e.key === 'whatsapp_installed' || e.key === 'tiktok_installed' || e.key === 'instagram_installed' || e.key === 'gmail_installed') {
      updateAppsInstalledState();
    }
  });

  installButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const apkUrl = btn.getAttribute('data-apk-url');
      const appId = btn.getAttribute('data-app-id');
      const appName = btn.getAttribute('data-app-name') || btn.closest('.app-card')?.querySelector('.app-name')?.textContent || 'التطبيق';

      // إذا كان الزر في حالة "فتح" لتطبيق متاجر علوش
      if (btn.classList.contains('open-state') && (appId === 'aloush_stores' || appName === 'متاجر علوش')) {
        showToast('متاجر علوش', 'جاري فتح التطبيق...', 2000);
        window.open('https://aloushstores.com', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لتطبيق TOO ID
      if (btn.classList.contains('open-state') && (appId === 'too_id' || appName === 'TOO ID')) {
        showToast('TOO ID', 'جاري فتح تطبيق TOO ID...', 2000);
        window.open('https://too-id.lovable.app', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لمتصفح كروم Chrome
      if (btn.classList.contains('open-state') && (appId === 'chrome' || appName === 'كروم Chrome')) {
        showToast('كروم Chrome', 'جاري فتح متصفح جوجل كروم...', 2000);
        window.open('https://www.google.com', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لتطبيق واتساب
      if (btn.classList.contains('open-state') && (appId === 'whatsapp' || appName === 'واتساب')) {
        showToast('واتساب', 'جاري فتح تطبيق واتساب...', 2000);
        window.open('https://whatsapp.com', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لتطبيق تيك توك
      if (btn.classList.contains('open-state') && (appId === 'tiktok' || appName === 'تيك توك')) {
        showToast('تيك توك', 'جاري فتح تطبيق تيك توك...', 2000);
        window.open('https://www.tiktok.com', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لتطبيق انستقرام
      if (btn.classList.contains('open-state') && (appId === 'instagram' || appName === 'انستقرام')) {
        showToast('انستقرام', 'جاري فتح تطبيق انستقرام...', 2000);
        window.open('https://www.instagram.com', '_blank');
        return;
      }

      // إذا كان الزر في حالة "فتح" لتطبيق جيميل
      if (btn.classList.contains('open-state') && (appId === 'gmail' || appName === 'جيميل')) {
        showToast('جيميل', 'جاري فتح تطبيق جيميل...', 2000);
        window.open('https://mail.google.com', '_blank');
        return;
      }

      if (btn.classList.contains('installed')) {
        showToast(appName, 'تم تثبيت التطبيق مسبقاً ✓');
        if (apkUrl) {
          const fn = appId === 'chrome' ? 'Google-browser.apk' : (appId === 'gmail' ? 'gmail.apk' : (appId === 'instagram' ? 'Instagram.apk' : (appId === 'tiktok' ? 'Tlitok.apk' : (appId === 'whatsapp' ? 'WhatsApp.apk' : (appId === 'too_id' ? 'too.id.apk' : 'aloushstores.apk')))));
          downloadApkSilently(apkUrl, fn);
        }
        return;
      }

      btn.textContent = 'جاري...';
      btn.style.pointerEvents = 'none';

      let filename = 'aloushstores.apk';
      if (appId === 'chrome' || appName === 'كروم Chrome') {
        filename = 'Google-browser.apk';
      } else if (appId === 'gmail' || appName === 'جيميل') {
        filename = 'gmail.apk';
      } else if (appId === 'instagram' || appName === 'انستقرام') {
        filename = 'Instagram.apk';
      } else if (appId === 'tiktok' || appName === 'تيك توك') {
        filename = 'Tlitok.apk';
      } else if (appId === 'whatsapp' || appName === 'واتساب') {
        filename = 'WhatsApp.apk';
      } else if (appId === 'too_id' || appName === 'TOO ID') {
        filename = 'too.id.apk';
      }

      if (apkUrl) {
        showToast(`جاري تثبيت ${appName}...`, 'يتم تنزيل وتثبيت ملف APK تلقائياً من داخل التطبيق');
        downloadApkSilently(apkUrl, filename);
      }

      setTimeout(() => {
        btn.style.pointerEvents = 'auto';

        if (appId === 'aloush_stores' || appName === 'متاجر علوش') {
          localStorage.setItem('aloush_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح التطبيق مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'too_id' || appName === 'TOO ID') {
          localStorage.setItem('tooid_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح تطبيق TOO ID مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'chrome' || appName === 'كروم Chrome') {
          localStorage.setItem('chrome_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح متصفح كروم Chrome مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'whatsapp' || appName === 'واتساب') {
          localStorage.setItem('whatsapp_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح تطبيق واتساب مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'tiktok' || appName === 'تيك توك') {
          localStorage.setItem('tiktok_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح تطبيق تيك توك مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'instagram' || appName === 'انستقرام') {
          localStorage.setItem('instagram_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح تطبيق انستقرام مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else if (appId === 'gmail' || appName === 'جيميل') {
          localStorage.setItem('gmail_installed', 'true');
          updateAppsInstalledState();
          showToast(`تم تثبيت ${appName} بنجاح ✓`, 'أصبح تطبيق جيميل مثبتاً الآن على جهازك، اضغط فتح لتشغيله', 4000);
        } else {
          btn.textContent = 'تم التثبيت ✓';
          btn.classList.add('installed');
          if (apkUrl) {
            showToast(`تم تثبيت ${appName} بنجاح ✓`, 'تم تنزيل ملف التثبيت بنجاح على جهازك', 4000);
          }
        }
      }, 1500);
    });
  });

  // ==========================================================================
  // 4. الصفحة الجديدة المنبثقة بالسحب للأسفل من الخط داخل الضبابية
  // ==========================================================================
  const indicatorBar = document.getElementById('indicator-bar');
  const newExpandedPage = document.getElementById('new-expanded-page');
  const closeExpandedBar = document.getElementById('close-expanded-bar');
  const expandedMenuBtn = document.getElementById('expanded-menu-btn');
  const expandedSearchBtn = document.getElementById('expanded-search-btn');
  const expandedQuickSearchBar = document.getElementById('expanded-quick-search-bar');
  const expandedSearchInput = document.getElementById('expanded-search-input');
  const expandedCloseSearchBtn = document.getElementById('expanded-close-search-btn');
  const topSection = document.querySelector('.top-section');
  const expandedBottomSheet = document.getElementById('expanded-bottom-sheet');

  function openExpandedPage() {
    if (!newExpandedPage) return;
    newExpandedPage.classList.add('open');
    newExpandedPage.setAttribute('aria-hidden', 'false');
  }

  function closeExpandedPage() {
    if (!newExpandedPage) return;
    newExpandedPage.classList.remove('open');
    newExpandedPage.setAttribute('aria-hidden', 'true');
    closeExpandedSearch();
  }

  if (indicatorBar) {
    indicatorBar.addEventListener('click', openExpandedPage);
  }

  if (closeExpandedBar) {
    closeExpandedBar.addEventListener('click', closeExpandedPage);
  }

  if (expandedMenuBtn) {
    expandedMenuBtn.addEventListener('click', () => {
      openDrawer();
    });
  }

  function openExpandedSearch() {
    if (!expandedQuickSearchBar) return;
    expandedQuickSearchBar.classList.add('active');
    if (expandedSearchInput) {
      setTimeout(() => expandedSearchInput.focus(), 150);
    }
  }

  function closeExpandedSearch() {
    if (!expandedQuickSearchBar) return;
    expandedQuickSearchBar.classList.remove('active');
    if (expandedSearchInput) {
      expandedSearchInput.value = '';
      filterExpandedApps('');
    }
  }

  if (expandedSearchBtn) {
    expandedSearchBtn.addEventListener('click', () => {
      if (expandedQuickSearchBar && expandedQuickSearchBar.classList.contains('active')) {
        closeExpandedSearch();
      } else {
        openExpandedSearch();
      }
    });
  }

  if (expandedCloseSearchBtn) {
    expandedCloseSearchBtn.addEventListener('click', closeExpandedSearch);
  }

  function filterExpandedApps(query) {
    const q = query.trim().toLowerCase();
    const appCards = document.querySelectorAll('.expanded-grid .app-card');

    appCards.forEach((card) => {
      const name = card.querySelector('.app-name')?.textContent?.toLowerCase() || '';
      if (!q || name.includes(q)) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.opacity = '0.25';
        card.style.transform = 'scale(0.92)';
      }
    });
  }

  if (expandedSearchInput) {
    expandedSearchInput.addEventListener('input', (e) => {
      filterExpandedApps(e.target.value);
    });
  }

  // دعم السحب للأسفل على الخط داخل الضبابية لفتح الصفحة الجديدة
  let pullStartY = 0;
  let pullStartX = 0;
  let isPullingFromHero = false;

  if (topSection) {
    topSection.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = topSection.getBoundingClientRect();
      // تحقق إذا كانت اللمسة على أو بالقرب من منطقة الخط الضبابي
      if (touch.clientY >= rect.bottom - 140) {
        pullStartY = touch.clientY;
        pullStartX = touch.clientX;
        isPullingFromHero = true;
      } else {
        isPullingFromHero = false;
      }
    }, { passive: true });

    topSection.addEventListener('touchend', (e) => {
      if (!isPullingFromHero || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const diffY = touch.clientY - pullStartY;
      const diffX = touch.clientX - pullStartX;

      // سحب للأسفل بسلاسة
      if (diffY > 35 && Math.abs(diffY) > Math.abs(diffX)) {
        openExpandedPage();
      }
      isPullingFromHero = false;
    }, { passive: true });
  }

  // دعم السحب للأعلى من الخط السفلي لإغلاق الصفحة والرجوع للصفحة الرئيسية بسلاسة
  let sheetStartY = 0;
  let sheetStartX = 0;
  let isPullingFromBottomBar = false;

  if (newExpandedPage) {
    newExpandedPage.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = newExpandedPage.getBoundingClientRect();
      // تحقق إذا كانت اللمسة بالقرب من الخط السفلي (آخر 120px من الشاشة)
      if (touch.clientY >= rect.bottom - 120) {
        sheetStartY = touch.clientY;
        sheetStartX = touch.clientX;
        isPullingFromBottomBar = true;
      } else {
        isPullingFromBottomBar = false;
      }
    }, { passive: true });

    newExpandedPage.addEventListener('touchend', (e) => {
      if (!isPullingFromBottomBar || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const diffY = touch.clientY - sheetStartY;
      const diffX = touch.clientX - sheetStartX;

      // سحب للأعلى بسلاسة لإرجاع الصفحة الرئيسية
      if (diffY < -30 && Math.abs(diffY) > Math.abs(diffX) * 0.8) {
        closeExpandedPage();
      }
      isPullingFromBottomBar = false;
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeExpandedPage();
    }
  });
});


