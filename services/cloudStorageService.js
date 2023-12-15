// cloudStorageService.js
const {
    Storage
} = require('@google-cloud/storage');

const storage = new Storage({
    projectId: 'your-project-id',
    keyFilename: 'path/to/your/keyfile.json',
});

const bucket = storage.bucket('your-cloud-storage-bucket');

function uploadFile(file, destination) {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(destination);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.end(file.buffer);
    });
}

module.exports = {
    uploadFile,
};