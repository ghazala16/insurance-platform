// MongoDB initialization script
// Creates app-specific user and indexes for the insurancedb database

db = db.getSiblingDB('insurancedb');

// Create app user with restricted permissions
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [{ role: 'readWrite', db: 'insurancedb' }],
});

// Create indexes for policies collection
db.policies.createIndex({ policyNumber: 1 }, { unique: true });
db.policies.createIndex({ createdBy: 1 });
db.policies.createIndex({ status: 1 });
db.policies.createIndex({ createdAt: -1 });
db.policies.createIndex(
  { holderName: 'text', policyNumber: 'text', title: 'text' },
  { name: 'policies_text_search' }
);

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

print('InsureFlow MongoDB initialization complete.');
