/**
 * Recallr Prototype Navigation Hub
 * Floating quick switcher allowing instant navigation across all 14 screens
 */
(function() {
  const screens = [
    { group: 'Core Tabs', items: [
      { name: 'Home Screen', file: 'recallr_home_screen_sketch.html', icon: 'ti-home' },
      { name: 'People List', file: 'recallr_people_list_sketch.html', icon: 'ti-users' },
      { name: 'Quick Add & Scan', file: 'recallr_quick_add_and_scan_review.html', icon: 'ti-plus' },
      { name: 'Notes & Reminders', file: 'recallr_notes_reminders_sketch.html', icon: 'ti-note' },
      { name: 'Ask AI Chat', file: 'recallr_ask_ai_chat_sketch.html', icon: 'ti-sparkles' }
    ]},
    { group: 'Contact Flows', items: [
      { name: 'Contact Profile (Ramesh)', file: 'recallr_contact_profile_sketch.html', icon: 'ti-user' },
      { name: 'Edit, Share & Merge', file: 'recallr_edit_share_merge.html', icon: 'ti-edit' },
      { name: 'Categories Overview & Detail', file: 'recallr_categories_sketch.html', icon: 'ti-category' },
      { name: 'Import & Document Viewer', file: 'recallr_import_and_document_viewer.html', icon: 'ti-file-text' }
    ]},
    { group: 'Settings & Growth', items: [
      { name: 'Settings & Notifications', file: 'recallr_settings_sketch.html', icon: 'ti-settings' },
      { name: 'Digital Card & Public Page', file: 'recallr_edit_card_and_public_page.html', icon: 'ti-id' },
      { name: 'Subscription & Pro Upgrade', file: 'recallr_subscription_screens.html', icon: 'ti-crown' },
      { name: 'Search & States', file: 'recallr_search_and_states.html', icon: 'ti-search' }
    ]},
    { group: 'Onboarding', items: [
      { name: 'Welcome & Sign In Flow', file: 'recallr_onboarding_sketch.html', icon: 'ti-compass' }
    ]}
  ];

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #recallr-nav-trigger {
      position: fixed;
      bottom: 18px;
      right: 18px;
      z-index: 99999;
      background: #20201f;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 24px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 18px rgba(0,0,0,0.24);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255,255,255,0.12);
    }
    #recallr-nav-trigger:hover {
      background: #E8641B;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(232, 100, 27, 0.36);
    }
    #recallr-nav-trigger i {
      font-size: 15px;
    }
    #recallr-nav-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      z-index: 100000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #recallr-nav-modal-backdrop.open {
      display: flex;
      opacity: 1;
    }
    #recallr-nav-modal {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      border-radius: 20px;
      padding: 20px 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      border: 1px solid rgba(0,0,0,0.08);
      font-family: inherit;
      color: #2b2b2b;
    }
    .recallr-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .recallr-nav-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .recallr-nav-badge {
      font-size: 11px;
      background: #FDEBDD;
      color: #E8641B;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
    .recallr-nav-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #8a8a85;
      background: #f4f3f0;
      transition: background 0.15s ease;
    }
    .recallr-nav-close:hover {
      background: #ebe8e2;
      color: #2b2b2b;
    }
    .recallr-nav-group-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #8a8a85;
      margin: 14px 0 6px;
    }
    .recallr-nav-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4px;
    }
    .recallr-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: #2b2b2b;
      font-size: 13px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .recallr-nav-link:hover {
      background: #FDEBDD;
      color: #E8641B;
    }
    .recallr-nav-link.active {
      background: #E8641B;
      color: #ffffff;
      font-weight: 500;
    }
    .recallr-nav-link i {
      font-size: 17px;
    }
  `;
  document.head.appendChild(style);

  // Trigger button
  const trigger = document.createElement('div');
  trigger.id = 'recallr-nav-trigger';
  trigger.innerHTML = `<i class="ti ti-layout-grid"></i> Screens (14)`;
  document.body.appendChild(trigger);

  // Modal Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'recallr-nav-modal-backdrop';

  let htmlContent = `
    <div id="recallr-nav-modal">
      <div class="recallr-nav-header">
        <div class="recallr-nav-title">
          <span>Recallr App Flow</span>
          <span class="recallr-nav-badge">14 Screens</span>
        </div>
        <div class="recallr-nav-close" id="recallr-nav-close-btn"><i class="ti ti-x"></i></div>
      </div>
  `;

  screens.forEach(group => {
    htmlContent += `<div class="recallr-nav-group-title">${group.group}</div><div class="recallr-nav-grid">`;
    group.items.forEach(item => {
      const isActive = currentPath === item.file ? 'active' : '';
      htmlContent += `
        <a class="recallr-nav-link ${isActive}" href="${item.file}">
          <i class="ti ${item.icon}"></i>
          <span>${item.name}</span>
        </a>
      `;
    });
    htmlContent += `</div>`;
  });

  htmlContent += `</div>`;
  backdrop.innerHTML = htmlContent;
  document.body.appendChild(backdrop);

  // Event handlers
  function openModal() {
    backdrop.style.display = 'flex';
    setTimeout(() => backdrop.classList.add('open'), 10);
  }
  function closeModal() {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.style.display = 'none'; }, 200);
  }

  trigger.addEventListener('click', openModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.getElementById('recallr-nav-close-btn').addEventListener('click', closeModal);

  // Keyboard shortcut: Press Escape to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Enable smooth mouse drag-to-scroll for horizontal chip bars
  function initDragScroll() {
    const sliders = document.querySelectorAll('.chip-scroll, [style*="overflow-x"]');
    sliders.forEach(slider => {
      let isDown = false;
      let startX, scrollLeft;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('grabbing');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      const stopDrag = () => {
        isDown = false;
        slider.classList.remove('grabbing');
      };

      slider.addEventListener('mouseleave', stopDrag);
      slider.addEventListener('mouseup', stopDrag);

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDragScroll);
  } else {
    initDragScroll();
  }
})();
