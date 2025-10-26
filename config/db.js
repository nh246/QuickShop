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



// NB: Final code 


// /config/inngest.js (Focus on the syncUserCreation content)

// Assume you have imported 'User' model and 'connectDB' function
// import User from '../models/User'; 
// import connectDB from '../config/db'; 

// Recommended placeholder image URL
// const DEFAULT_IMAGE_URL = "https://cdn.example.com/placeholder-user.png"; 

// export const syncUserCreation = inngest.createFunction(
//   { id: 'sync-user-from-clerk' }, // Your function ID
//   { event: 'clerk/user.created' },
//   async ({ event }) => {
    
//     // Deconstruct fields from the event data
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;

//     // --- Critical Data Safety Checks ---
    
//     const email = email_addresses?.[0]?.email_address;
//     if (!email) {
//       throw new Error("Clerk event is missing a primary email address.");
//     }
    
//     // Ensure the name is a safe, non-null string
//     const name = `${first_name || ''} ${last_name || ''}`.trim();
//     if (!name) {
//       throw new Error("Clerk event is missing required name fields.");
//     }
    
//     // --- Construct Data Object (Ensuring Correct Mongoose Key Names) ---

//     const userData = {
//       _id: id,
//       email: email,
//       name: name, 
      
//       // FIX: Use the 'image_url' from the payload OR the fallback.
//       // NOTE: Key is 'imageUrl' (camelCase) to match the schema.
//       imageUrl: image_url || DEFAULT_IMAGE_URL, 
      
//       cartItems: {},
//     };
    
//     // --- Database Operation ---
    
//     await connectDB();
    
//     // Use findOneAndUpdate with upsert: true for idempotent creation
//     await User.findOneAndUpdate(
//       { _id: id },
//       userData,
//       { 
//         upsert: true,        // Create the document if it doesn't exist
//         new: true,           // Return the new document (optional, but good practice)
//         runValidators: true  // Run validation checks on the upserted data
//       }
//     );
    
//     return { 
//       success: true, 
//       message: `User ${id} created/synced successfully with Mongoose.`,
//     };
//   }
// );