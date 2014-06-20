function WebHookError(message, contentType, body, signature) {
    this.name = 'PusherWebHookError';
    this.message = message;
    this.stack = (new Error()).stack;
    this.contentType = contentType;
    this.signature = signature;
    this.body = body;
}
WebHookError.prototype = new Error;

exports.WebHookError = WebHookError;
