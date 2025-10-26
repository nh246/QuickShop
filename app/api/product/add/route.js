import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({
        success: false,
        message: "You are not a seller",
      });
    }

    const fromData = await request.fromData();
    const name = fromData.get("name");
    const description = fromData.get("description");
    const category = fromData.get("category");
    const price = fromData.get("price");
    const offerPrice = fromData.get("offerPrice");

    const files = fromData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No images uploaded",
      });
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      })
    );

    const image = result.map((result) => result.secure_url);
  } catch (error) {}
}
