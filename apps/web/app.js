// Global state
let currentUser = null;
let userWallet = null;
let userContacts = {};

// Ensure userContacts is always an array
function ensureContactsArray() {
    if (!Array.isArray(userContacts)) {
        userContacts = [];
    }
}

// API Configuration
const API_BASE_URL = 'https://hai-wallet-server.onrender.com/api';

// Network configurations
const NETWORKS = {
    ethereum: {
        name: 'Ethereum Sepolia',
        chainId: 11155111,
        rpcUrl: 'https://rpc.sepolia.org',
        balanceId: 'ethBalance',
        addressId: 'ethAddress',
        className: 'ethereum'
    },
    base: {
        name: 'Base Sepolia',
        chainId: 84532,
        rpcUrl: 'https://sepolia.base.org',
        balanceId: 'baseBalance',
        addressId: 'baseAddress',
        className: 'base'
    },
    optimism: {
        name: 'Optimism Sepolia',
        chainId: 11155420,
        rpcUrl: 'https://sepolia.optimism.io',
        balanceId: 'optimismBalance',
        addressId: 'optimismAddress',
        className: 'optimism'
    }
};

// Debug network configurations
console.log('🔧 Network configurations:', NETWORKS);

// Utility Functions
function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

function clearStatus() {
    const statusElement = document.getElementById('statusMessage');
    statusElement.style.display = 'none';
}

function validateWalletAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Always fetch the current wallet address from backend to ensure consistency
async function getCurrentWalletAddress(uid) {
    if (!uid) {
        console.log('⚠️ No UID provided for wallet address fetch');
        return null;
    }
    
    try {
        console.log(`🔍 Fetching current wallet address for UID: ${uid}`);
        const response = await fetch(`${API_BASE_URL}/auth/wallet-address/${uid}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Retrieved wallet address from backend: ${data.walletAddress}`);
            return data.walletAddress;
        } else {
            console.error('❌ Failed to fetch wallet address from backend');
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching wallet address:', error);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearLocalStorage() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userWallet');
    localStorage.removeItem('userContacts');
}

// Enhanced balance formatting
function formatBalance(balanceInEth) {
    try {
        // The API already returns balance in ETH, so we don't need to convert from wei
        const balanceInEthNum = parseFloat(balanceInEth);
        
        // Handle zero balance
        if (balanceInEthNum === 0) {
            return '0.00 ETH';
        }
        
        // Handle very small amounts - show as 0.00 ETH instead of scientific notation
        if (balanceInEthNum < 0.000001) {
            return '0.00 ETH';
        }
        
        // Handle small amounts (less than 0.01 ETH)
        if (balanceInEthNum < 0.01) {
            return `${balanceInEthNum.toFixed(6)} ETH`;
        }
        
        // Handle medium amounts (less than 1 ETH)
        if (balanceInEthNum < 1) {
            return `${balanceInEthNum.toFixed(4)} ETH`;
        }
        
        // Handle large amounts (less than 1000 ETH)
        if (balanceInEthNum < 1000) {
            return `${balanceInEthNum.toFixed(2)} ETH`;
        }
        
        // Handle very large amounts
        if (balanceInEthNum < 1000000) {
            return `${(balanceInEthNum / 1000).toFixed(2)}K ETH`;
        }
        
        // Handle extremely large amounts
        return `${(balanceInEthNum / 1000000).toFixed(2)}M ETH`;
        
    } catch (error) {
        console.error('Error formatting balance:', error);
        return '0.00 ETH';
    }
}

// Real-time clock
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

function initClock() {
    // Update immediately
    updateClock();
    
    // Update every minute
    setInterval(updateClock, 60000);
}

// UI Management
function showMainApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('mainApp').classList.add('fade-in');
}

function showLoginSection() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('loginSection').classList.add('fade-in');
}

// Loading States
function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Tab Navigation
function initTabNavigation() {
    // Top navigation tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const bottomNavItems = document.querySelectorAll('.nav-item[data-tab]');

    function switchTab(tabName) {
        // Update top tabs
        navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });

        // Update bottom navigation
        bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });
    }

    // Add click handlers for top tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Add click handlers for bottom navigation
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });
}

