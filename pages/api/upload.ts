import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.APP_AWS_REGION,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { key, contentType } = req.query;

  if (!key || !contentType || typeof key !== "string" || typeof contentType !== "string") {
    return res.status(400).json({ error: "Missing key or contentType" });
  }

  const url = s3.getSignedUrl("putObject", {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
    Expires: 120,
  });

  return res.status(200).json({ url });
}
