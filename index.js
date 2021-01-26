/*
   Copyright 2021 Apigrate LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const s3 = new S3Client();

/**
 * Utility class to store JSON data in a secure AWS bucket.
 * Note, your AWS profile must be configured correctly in your environment
 * and have appropriate permissions to the AWS bucket in question.
 */
class AwsStorage{
  constructor(bucket, key){
    if(!bucket) throw new Error('bucket is required');
    if(!key) throw new Error('key is required');
    this.bucket = bucket;
    this.key = key;
  }

  /**
   * Gets the JSON data from an AWS bucket. 
   * @returns a json object containing the data.
   */
  async get(){
    try {

      let command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.key
      })
      let objectResult = await s3.send(command);
      let content = await streamToString(objectResult.Body);
      let creds = JSON.parse(content);
      return creds;
    } catch(ex){
      if(ex.code === 'NoSuchKey'|| (ex.$metadata && ex.$metadata.httpStatusCode === 404)){
        return null;
      }
      console.error(ex);
      throw ex;
    }
  }

  /**
   * Stores JSON data in an AWS bucket.
   * @param {object} data an object containing data data to store.
   */
  async set(data){
    let command = new PutObjectCommand({
      Body: JSON.stringify(data),
      Bucket: this.bucket,
      Key: this.key,
      ServerSideEncryption: "AES256"
    });
    return await s3.send(command);
  }
}

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

exports.AwsStorage = AwsStorage;