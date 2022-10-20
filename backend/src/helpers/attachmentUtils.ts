import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4' // Use Sigv4 algorithm
});


// TODO: Implement the fileStogare logic
export class AttachmentUtils{

getUploadUrl(todoId: string): string {
    const presignedUrl = s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
        Bucket: process.env.ATTACHMENT_S3_BUCKET, // Name of an S3 bucket
        Key: todoId, // id of an object this URL allows access to
        Expires: '300'  // A URL is only valid for 5 minutes
    })
    return presignedUrl;
}
}