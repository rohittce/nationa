/*
  Bipin Kumar Singh Portfolio - Javascript Logic
  Features: Mobile Menu, Scroll Spy, Lightbox Modals, 
  and Client Relations Portal Form Validation (Birthday Reminder).
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Sticky Header on Scroll ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = 'var(--shadow-md)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
  });

  // Close mobile nav when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.textContent = '☰';
    });
  });

  // --- Scroll Spy for Active Navigation ---
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    threshold: 0.25,
    rootMargin: '-80px 0px 0px 0px' // accounts for navigation bar height
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => spyObserver.observe(section));

  // --- Lightbox Modal for Gallery Images ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxDesc = lightbox.querySelector('.lightbox-desc');

  // Find all triggers
  const imageWrappers = document.querySelectorAll('.card-img-wrapper, .milestone-photo-wrapper');
  
  imageWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const img = wrapper.querySelector('img');
      let title = '';
      let desc = '';
      
      // Attempt to find parent context for text
      const parentCard = wrapper.closest('.card, .milestone-card');
      if (parentCard) {
        const titleEl = parentCard.querySelector('.card-title, .milestone-title');
        const descEl = parentCard.querySelector('.card-desc, .milestone-desc');
        if (titleEl) title = titleEl.textContent;
        if (descEl) desc = descEl.textContent;
      }

      lightboxImg.src = img.src;
      lightboxTitle.textContent = title;
      lightboxDesc.textContent = desc;
      lightbox.classList.add('active');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // --- Scroll Progress Bar Indicator ---
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      progressBar.style.width = scrolled + '%';
    }
  });

  // --- Native Scroll-Reveal Animation Observer ---
  const scrollCards = document.querySelectorAll('.milestone-card, .card, .orbit-card, .phone-mockup');
  
  // Set initial state for animations dynamically
  scrollCards.forEach(card => {
    card.classList.add('reveal-ready');
  });

  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a slight stagger delay dynamically for siblings entering together
        setTimeout(() => {
          entry.target.classList.add('reveal-visible');
          
          // Trigger organic float animation once orbit card slide-in settles
          if (entry.target.classList.contains('orbit-card')) {
            setTimeout(() => {
              entry.target.classList.add('reveal-floating');
            }, 1200);
          }
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  scrollCards.forEach(card => {
    cardObserver.observe(card);
  });

  // --- Pure Vanilla JS Magnetic Hover Interaction ---
  const magneticElements = document.querySelectorAll('.btn, .floating-btn, .logo-symbol');
  magneticElements.forEach(elem => {
    elem.style.transition = 'transform 0.1s ease';

    elem.addEventListener('mousemove', (e) => {
      const rect = elem.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      elem.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    elem.addEventListener('mouseleave', () => {
      elem.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      elem.style.transform = 'translate(0, 0)';
      
      setTimeout(() => {
        elem.style.transition = 'transform 0.1s ease';
      }, 500);
    });
  });


  // --- Toast Notification Helper ---
  const showToast = (message, type = 'success') => {
    // Create toast container if not already exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Select icon
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  };
});

// --- Dismiss Preloader on Page Load ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloaderText');
  
  if (preloader) {
    // Dynamic text cycle matching loading states
    const states = [
      { text: "Analyzing Risks...", time: 0 },
      { text: "Underwriting Safety...", time: 500 },
      { text: "Securing Assets...", time: 1000 },
      { text: "Active Coverage!", time: 1550 }
    ];

    states.forEach(state => {
      setTimeout(() => {
        if (preloaderText) preloaderText.textContent = state.text;
      }, state.time);
    });

    // Dismiss preloader after all cycles finish
    setTimeout(() => {
      preloader.classList.add('preloader-fade-out');
      document.body.classList.add('loaded');
      
      // Silent check for important client days
      setTimeout(checkDailyNotifications, 1000);
    }, 2100);
  } else {
    document.body.classList.add('loaded');
    setTimeout(checkDailyNotifications, 1000);
  }
});

// --- Daily Notification Checker Engine ---
function checkDailyNotifications() {
  const TELEGRAM_TOKEN = "8828147304:AAHbwFe51XsfH1cPIXCxHFFb284jY2FfSnA";
  const TELEGRAM_CHAT_ID = "8053940112";
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Prevent spam: check notifications only once per day
  if (localStorage.getItem('bipin_last_notification_date') === todayStr) return;
  
  const sessionPassword = sessionStorage.getItem('bipin_admin_password');
  if (!sessionPassword) return; // Cannot decrypt without active admin session
  
  const ciphertext = localStorage.getItem('bipin_clients_db_encrypted');
  if (!ciphertext) return;
  
  let clients = [];
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, sessionPassword);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    clients = decryptedData ? JSON.parse(decryptedData) : [];
  } catch(e) {
    console.error("Alert checker decryption failed:", e);
    return;
  }
  if (clients.length === 0) return;
  
  const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  let birthdaysToday = [];
  let anniversariesToday = [];
  let expiries30Days = [];
  let expiries15Days = [];
  let expiries7Days = [];
  
  clients.forEach(client => {
    // Birthdays
    if (client.birthday === currentMonthDay) {
      birthdaysToday.push(client);
    }
    // Anniversaries
    if (client.anniversary === currentMonthDay) {
      anniversariesToday.push(client);
    }
    // Expiries
    if (client.expiry) {
      const expDate = new Date(client.expiry);
      // Reset times to calculate pure days difference
      today.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate - today;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 30) {
        expiries30Days.push(client);
      } else if (diffDays === 15) {
        expiries15Days.push(client);
      } else if (diffDays === 7) {
        expiries7Days.push(client);
      }
    }
  });
  
  // Check if anything needs reporting
  if (birthdaysToday.length === 0 && anniversariesToday.length === 0 && expiries30Days.length === 0 && expiries15Days.length === 0 && expiries7Days.length === 0) {
    localStorage.setItem('bipin_last_notification_date', todayStr);
    return;
  }
  
  let msg = `🚨 *BIPIN JI'S PORTAL NOTIFICATION* 🚨\n\n`;
  
  if (birthdaysToday.length > 0) {
    msg += `🎂 *Birthdays Today:*\n`;
    birthdaysToday.forEach(c => {
      msg += `• ${c.name} (${c.mobile}) - Policy: ${c.policy}\n`;
    });
    msg += `\n`;
  }
  
  if (anniversariesToday.length > 0) {
    msg += `💖 *Anniversaries Today:*\n`;
    anniversariesToday.forEach(c => {
      msg += `• ${c.name} (${c.mobile}) - Policy: ${c.policy}\n`;
    });
    msg += `\n`;
  }
  
  if (expiries7Days.length > 0) {
    msg += `🔴 *Policies Expiring in 7 Days:*\n`;
    expiries7Days.forEach(c => {
      msg += `• ${c.name} (${c.mobile}) - ${c.policy} (Exp: ${c.expiry})\n`;
    });
    msg += `\n`;
  }
  
  if (expiries15Days.length > 0) {
    msg += `🟡 *Policies Expiring in 15 Days:*\n`;
    expiries15Days.forEach(c => {
      msg += `• ${c.name} (${c.mobile}) - ${c.policy} (Exp: ${c.expiry})\n`;
    });
    msg += `\n`;
  }
  
  if (expiries30Days.length > 0) {
    msg += `🔵 *Policies Expiring in 30 Days:*\n`;
    expiries30Days.forEach(c => {
      msg += `• ${c.name} (${c.mobile}) - ${c.policy} (Exp: ${c.expiry})\n`;
    });
    msg += `\n`;
  }
  
  // Dispatch via Telegram Bot
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: 'Markdown'
    })
  })
  .then(res => {
    if (res.ok) {
      localStorage.setItem('bipin_last_notification_date', todayStr);
    }
  })
  .catch(err => console.error("Telegram daily notification failed:", err));
}

// --- Admin Portal Dashboard Controllers ---
document.addEventListener('DOMContentLoaded', () => {
  const logoSymbol = document.querySelector('.logo-group .logo-symbol');
  const adminModal = document.getElementById('adminModal');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  
  // Double-click / Double-tap backdoor trigger on the header "B" symbol
  let clickCount = 0;
  if (logoSymbol) {
    logoSymbol.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      if (clickCount === 2) {
        adminModal.classList.add('active');
        clickCount = 0;
        checkAdminSession();
      }
      setTimeout(() => clickCount = 0, 800);
    });
  }
  
  if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }
  
  // Set default password hash if not set
  const DEFAULT_PASS = "insurance123";
  if (!localStorage.getItem('bipin_admin_password_hash')) {
    localStorage.setItem('bipin_admin_password_hash', CryptoJS.SHA256(DEFAULT_PASS).toString());
  }

  // Authentication Forms
  const loginForm = document.getElementById('adminLoginForm');
  const adminLoginView = document.getElementById('adminLoginView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  
  function checkAdminSession() {
    if (sessionStorage.getItem('bipin_admin_session') === 'true') {
      adminLoginView.style.display = 'none';
      adminDashboardView.style.display = 'block';
      loadClientsTable();
    } else {
      adminLoginView.style.display = 'block';
      adminDashboardView.style.display = 'none';
    }
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUsername').value.trim();
      const pass = document.getElementById('adminPassword').value.trim();
      
      const inputHash = CryptoJS.SHA256(pass).toString();
      const storedHash = localStorage.getItem('bipin_admin_password_hash');
      
      if (user === 'bipin' && inputHash === storedHash) {
        sessionStorage.setItem('bipin_admin_session', 'true');
        sessionStorage.setItem('bipin_admin_password', pass); // hold temporarily in memory to decrypt/encrypt
        loginError.textContent = '';
        loginForm.reset();
        checkAdminSession();
      } else {
        loginError.textContent = 'Invalid username or security password.';
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('bipin_admin_session');
      checkAdminSession();
    });
  }
  
  // Dashboard Tabs Switcher
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
  
  // Clients Management CRUD
  const addClientForm = document.getElementById('addClientForm');
  const clientTableBody = document.getElementById('clientTableBody');
  const noClientsMsg = document.getElementById('noClientsMsg');
  const clientSearch = document.getElementById('clientSearch');
  
  function getClients() {
    // Migration helper: if old plaintext database exists, encrypt it and clean up
    const oldPlaintext = localStorage.getItem('bipin_clients_db');
    const sessionPassword = sessionStorage.getItem('bipin_admin_password');
    if (!sessionPassword) return [];

    if (oldPlaintext) {
      const parsed = JSON.parse(oldPlaintext);
      saveClients(parsed);
      return parsed;
    }

    const ciphertext = localStorage.getItem('bipin_clients_db_encrypted');
    if (!ciphertext) return [];

    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, sessionPassword);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedData ? JSON.parse(decryptedData) : [];
    } catch(e) {
      console.error("Decryption failed:", e);
      return [];
    }
  }
  
  function saveClients(clients) {
    const sessionPassword = sessionStorage.getItem('bipin_admin_password');
    if (!sessionPassword) return;
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(clients), sessionPassword).toString();
    localStorage.setItem('bipin_clients_db_encrypted', ciphertext);
    localStorage.removeItem('bipin_clients_db'); // enforce encryption on disk
  }
  
  function loadClientsTable(query = '') {
    if (!clientTableBody) return;
    clientTableBody.innerHTML = '';
    
    const clients = getClients();
    const filtered = clients.filter(c => {
      const searchStr = `${c.name} ${c.mobile} ${c.policy}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
    
    if (filtered.length === 0) {
      noClientsMsg.style.display = 'block';
      return;
    }
    noClientsMsg.style.display = 'none';
    
    filtered.forEach((client, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(client.name)}</strong></td>
        <td>${escapeHTML(client.mobile)}</td>
        <td>${escapeHTML(client.birthday)}</td>
        <td>${client.anniversary ? escapeHTML(client.anniversary) : '-'}</td>
        <td><span class="card-tag" style="font-size:0.75rem; margin:0;">${escapeHTML(client.policy)}</span></td>
        <td>${escapeHTML(client.expiry)}</td>
        <td>
          <button class="btn-delete" data-index="${idx}">Delete</button>
        </td>
      `;
      clientTableBody.appendChild(row);
    });
    
    // Bind Delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const indexToDelete = parseInt(e.target.getAttribute('data-index'));
        if (confirm("Are you sure you want to delete this client record?")) {
          const current = getClients();
          current.splice(indexToDelete, 1);
          saveClients(current);
          loadClientsTable(clientSearch.value);
        }
      });
    });
  }
  
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
  
  if (clientSearch) {
    clientSearch.addEventListener('input', (e) => {
      loadClientsTable(e.target.value);
    });
  }
  
  if (addClientForm) {
    addClientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newClient = {
        name: document.getElementById('clientName').value.trim(),
        mobile: document.getElementById('clientMobile').value.trim(),
        birthday: document.getElementById('clientBirthday').value.trim(),
        anniversary: document.getElementById('clientAnniversary').value.trim(),
        policy: document.getElementById('clientPolicy').value,
        expiry: document.getElementById('clientExpiry').value
      };
      
      const current = getClients();
      current.push(newClient);
      saveClients(current);
      
      addClientForm.reset();
      loadClientsTable();
      
      // Auto switch back to table tab
      document.querySelector('[data-tab="tabClients"]').click();
      if (typeof showToast === 'function') showToast("Client record saved successfully!", "success");
    });
  }
  
  // Backup & Restore
  const backupDbBtn = document.getElementById('backupDbBtn');
  const restoreDbBtn = document.getElementById('restoreDbBtn');
  
  if (backupDbBtn) {
    backupDbBtn.addEventListener('click', () => {
      const TELEGRAM_TOKEN = "8828147304:AAHbwFe51XsfH1cPIXCxHFFb284jY2FfSnA";
      const TELEGRAM_CHAT_ID = "8053940112";
      
      const clients = getClients();
      if (clients.length === 0) {
        alert("Client database is empty. Add clients before running a backup.");
        return;
      }
      
      const backupStr = JSON.stringify(clients);
      const today = new Date().toLocaleDateString();
      const backupMsg = `💾 *DATABASE BACKUP (${today})* 💾\n\nCopy the text below to restore your database on another device:\n\n\`\`\`json\n${backupStr}\n\`\`\``;
      
      const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: backupMsg,
          parse_mode: 'Markdown'
        })
      })
      .then(res => {
        if (res.ok) {
          alert("Database backed up and posted successfully to Telegram!");
        } else {
          alert("Backup failed. Verify your bot connection credentials.");
        }
      })
      .catch(err => {
        console.error("Backup failed:", err);
        alert("Network error: Could not reach Telegram server.");
      });
    });
  }
  
  if (restoreDbBtn) {
    restoreDbBtn.addEventListener('click', () => {
      const rawText = document.getElementById('restoreDbInput').value.trim();
      if (!rawText) {
        alert("Please paste the JSON backup text block first.");
        return;
      }
      
      try {
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed)) {
          alert("Invalid backup format: Must be an array of customers.");
          return;
        }
        
        if (confirm(`Are you sure you want to restore ${parsed.length} client records? This will overwrite your current local database.`)) {
          saveClients(parsed);
          document.getElementById('restoreDbInput').value = '';
          loadClientsTable();
          // switch tab
          document.querySelector('[data-tab="tabClients"]').click();
          if (typeof showToast === 'function') showToast(`Successfully restored ${parsed.length} clients!`, "success");
        }
      } catch (err) {
        alert("Failed to parse backup text. Make sure it is valid JSON.");
        console.error(err);
      }
    });
  }

  // Change Password Form Listener
  const changePasswordForm = document.getElementById('changePasswordForm');
  const passwordChangeMessage = document.getElementById('passwordChangeMessage');
  
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confirmNew = document.getElementById('confirmNewPassword').value;
      
      const currentHash = CryptoJS.SHA256(current).toString();
      const storedHash = localStorage.getItem('bipin_admin_password_hash');
      
      if (currentHash !== storedHash) {
        passwordChangeMessage.style.color = '#ff5e62';
        passwordChangeMessage.textContent = 'Current password is incorrect.';
        return;
      }
      
      if (newPass !== confirmNew) {
        passwordChangeMessage.style.color = '#ff5e62';
        passwordChangeMessage.textContent = 'New passwords do not match.';
        return;
      }
      
      // Decrypt database using current session password
      const clients = getClients();
      
      // Update password in memory & hash in storage
      sessionStorage.setItem('bipin_admin_password', newPass);
      localStorage.setItem('bipin_admin_password_hash', CryptoJS.SHA256(newPass).toString());
      
      // Re-save database (will encrypt using the new session password)
      saveClients(clients);
      
      changePasswordForm.reset();
      passwordChangeMessage.style.color = '#00d4b2';
      passwordChangeMessage.textContent = 'Password changed and database re-encrypted successfully!';
      
      if (typeof showToast === 'function') showToast("Password updated successfully!", "success");
    });
  }
});
