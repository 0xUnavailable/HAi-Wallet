import admin from 'firebase-admin';

// Using demo mode only - no Firebase setup required
let firebaseInitialized = false;
console.log('✅ Using demo mode - no Firebase setup required');

// In-memory storage for demo mode
const demoContacts: Record<string, Record<string, string>> = {};

// Export a wrapper that handles both Firebase and demo modes
const firebaseWrapper = {
  isInitialized: () => firebaseInitialized,
  
  // Contact management functions
  async addContact(uid: string, name: string, address: string) {
    if (firebaseInitialized) {
      const userRef = admin.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const contacts = userData?.contacts || {};
        
        if (contacts[name]) {
          throw new Error('Contact name already exists');
        }
        
        const existingContact = Object.entries(contacts).find(([_, addr]) => 
          (addr as string).toLowerCase() === address.toLowerCase()
        );
        if (existingContact) {
          throw new Error(`This address is already saved as "${existingContact[0]}"`);
        }
        
        contacts[name] = address;
        await userRef.update({ contacts });
      } else {
        await userRef.set({ 
          contacts: { [name]: address },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } else {
      // Demo mode - store in memory
      if (!demoContacts[uid]) {
        demoContacts[uid] = {};
      }
      
      if (demoContacts[uid][name]) {
        throw new Error('Contact name already exists');
      }
      
      const existingContact = Object.entries(demoContacts[uid]).find(([_, addr]) => 
        addr.toLowerCase() === address.toLowerCase()
      );
      if (existingContact) {
        throw new Error(`This address is already saved as "${existingContact[0]}"`);
      }
      
      demoContacts[uid][name] = address;
      console.log(`Demo: Added contact ${name} for user ${uid}`);
    }
  },
  
  async getContacts(uid: string) {
    if (firebaseInitialized) {
      const userRef = admin.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return {};
      }
      
      const userData = userDoc.data();
      return userData?.contacts || {};
    } else {
      // Demo mode - return from memory
      console.log(`Demo: Getting contacts for user ${uid}`);
      return demoContacts[uid] || {};
    }
  },
  
  async deleteContact(uid: string, name: string) {
    if (firebaseInitialized) {
      const userRef = admin.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const contacts = userData?.contacts || {};
      
      if (!contacts[name]) {
        throw new Error('Contact not found');
      }
      
      delete contacts[name];
      await userRef.update({ contacts });
    } else {
      // Demo mode
      if (!demoContacts[uid] || !demoContacts[uid][name]) {
        throw new Error('Contact not found');
      }
      delete demoContacts[uid][name];
      console.log(`Demo: Deleted contact ${name} for user ${uid}`);
    }
  },
  
  async resolveContact(uid: string, name: string) {
    if (firebaseInitialized) {
      const userRef = admin.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error('Contact not found');
      }
      
      const userData = userDoc.data();
      const contacts = userData?.contacts || {};
      
      const address = contacts[name];
      if (!address) {
        throw new Error('Contact not found');
      }
      
      return address;
    } else {
      // Demo mode - return from memory
      console.log(`Demo: Resolving contact ${name} for user ${uid}`);
      return demoContacts[uid]?.[name] || null;
    }
  }
};

export default firebaseWrapper; 