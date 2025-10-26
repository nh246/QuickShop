// import mongoose from "mongoose";

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose
//       .connect(`${process.env.MONGODB_URI}/QuickShop`, opts)
//       .then((mongoose) => {
//         return mongoose;
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }


// export default connectDB;


// db.js (MODIFIED)

import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // --- START MODIFIED OPTS ---
    const opts = {
      bufferCommands: false, // Prevents Mongoose from waiting forever
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      // Add this option if you are running into IPv4/IPv6 issues on some Node versions
      // family: 4, 
    };
    // --- END MODIFIED OPTS ---

    // Ensure the MONGODB_URI/QuickShop path is correctly used
    const uri = `${process.env.MONGODB_URI}/QuickShop`; 
    console.log("Attempting to connect to MongoDB URI:", uri); // Log the URI (without password)

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log("MongoDB connection successful!");
        return mongoose;
      })
      .catch((error) => {
        // Log the failure explicitly
        console.error("MongoDB connection failed:", error.message);
        throw error; // Propagate the error immediately
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;