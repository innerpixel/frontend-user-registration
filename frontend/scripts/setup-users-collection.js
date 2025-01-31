// Create users collection with schema validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "displayName", "email", "password", "simNumber", "status", "emailVerified", "simVerified", "createdAt", "updatedAt"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        displayName: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        password: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        simNumber: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        status: {
          bsonType: "string",
          enum: ["unverified", "email_verified", "sim_verified", "active"],
          description: "must be one of the enum values and is required"
        },
        emailVerified: {
          bsonType: "bool",
          description: "must be a boolean and is required"
        },
        simVerified: {
          bsonType: "bool",
          description: "must be a boolean and is required"
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required"
        },
        updatedAt: {
          bsonType: "date",
          description: "must be a date and is required"
        }
      }
    }
  }
});

// Create unique indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "displayName": 1 }, { unique: true });
db.users.createIndex({ "simNumber": 1 }, { unique: true });
