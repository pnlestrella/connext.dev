// utils/upload.ts
import Constants from "expo-constants";

export const getJobs = async (image: {
  uri: string;
  name?: string;
  mimeType?: string;
}) => {
  const keysRes = await fetch(
    `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/imagekit/getUploadKeys`
  );
  const { message, public_key } = await keysRes.json();
  const authParams = message;

  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    name: image.name || "upload.jpg",
    type: image.mimeType || "image/jpeg",
  } as any);
  formData.append("fileName", image.name || "upload.jpg");
  formData.append("isPrivateFile", "false");
  formData.append("signature", authParams.signature);
  formData.append("expire", authParams.expire.toString());
  formData.append("token", authParams.token);
  formData.append("publicKey", public_key);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Image upload failed: ${res.status}`);
  }

  return await res.json(); // ✅ return JSON, not Response
};
