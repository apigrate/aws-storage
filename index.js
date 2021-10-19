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
const {S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, PutObjectTaggingCommand} = require('@aws-sdk/client-s3');
const s3 = new S3Client();

/**
 * Utility class to store and retrieve JSON data in a secure AWS bucket.
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
   * 
   * Data is encrypted using AES 256 encryption.
   * 
   * @param {object} data an object containing data data to store.
   * @param {object} tags (optional) key-value pairs for the stored object to be set as tags.
   */
  async set(data, tags){
    let command = new PutObjectCommand({
      Body: JSON.stringify(data),
      Bucket: this.bucket,
      Key: this.key,
      ServerSideEncryption: "AES256"
    });
    let putObjectResults = await s3.send(command);
    
    if(tags){
      let tagSet = [];
      for(let key in tags){
        tagSet.push({Key: key, Value:tags[key]});
      }
      let tagCommand = new PutObjectTaggingCommand({
        Bucket: this.bucket,
        Key: this.key,
        Tagging: {
          TagSet: tagSet
        },
      });

      let tagCommandResults = await s3.send(tagCommand);
    }

    return putObjectResults;
  }
}//class

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

/**
 * Helper class for querying AWS S3 buckets.
 */
class AwsStorageFolder{
  constructor(bucket, folder){
    this.bucket = bucket;
    this.folder = folder;
  }

  /**
   * 
   * @param {*} params 
   * @param {number} params.Prefix
   * @param {string} params.MaxKeys
   * @returns {object}
   * @example 
   * {
   *   '$metadata': {...},
   *   CommonPrefixes: undefined,
   *   Contents: [
   *     {
   *       Key: 'test/bork.json',
   *       LastModified: 2021-08-26T13:04:17.000Z,
   *       ETag: '"1e2019edee96e8778a0ba73d33ec2acd"',
   *       Size: 24,
   *       StorageClass: 'STANDARD',
   *       Owner: {
   *         DisplayName: 'derek',
   *         ID: '9c4cd4d60c238b9cb2ba8371d426abe8c828d67f8b1cfbadcfb34a95c1df9f33'
   *       }
   *     }, ...
   *   ],
   *   Delimiter: undefined,
   *   EncodingType: undefined,
   *   IsTruncated: false,
   *   Marker: '',
   *   MaxKeys: 1000,
   *   Name: 'my-bucket-name',
   *   NextMarker: undefined,
   *   Prefix: 'my-folder/'
   * }
   */
  async listContents(params){
    let input = {};
    Object.assign(input, params);
    input.Bucket = this.bucket;
    input.Prefix = this.folder;
    
    let command = new ListObjectsV2Command(input);
    return await s3.send(command);
  }
}

exports.AwsStorage = AwsStorage;
exports.AwsStorageFolder = AwsStorageFolder;