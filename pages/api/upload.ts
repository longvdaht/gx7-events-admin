import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Failed to parse form" });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const key = Array.isArray(fields.key) ? fields.key[0] : fields.key;

    if (!file || !key) return res.status(400).json({ error: "Missing file or key" });

    try {
      await s3
        .putObject({
          Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET ?? "",
          Key: key,
          Body: fs.readFileSync(file.filepath),
          ACL: "public-read",
          ContentType: file.mimetype ?? "application/octet-stream",
        })
        .promise();

      return res.status(200).json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });
}
