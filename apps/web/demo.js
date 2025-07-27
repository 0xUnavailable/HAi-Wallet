// Global state
let currentUser = null;
let userWallet = null;
let userContacts = {};

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Utility functions
function showStatus(message, type = 'info') {
    const statusContainer = document.getElementById('statusContainer');
    const statusDiv = document.createElement('div');
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusContainer.appendChild(statusDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv);
        }
    }, 5000);
}

function clearStatus() {
    const statusContainer = document.getElementById('statusContainer');
    statusContainer.innerHTML = '';
}

function validateWalletAddress(address) {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Demo login functionality
async function demoLogin() {
    try {
        clearStatus();
        const email = document.getElementById('demoEmail').value.trim();
        
        if (!email) {
            showStatus('Please enter an email address', 'error');
            return;
        }

        showStatus('Creating demo wallet...', 'info');
        
        // Create a demo user with a deterministic wallet
        const demoUid = 'demo_' + email.replace(/[^a-zA-Z0-9]/g, '_');
        const demoWalletAddress = '0x' + '1234567890abcdef1234567890abcdef12345678';
        
        currentUser = {
            uid: demoUid,
            email: email
        };
        
        userWallet = {
            address: demoWalletAddress
        };
        
        // Show main sections
        document.getElementById('walletSection').style.display = 'block';
        document.getElementById('contactsSection').style.display = 'block';
        document.getElementById('transactionSection').style.display = 'block';
        document.getElementById('logoutSection').style.display = 'block';
        
        // Hide login section
        document.querySelector('.demo-section').style.display = 'none';
        
        // Update wallet address display
        document.getElementById('walletAddress').textContent = userWallet.address;
        
        // Load contacts
        await loadContacts();
        
        showStatus('Demo login successful!', 'success');
    } catch (error) {
        console.error('Demo login error:', error);
        showStatus(`Login error: ${error.message}`, 'error');
    }
}

// Contact Management
async function loadContacts() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/contacts/${currentUser.uid}`);
        if (response.ok) {
            const data = await response.json();
            userContacts = data.contacts || {};
        } else {
            userContacts = {};
        }
        updateContactsList();
    } catch (error) {
        console.error('Error loading contacts:', error);
        userContacts = {};
        updateContactsList();
    }
}

function updateContactsList() {
    const contactsList = document.getElementById('contactsList');
    
    if (Object.keys(userContacts).length === 0) {
        contactsList.innerHTML = '<p>No contacts yet. Add your first contact above.</p>';
        return;
    }
    
    contactsList.innerHTML = '';
    
    Object.entries(userContacts).forEach(([name, address]) => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        
        const contactInfo = document.createElement('div');
        contactInfo.innerHTML = `
            <div class="contact-name">${name}</div>
            <div class="contact-address">${address}</div>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteContact(name);
        
        contactItem.appendChild(contactInfo);
        contactItem.appendChild(deleteBtn);
        contactsList.appendChild(contactItem);
    });
}

async function addContact() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    
    const name = document.getElementById('contactName').value.trim();
    const address = document.getElementById('contactAddress').value.trim();
    
    if (!name) {
        showStatus('Please enter a contact name', 'error');
        return;
    }
    
    if (!address) {
        showStatus('Please enter a wallet address', 'error');
        return;
    }
    
    if (!validateWalletAddress(address)) {
        showStatus('Please enter a valid Ethereum wallet address (0x...)', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: currentUser.uid,
                name: name,
                address: address
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add contact');
        }

        // Reload contacts from server
        await loadContacts();
        
        // Clear form
        document.getElementById('contactName').value = '';
        document.getElementById('contactAddress').value = '';
        
        showStatus(`Contact "${name}" added successfully!`, 'success');
    } catch (error) {
        console.error('Add contact error:', error);
        showStatus(`Error adding contact: ${error.message}`, 'error');
    }
}

async function deleteContact(name) {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the contact "${name}"?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/contacts/${currentUser.uid}/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete contact');
            }

            // Reload contacts from server
            await loadContacts();
            showStatus(`Contact "${name}" deleted successfully!`, 'success');
        } catch (error) {
            console.error('Delete contact error:', error);
            showStatus(`Error deleting contact: ${error.message}`, 'error');
        }
    }
}

// Transaction Execution
async function executeTransaction() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    
    const prompt = document.getElementById('transactionPrompt').value.trim();
    
    if (!prompt) {
        showStatus('Please enter a transaction description', 'error');
        return;
    }
    
    try {
        clearStatus();
        showStatus('Processing transaction...', 'info');
        
        const executeBtn = document.getElementById('executeTransactionBtn');
        const originalText = executeBtn.textContent;
        executeBtn.textContent = 'Processing...';
        executeBtn.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/relay/quote-and-execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                uid: currentUser.uid
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transaction failed');
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            showStatus(`Transaction executed successfully! Request ID: ${result.requestId}`, 'success');
            document.getElementById('transactionPrompt').value = '';
        } else {
            throw new Error(result.error || 'Transaction failed');
        }
    } catch (error) {
        console.error('Transaction error:', error);
        showStatus(`Transaction error: ${error.message}`, 'error');
    } finally {
        const executeBtn = document.getElementById('executeTransactionBtn');
        executeBtn.textContent = 'Execute Transaction';
        executeBtn.disabled = false;
    }
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current session
        currentUser = null;
        userWallet = null;
        userContacts = {};
        
        // Hide main sections
        document.getElementById('walletSection').style.display = 'none';
        document.getElementById('contactsSection').style.display = 'none';
        document.getElementById('transactionSection').style.display = 'none';
        document.getElementById('logoutSection').style.display = 'none';
        
        // Show login section
        document.querySelector('.demo-section').style.display = 'block';
        
        // Clear status
        clearStatus();
        
        showStatus('Logged out successfully', 'info');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Demo login button
    document.getElementById('demoLoginBtn').addEventListener('click', demoLogin);
    
    // Add contact button
    document.getElementById('addContactBtn').addEventListener('click', addContact);
    
    // Execute transaction button
    document.getElementById('executeTransactionBtn').addEventListener('click', executeTransaction);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Enter key handlers
    document.getElementById('demoEmail').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            demoLogin();
        }
    });
    
    document.getElementById('contactName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('contactAddress').focus();
        }
    });
    
    document.getElementById('contactAddress').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addContact();
        }
    });
    
    document.getElementById('transactionPrompt').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            executeTransaction();
        }
    });
}); 