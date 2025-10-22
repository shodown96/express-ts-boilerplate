// src/index.js
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { app } from "./app";

const s3Client = new S3Client({
    region: String(process.env.AWS_REGION),
    credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),

    }
});
// TO BE CONTINUED
app.get("/api/v1/movies/stream", async (req, res) => {
    console.log("stream")
    const fileName = "4K ULtra HD _ SAMSUNG UHD Demo׃ LED TV.mp4"
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    });
    const item = await s3Client.send(command);
    if (item.Body) {
        // Set appropriate headers for the response
        res.setHeader('Content-Type', 'application/octet-stream'); // Adjust content type as needed
        // res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const body = item.Body as any
        return body.pipe(res);
    }
});