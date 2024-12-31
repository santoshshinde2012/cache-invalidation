#!/bin/bash

# This script initializes a MongoDB replica set. It waits for the MongoDB service to start,
# then connects to it using the 'mongosh' command and initiates the replica set configuration.

# The script is designed to run in a separate container that depends on the MongoDB container.
# This ensures that the MongoDB service is fully up and running before the replica set initialization is attempted.

echo ====================================================
echo ============= Initializing Replica Set =============
echo ====================================================

# Loop until MongoDB is ready to accept connections
until mongosh --host mongo:27017 --eval 'quit(0)' &>/dev/null; do
  echo "Waiting for mongod to start..."
  sleep 5
done

echo "MongoDB started. Initiating Replica Set..."

# Connect to the MongoDB service and initiate the replica set
mongosh --host mongo:27017 -u root -p rootpassword --authenticationDatabase admin <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})

while (!rs.isMaster().ismaster) {
  sleep(1000); // Wait for 1 second before checking again
}

print("Replica set initialized.");

use database;

// Check if the collection already exists

if (db.getCollectionNames().includes("queries")) {
  print("Collection 'queries' already exists. Modifying its options...");
  db.runCommand({
    collMod: "queries",
    changeStreamPreAndPostImages: { enabled: true }
  });
} else {
  print("Collection 'queries' does not exist. Creating it...");
  db.createCollection("queries", {
    changeStreamPreAndPostImages: { enabled: true }
  });
}

EOF

echo "Replica Set initialized and pre-images enabled."
