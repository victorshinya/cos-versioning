/**
 *
 * Copyright 2021 Victor Shinya
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
// https://www.npmjs.com/package/ibm-cos-sdk
const { S3 } = require("ibm-cos-sdk");
/**
 *
 * IBM CLOUD OBJECT STORAGE
 * Endpoint access -> Endpoint, API Key and Instance ID
 *
 */
let cos;
/**
 *
 * IBM CLOUD OBJECT STORAGE
 * Using "From-To" logic with all logs
 *
 */
let BUCKET_ORIGIN;
let BUCKET_VERSIONING;

function createVersioningObjectName(fileName, requestTime) {
    return requestTime.replace(/[\-\:\.]/g, "").concat("_", fileName);
}

async function createCopyObject(fileName, requestTime) {
    try {
        const versioningObjectName = createVersioningObjectName(
            fileName,
            requestTime
        );
        await cos
            .copyObject({
                Bucket: BUCKET_VERSIONING,
                CopySource: `${BUCKET_ORIGIN}/${fileName}`,
                Key: versioningObjectName,
            })
            .promise();
        return { status: 200, message: "Versioning completed" };
    } catch (e) {
        console.error(e);
        return e;
    }
}

async function main(params) {
    if (!cos) {
        cos = await new S3({
            endpoint: params.endpoint,
            apiKeyId: params.apiKeyId,
            ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
            serviceInstanceId: params.serviceInstanceId,
        });
    }
    if (!BUCKET_ORIGIN || !BUCKET_VERSIONING) {
        BUCKET_ORIGIN = params.bucketOrigin;
        BUCKET_VERSIONING = params.bucketVersioning;
    }
    const response = await createCopyObject(
        params.key,
        params.notification.request_time
    );
    console.log(
        `DEBUG: createCopyObject = ${JSON.stringify(response.message)}`
    );
}
