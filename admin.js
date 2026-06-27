// --- Bipin Kumar Singh Administrative Controller Logic ---

const TELEGRAM_TOKEN = "8828147304:AAHbwFe51XsfH1cPIXCxHFFb284jY2FfSnA";
const TELEGRAM_CHAT_ID = "8053940112";
const DEFAULT_PASS = "insurance123";

document.addEventListener('DOMContentLoaded', () => {
  // Ensure default password hash is initialized
  if (!localStorage.getItem('bipin_admin_password_hash')) {
    localStorage.setItem('bipin_admin_password_hash', CryptoJS.SHA256(DEFAULT_PASS).toString());
  }

  // Views & Authentication DOM Elements
  const loginForm = document.getElementById('adminLoginForm');
  const adminLoginView = document.getElementById('adminLoginView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Verify Admin Session on Page Load
  checkAdminSession();

  function checkAdminSession() {
    if (sessionStorage.getItem('bipin_admin_session') === 'true') {
      adminLoginView.style.display = 'none';
      adminDashboardView.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'block';
      
      // Initialize Dashboard Components
      loadClientsTable();
      compileDailyUpdates();
      // Silently fire Telegram alerts if needed today
      setTimeout(checkDailyTelegramAlerts, 1000);
    } else {
      adminLoginView.style.display = 'block';
      adminDashboardView.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
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
        sessionStorage.setItem('bipin_admin_password', pass); // Kept in memory to decrypt database during session
        loginError.textContent = '';
        loginForm.reset();
        checkAdminSession();
        showToast("Authenticated successfully!", "success");
      } else {
        loginError.textContent = 'Invalid username or security password.';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('bipin_admin_session');
      sessionStorage.removeItem('bipin_admin_password');
      checkAdminSession();
      showToast("Signed out successfully.", "info");
    });
  }

  // --- Dashboard Tabs System ---
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetEl = document.getElementById(targetTab);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // --- Secure Client Database Handlers (AES-256) ---
  function getClients() {
    // Migration helper: If old unencrypted plaintext db is found, encrypt it
    const oldPlaintext = localStorage.getItem('bipin_clients_db');
    const sessionPassword = sessionStorage.getItem('bipin_admin_password');
    if (!sessionPassword) return [];

    if (oldPlaintext) {
      try {
        const parsed = JSON.parse(oldPlaintext);
        saveClients(parsed);
        return parsed;
      } catch(e) {
        console.error("Migration parse failed:", e);
      }
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
    try {
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(clients), sessionPassword).toString();
      localStorage.setItem('bipin_clients_db_encrypted', ciphertext);
      localStorage.removeItem('bipin_clients_db'); // Clean up plaintext storage
    } catch(e) {
      console.error("Encryption failed:", e);
    }
  }

  // --- Clients Grid CRUD ---
  const addClientForm = document.getElementById('addClientForm');
  const clientTableBody = document.getElementById('clientTableBody');
  const noClientsMsg = document.getElementById('noClientsMsg');
  const clientSearch = document.getElementById('clientSearch');

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

    // Delete Buttons Bind
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const indexToDelete = parseInt(e.target.getAttribute('data-index'));
        if (confirm("Are you sure you want to delete this customer record?")) {
          const current = getClients();
          current.splice(indexToDelete, 1);
          saveClients(current);
          loadClientsTable(clientSearch.value);
          compileDailyUpdates(); // Update tray alerts
          showToast("Client deleted successfully.", "info");
        }
      });
    });
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
      compileDailyUpdates(); // Update tray alerts
      
      // Auto return to Active Clients view
      document.querySelector('[data-tab="tabClients"]').click();
      showToast("New customer saved successfully!", "success");
    });
  }

  // --- "Updates of the Day" Notification Tray Compiler ---
  const trayContent = document.getElementById('trayContent');
  const trayAlertCount = document.getElementById('trayAlertCount');

  function compileDailyUpdates() {
    if (!trayContent) return;
    trayContent.innerHTML = '';
    
    const clients = getClients();
    if (clients.length === 0) {
      trayContent.innerHTML = `<div class="tray-empty-state">No client records in database.</div>`;
      trayAlertCount.textContent = "0 Updates";
      trayAlertCount.classList.remove('alert-active');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let updates = [];

    clients.forEach(client => {
      // Birthdays today
      if (client.birthday === currentMonthDay) {
        updates.push({
          type: 'birthday',
          name: client.name,
          mobile: client.mobile,
          text: `Birthday Today! 🎂 Send wishes to: ${client.mobile}`,
          badge: 'Birthday'
        });
      }
      
      // Anniversaries today
      if (client.anniversary === currentMonthDay) {
        updates.push({
          type: 'anniversary',
          name: client.name,
          mobile: client.mobile,
          text: `Marriage Anniversary today! 💖 Send wishes to: ${client.mobile}`,
          badge: 'Anniversary'
        });
      }

      // Expiry policy milestones
      if (client.expiry) {
        const expDate = new Date(client.expiry);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          updates.push({
            type: 'expiry-critical',
            name: client.name,
            mobile: client.mobile,
            text: `Policy cover (${escapeHTML(client.policy)}) expires TODAY! ⚠️ Action required: ${client.mobile}`,
            badge: 'Expiring Today'
          });
        } else if (diffDays < 0) {
          updates.push({
            type: 'expiry-critical',
            name: client.name,
            mobile: client.mobile,
            text: `Policy cover (${escapeHTML(client.policy)}) EXPIRED on ${client.expiry}! ❌ Action required: ${client.mobile}`,
            badge: 'Expired'
          });
        } else if (diffDays === 7 || diffDays === 15 || diffDays === 30) {
          updates.push({
            type: `expiry-${diffDays}`,
            name: client.name,
            mobile: client.mobile,
            text: `Policy cover (${escapeHTML(client.policy)}) expires in exactly ${diffDays} days! (Expiry: ${client.expiry})`,
            badge: `${diffDays} Days Expiry`
          });
        }
      }
    });

    if (updates.length === 0) {
      trayContent.innerHTML = `<div class="tray-empty-state">All clients secure. No policy updates or anniversaries today! ✨</div>`;
      trayAlertCount.textContent = "All Secure";
      trayAlertCount.classList.remove('alert-active');
      return;
    }

    trayAlertCount.textContent = `${updates.length} Action Needed`;
    trayAlertCount.classList.add('alert-active');

    updates.forEach(up => {
      const item = document.createElement('div');
      item.className = `notif-item notif-${up.type}`;
      
      let icon = '🔔';
      if (up.type === 'birthday') icon = '🎂';
      if (up.type === 'anniversary') icon = '💖';
      if (up.type === 'expiry-7' || up.type === 'expiry-critical') icon = '🔴';
      if (up.type === 'expiry-15') icon = '🟡';
      if (up.type === 'expiry-30') icon = '🔵';

      item.innerHTML = `
        <div class="notif-item-left">
          <span class="notif-icon">${icon}</span>
          <div class="notif-details">
            <span class="notif-name">${escapeHTML(up.name)}</span>
            <span class="notif-meta">${escapeHTML(up.text)}</span>
          </div>
        </div>
        <span class="notif-badge">${up.badge}</span>
      `;
      trayContent.appendChild(item);
    });
  }

  // --- Daily Telegram Bot Automated Alerts ---
  function checkDailyTelegramAlerts() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if an alert was already dispatched today
    if (localStorage.getItem('bipin_last_notification_date') === todayStr) return;
    
    const clients = getClients();
    if (clients.length === 0) return;
    
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let birthdaysToday = [];
    let anniversariesToday = [];
    let expiriesToday = [];
    let expiries30Days = [];
    let expiries15Days = [];
    let expiries7Days = [];
    
    clients.forEach(client => {
      if (client.birthday === currentMonthDay) birthdaysToday.push(client);
      if (client.anniversary === currentMonthDay) anniversariesToday.push(client);
      if (client.expiry) {
        const expDate = new Date(client.expiry);
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) expiriesToday.push(client);
        else if (diffDays === 30) expiries30Days.push(client);
        else if (diffDays === 15) expiries15Days.push(client);
        else if (diffDays === 7) expiries7Days.push(client);
      }
    });
    
    if (birthdaysToday.length === 0 && anniversariesToday.length === 0 && expiriesToday.length === 0 && expiries30Days.length === 0 && expiries15Days.length === 0 && expiries7Days.length === 0) {
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
    
    if (expiriesToday.length > 0) {
      msg += `🚨 *Policies Expiring TODAY (Critical):*\n`;
      expiriesToday.forEach(c => {
        msg += `• ${c.name} (${c.mobile}) - ${c.policy} (Critical Expiry)\n`;
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
    .catch(err => console.error("Daily Telegram notification failed:", err));
  }

  // --- Database Backup & Restore Toolsets ---
  const backupDbBtn = document.getElementById('backupDbBtn');
  const restoreDbBtn = document.getElementById('restoreDbBtn');

  if (backupDbBtn) {
    backupDbBtn.addEventListener('click', () => {
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
          alert("Database backed up and posted successfully to your Telegram chat!");
          showToast("Sync backup posted to Telegram.", "success");
        } else {
          alert("Backup failed. Verify bot configuration.");
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
        
        if (confirm(`Are you sure you want to restore ${parsed.length} client records? This will overwrite your current database.`)) {
          saveClients(parsed);
          document.getElementById('restoreDbInput').value = '';
          loadClientsTable();
          compileDailyUpdates();
          
          // Switch view
          document.querySelector('[data-tab="tabClients"]').click();
          showToast(`Restored ${parsed.length} client records!`, "success");
        }
      } catch (err) {
        alert("Failed to parse backup text. Make sure it is valid JSON.");
        console.error(err);
      }
    });
  }

  // --- Password Changing Panel ---
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
      
      const clients = getClients(); // Decrypt with current pass
      
      // Update session password and hash
      sessionStorage.setItem('bipin_admin_password', newPass);
      localStorage.setItem('bipin_admin_password_hash', CryptoJS.SHA256(newPass).toString());
      
      // Re-save clients (encrypts with new pass)
      saveClients(clients);
      
      changePasswordForm.reset();
      passwordChangeMessage.style.color = '#00d4b2';
      passwordChangeMessage.textContent = 'Password changed and database re-encrypted successfully!';
      showToast("Password updated successfully!", "success");
    });
  }

  // --- Utility Helpers ---
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function showToast(msg, type = "success") {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = type === 'success' ? 'var(--accent)' : 'var(--text-secondary)';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
