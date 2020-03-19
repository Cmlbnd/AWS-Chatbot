const path = require('path');
const AWS = require('aws-sdk');
console.log(process.env);

const { AWS_REGION, ELASTICSEARCH_DOMAIN } = process.env;
const endpoint = new AWS.Endpoint(ELASTICSEARCH_DOMAIN);
const httpClient = new AWS.HttpClient();
const credentials = new AWS.EnvironmentCredentials('AWS');
 
/**
 * Sends a request to Elasticsearch
 *
 * @param {string} httpMethod - The HTTP method, e.g. 'GET', 'PUT', 'DELETE', etc
 * @param {string} requestPath - The HTTP path (relative to the Elasticsearch domain), e.g. '.kibana'
 * @param {Object} [payload] - An optional JavaScript object that will be serialized to the HTTP request body
 * @returns {Promise} Promise - object with the result of the HTTP response
 */
function sendRequest({ httpMethod, requestPath, payload }) {
    const request = new AWS.HttpRequest(endpoint, AWS_REGION);
 
    request.method = httpMethod;
    request.path = path.join(request.path, requestPath);
    request.body = JSON.stringify(payload);
    request.headers['Content-Type'] = 'application/json';
    request.headers['Host'] = ELASTICSEARCH_DOMAIN;
 
    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());
    return new Promise((resolve, reject) => {
        httpClient.handleRequest(request, null,
            response => {
                const { statusCode, statusMessage, headers } = response;
                let body = '';
                response.on('data', chunk => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = {
                        statusCode,
                        statusMessage,
                        headers
                    };
                    if (body) {
                        console.log(body);
                        data.body = JSON.parse(body);
                    }
                    resolve(data);
                });
            },
            err => {
                reject(err);
            });
    });
}
 
module.exports = sendRequest;