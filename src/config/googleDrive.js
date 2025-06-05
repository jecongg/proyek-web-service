const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const HERO_DRIVE_FOLDER_ID = process.env.HERO_GOOGLE_DRIVE_FOLDER_ID || "1XxpeRYeLhYFFpWd6raORectRDXw-K8ZE";
const SKIN_DRIVE_FOLDER_ID = process.env.SKIN_GOOGLE_DRIVE_FOLDER_ID || "1XxpeRYeLhYFFpWd6raORectRDXw-K8ZE";
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, "../config/your-service-account-key.json");

async function getDriveService() {
    try {
        if (!fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
            console.error("File Service Account Key tidak ditemukan di:", SERVICE_ACCOUNT_KEY_PATH);
            return null;
        }
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_KEY_PATH,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const authClient = await auth.getClient();
        return google.drive({ version: "v3", auth: authClient });
    } catch (error) {
        console.error("Error saat inisialisasi layanan Google Drive:", error.message);
        return null;
    }
}

async function uploadImageToDrive(imageBuffer, fileName, mimeType, folderId) {
    const driveService = await getDriveService();
    if (!driveService) {
        console.warn("Layanan Google Drive tidak tersedia. Upload dilewati.");
        return null;
    }
    if (!imageBuffer || !mimeType) {
        console.warn("Tidak ada data gambar (buffer atau mimetype) untuk diupload. Upload dilewati.");
        return null;
    }
    try {
        const imageStream = new stream.PassThrough();
        imageStream.end(imageBuffer);
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };
        const media = {
            mimeType: mimeType,
            body: imageStream,
        };
        console.log(`Mengunggah gambar '${fileName}' ke folder Google Drive ID '${folderId}'...`);
        const response = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id, webViewLink, webContentLink",
        });
        console.log("Gambar berhasil diunggah ke Drive. File ID:", response.data.id);
        return {
            id: response.data.id,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
        };
    } catch (error) {
        console.error("Error saat mengunggah gambar ke Google Drive:", error.message);
        if (error.response && error.response.data) {
            console.error("Detail Error Google Drive API:", error.response.data.error);
        } else if (error.errors) {
            console.error("Array Error Google Drive API:", error.errors);
        }
        return null;
    }
}

module.exports = {
    getDriveService,
    uploadImageToDrive,
    HERO_DRIVE_FOLDER_ID,
    SKIN_DRIVE_FOLDER_ID
}; 