import { decode } from "base64-arraybuffer";
import { supabase } from "../supabase";
export async function uploadImageToSupabase(imageBase64: string, imageType: string, userId: string): Promise<string> {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const filePath = `${userId}/${new Date().getTime()}.${imageType === "image" ? "png" : "jpg"}`;
  const contentType = imageType === "image" ? "image/png" : "image/jpeg";

  const { error: uploadError } = await supabase
    .storage
    .from("food")
    .upload(filePath, decode(imageBase64), {
      contentType: contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[UPLOAD ERROR]", uploadError);
    throw uploadError;
  }

  const { data, error } = await supabase
    .storage
    .from("food")
    .createSignedUrl(filePath, 31536000, {
      transform: {
        width: 800,
        height: 600,
      }
    });

  if (error) {
    console.error("[GET PUBLIC URL ERROR]", error);
    throw error;
  }

  return data.signedUrl;
}
