function WebHookError(message, contentType, body, signature) {
    this.name = 'PusherWebHookError';
    this.message = message;
    this.stack = (new Error()).stack;
    this.contentType = contentType;
    this.signature = signature;
    this.body = body;
}
WebHookError.prototype = new Error;

function RequestError(message, error, url, statusCode, body) {
    this.name = 'PusherRequestError';
    this.error = error;
    this.message = message;
    this.stack = (new Error()).stack;
    this.url = url;
    this.statusCode = statusCode;
    this.body = body;
}
RequestError.prototype = new Error;

exports.WebHookError = WebHookError;
exports.RequestError = RequestError;