// Contact Management
async function createUserContact(uid, walletAddress) {
    try {
        console.log('🔍 Creating "User" contact for wallet address:', walletAddress);
        console.log('🔍 UID for contact creation:', uid);
        console.log('🔍 API URL:', `${API_BASE_URL}/contacts`);
        
        const requestBody = {
            name: 'User',
            address: walletAddress,
            uid: uid
        };
        console.log('🔍 Request body:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);
        
        if (response.ok) {
            const responseData = await response.json();
            console.log('✅ "User" contact created successfully:', responseData);
            // Add to local state
            if (!userContacts) userContacts = {};
            userContacts['User'] = walletAddress;
            console.log('✅ Updated local userContacts:', userContacts);
        } else {
            const errorData = await response.json();
            console.error('❌ Failed to create "User" contact:', errorData);
            console.error('❌ Response status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error creating "User" contact:', error);
    }
}

async function loadContacts() {
    if (!currentUser) return;
    
    try {
        console.log('🔍 Loading contacts for user:', currentUser.uid);
        const response = await fetch(`${API_BASE_URL}/contacts/${currentUser.uid}`);
        
        if (response.ok) {
            const data = await response.json();
            userContacts = data.contacts || {};
            console.log('✅ Contacts loaded:', userContacts);
            updateContactsList();
        } else {
            console.error('❌ Failed to load contacts:', response.status);
            userContacts = {};
        }
    } catch (error) {
        console.error('❌ Error loading contacts:', error);
        userContacts = {};
    }
}

function updateContactsList() {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    console.log('🔍 Updating contacts list with:', userContacts);
    
    if (!userContacts || Object.keys(userContacts).length === 0) {
        contactsList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No contacts yet. Add your first contact above.</p>';
        return;
    }
    
    const contactsHtml = Object.entries(userContacts).map(([name, address]) => `
        <div class="contact-item">
            <div class="contact-info">
                <div class="contact-name">${name}</div>
                <div class="contact-address">${address}</div>
            </div>
            <div class="contact-actions">
                <button class="btn-delete" onclick="deleteContact('${name}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    contactsList.innerHTML = contactsHtml;
}

async function addContact(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showStatus('❌ Please login first', 'error');
        return;
    }
    
    const name = document.getElementById('contactName').value.trim();
    const address = document.getElementById('contactAddress').value.trim();
    
    if (!name || !address) {
        showStatus('❌ Please fill in all fields', 'error');
        return;
    }
    
    if (!validateWalletAddress(address)) {
        showStatus('❌ Invalid wallet address format', 'error');
        return;
    }
    
    // Ensure userContacts is an object (not array)
    if (!userContacts || typeof userContacts !== 'object') {
        userContacts = {};
    }
    
    // Check if name already exists
    if (userContacts[name]) {
        showStatus('❌ Contact name already exists', 'error');
        return;
    }
    
    setLoading('addContactBtn', true);
    
    try {
        console.log('🔍 Adding contact:', { name, address, uid: currentUser.uid });
        
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                address,
                uid: currentUser.uid
            })
        });
        
        console.log('🔍 Add contact response status:', response.status);
        
        if (response.ok) {
            // Add to local state
            userContacts[name] = address;
            updateContactsList();
            
            // Clear form
            document.getElementById('contactForm').reset();
            showStatus('✅ Contact added successfully', 'success');
            
            console.log('✅ Contact added successfully. Current contacts:', userContacts);
        } else {
            const errorData = await response.json();
            console.error('❌ Add contact error response:', errorData);
            throw new Error(errorData.error || 'Failed to add contact');
        }
    } catch (error) {
        console.error('❌ Add contact error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        setLoading('addContactBtn', false);
    }
}

async function deleteContact(name) {
    if (!currentUser) return;
    
    try {
        console.log('🔍 Deleting contact:', name, 'for user:', currentUser.uid);
        
        const response = await fetch(`${API_BASE_URL}/contacts/${currentUser.uid}/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from local state
            delete userContacts[name];
            updateContactsList();
            showStatus('✅ Contact deleted successfully', 'success');
            console.log('✅ Contact deleted successfully. Current contacts:', userContacts);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete contact');
        }
    } catch (error) {
        console.error('❌ Delete contact error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    }
}

// Transaction Execution
async function executeTransaction(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showStatus('❌ Please login first', 'error');
        return;
    }
    
    const prompt = document.getElementById('transactionPrompt').value.trim();
    
    if (!prompt) {
        showStatus('❌ Please enter a transaction description', 'error');
        return;
    }
    
    setLoading('executeTransactionBtn', true);
    
    try {
        console.log('🚀 Executing transaction with prompt:', prompt);
        console.log('🔍 Current user:', currentUser);
        console.log('🔍 User wallet address:', userWallet?.address);
        console.log('🔍 UID being sent to backend:', currentUser.uid);
        
        const response = await fetch(`${API_BASE_URL}/relay/quote-and-execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                uid: currentUser.uid
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Transaction executed successfully:', result);
            
            // Clear the form
            document.getElementById('transactionForm').reset();
            
            showStatus(`✅ Transaction executed successfully! Hash: ${result.transactionHash || 'Pending'}`, 'success');
            
            // Refresh balances after transaction with multiple attempts
            console.log('🔄 Refreshing balances after transaction...');
            await refreshBalancesAfterTransaction();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transaction failed');
        }
    } catch (error) {
        console.error('❌ Transaction execution error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        setLoading('executeTransactionBtn', false);
    }
}

// Enhanced balance refresh after transaction
async function refreshBalancesAfterTransaction() {
    console.log('🔄 Starting enhanced balance refresh...');
    
    // First immediate refresh
    await loadAllBalances();
    
    // Wait 3 seconds and refresh again (for pending transactions)
    setTimeout(async () => {
        console.log('🔄 Second balance refresh (3s delay)...');
        await loadAllBalances();
    }, 3000);
    
    // Wait 10 seconds and refresh again (for confirmed transactions)
    setTimeout(async () => {
        console.log('🔄 Third balance refresh (10s delay)...');
        await loadAllBalances();
    }, 10000);
    
    // Wait 30 seconds and final refresh
    setTimeout(async () => {
        console.log('🔄 Final balance refresh (30s delay)...');
        await loadAllBalances();
    }, 30000);
}

// Authentication
async function handleEmailLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    
    if (!email) {
        showStatus('❌ Please enter your email address', 'error');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showStatus('❌ Please enter a valid email address', 'error');
        return;
    }
    
    setLoading('loginBtn', true);
    
    try {
        console.log('🔐 Logging in with email:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful:', data);
            console.log('🔍 Wallet address from backend:', data.walletAddress);
            
            currentUser = {
                uid: data.uid,
                email: data.email
            };
            
            // Use ONLY the wallet address from backend - no frontend generation
            userWallet = {
                address: data.walletAddress
            };
            
            console.log('🔍 Using wallet address from backend:', userWallet.address);
            
            // Save to localStorage
            saveToLocalStorage('currentUser', currentUser);
            saveToLocalStorage('userWallet', userWallet);
            
            // Show main app
            showMainApp();
            
            // Create "User" contact automatically with backend wallet address
            await createUserContact(data.uid, data.walletAddress);
            
            // Load initial data
            await Promise.all([
                loadContacts(),
                loadAllBalances()
            ]);
            
            showStatus('✅ Wallet created and logged in successfully!', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        setLoading('loginBtn', false);
    }
}

function logout() {
    currentUser = null;
    userWallet = null;
    userContacts = {};
    
    clearLocalStorage();
    showLoginSection();
    
    // Clear all wallet displays
    Object.values(NETWORKS).forEach(network => {
        const balanceElement = document.getElementById(network.balanceId);
        if (balanceElement) balanceElement.textContent = '0.00 ETH';
    });
    
    // Clear wallet address display
    updateWalletAddressDisplay();
    
    showStatus('✅ Logged out successfully', 'success');
}

function checkExistingSession() {
    const savedUser = loadFromLocalStorage('currentUser');
    const savedWallet = loadFromLocalStorage('userWallet');
    
    if (savedUser && savedWallet) {
        currentUser = savedUser;
        userWallet = savedWallet;
        
        console.log('🔍 Restored session:', { currentUser, userWallet });
        console.log('🔍 Using stored wallet address from backend:', userWallet.address);
        
        showMainApp();
        
        // Load data in background
        Promise.all([
            loadContacts(),
            loadAllBalances()
        ]).catch(error => {
            console.error('❌ Error loading session data:', error);
        });
    }
}

// Balance Management
async function fetchBalance(networkKey) {
    if (!currentUser || !currentUser.uid) {
        console.log('❌ No user logged in for balance fetch');
        return;
    }
    
    const network = NETWORKS[networkKey];
    if (!network) {
        console.error('❌ Unknown network:', networkKey);
        return;
    }
    
    try {
        // Always fetch the current wallet address from backend
        const walletAddress = await getCurrentWalletAddress(currentUser.uid);
        if (!walletAddress) {
            console.log('❌ No wallet address available for balance fetch');
            return;
        }
        
        console.log(`💰 Fetching balance for ${network.name}...`);
        console.log(`🔍 Wallet address: ${walletAddress}`);
        console.log(`🔍 Chain ID: ${network.chainId}`);
        
        const response = await fetch(`${API_BASE_URL}/balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: walletAddress,
                chainId: network.chainId
            })
        });
        
        console.log(`🔍 Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${network.name} balance response:`, data);
            console.log(`🔍 Raw balance from API:`, data.balance);
            console.log(`🔍 Balance type:`, typeof data.balance);
            
            // Update UI with properly formatted balance
            const balanceElement = document.getElementById(network.balanceId);
            
            if (balanceElement) {
                // The API returns balance in ETH, format it properly
                const formattedBalance = formatBalance(data.balance);
                console.log(`🔍 Formatted balance:`, formattedBalance);
                balanceElement.textContent = formattedBalance;
                console.log(`📝 Updated ${network.name} balance to: ${formattedBalance}`);
            } else {
                console.error(`❌ Balance element not found for ${network.name}`);
            }
        } else {
            console.error(`❌ Failed to fetch ${network.name} balance:`, response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ Error details:`, errorData);
            
            // Set balance to 0.00 ETH on error
            const balanceElement = document.getElementById(network.balanceId);
            if (balanceElement) {
                balanceElement.textContent = '0.00 ETH';
            }
        }
    } catch (error) {
        console.error(`❌ Error fetching ${network.name} balance:`, error);
        
        // Set balance to 0.00 ETH on error
        const balanceElement = document.getElementById(network.balanceId);
        if (balanceElement) {
            balanceElement.textContent = '0.00 ETH';
        }
    }
}

async function loadAllBalances() {
    if (!currentUser || !currentUser.uid) {
        console.log('❌ No user logged in for balance loading');
        return;
    }
    
    console.log('🚀 Loading balances for all networks...');
    
    // Always fetch the current wallet address from backend
    const walletAddress = await getCurrentWalletAddress(currentUser.uid);
    if (!walletAddress) {
        console.log('❌ No wallet address available for balance loading');
        return;
    }
    
    console.log('Wallet address:', walletAddress);
    
    // Update wallet address display
    await updateWalletAddressDisplay();
    
    // Fetch balances for all networks in parallel
    const balancePromises = Object.keys(NETWORKS).map(networkKey => fetchBalance(networkKey));
    await Promise.allSettled(balancePromises);
    
    console.log('✅ Balance loading completed');
}

// Wallet Address Clipboard Management
async function updateWalletAddressDisplay() {
    const addressText = document.getElementById('walletAddressText');
    
    if (!currentUser || !currentUser.uid) {
        if (addressText) {
            addressText.textContent = 'Not connected';
        }
        return;
    }
    
    try {
        // Always fetch the current wallet address from backend
        const walletAddress = await getCurrentWalletAddress(currentUser.uid);
        
        if (addressText) {
            if (walletAddress) {
                addressText.textContent = walletAddress;
                // Update local state for consistency
                if (userWallet) {
                    userWallet.address = walletAddress;
                } else {
                    userWallet = { address: walletAddress };
                }
            } else {
                addressText.textContent = 'Not connected';
            }
        }
    } catch (error) {
        console.error('❌ Error updating wallet address display:', error);
        if (addressText) {
            addressText.textContent = 'Error loading address';
        }
    }
}

async function copyWalletAddress() {
    if (!currentUser || !currentUser.uid) {
        showCopyStatus('No user logged in', 'error');
        return;
    }
    
    try {
        // Always fetch the current wallet address from backend
        const walletAddress = await getCurrentWalletAddress(currentUser.uid);
        
        if (!walletAddress) {
            showCopyStatus('No wallet address available', 'error');
            return;
        }
        
        await navigator.clipboard.writeText(walletAddress);
        
        // Update button appearance
        const copyBtn = document.getElementById('copyAddressBtn');
        if (copyBtn) {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }
        
        showCopyStatus('Address copied to clipboard!', 'success');
    } catch (error) {
        console.error('❌ Failed to copy address:', error);
        showCopyStatus('Failed to copy address', 'error');
    }
}

function showCopyStatus(message, type) {
    const statusElement = document.getElementById('copyStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `copy-status ${type}`;
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'copy-status';
        }, 3000);
    }
}

// PWA Management
let deferredPrompt = null;

function initPWA() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 PWA install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install prompt
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.classList.add('show');
        }
    });
    
    // Handle install button click
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('📱 PWA install outcome:', outcome);
                deferredPrompt = null;
                
                // Hide prompt
                const prompt = document.getElementById('pwaInstallPrompt');
                if (prompt) {
                    prompt.classList.remove('show');
                }
            }
        });
    }
    
    // Handle dismiss button click
    const dismissBtn = document.getElementById('pwaDismissBtn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            const prompt = document.getElementById('pwaInstallPrompt');
            if (prompt) {
                prompt.classList.remove('show');
            }
        });
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('📱 Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        });
    }
}

// Event Listeners
function initEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', addContact);
    }
    
    // Transaction form
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', executeTransaction);
    }
    
    // Copy address button
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', copyWalletAddress);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 HAi Wallet initializing...');
    
    // Initialize clock
    initClock();
    
    // Initialize PWA
    initPWA();
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize event listeners
    initEventListeners();
    
    // Check for existing session
    checkExistingSession();
    
    console.log('✅ HAi Wallet initialized');
});

// Make deleteContact globally available for onclick handlers
window.deleteContact = deleteContact;