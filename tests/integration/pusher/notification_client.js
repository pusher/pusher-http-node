var expect = require("expect.js");
var NotificationClient = require("../../../lib/notification_client");
var nock = require('nock');

describe("NativeNotificationClient", function() {
  var client;

  beforeEach(function(){
    client = new NotificationClient({ appId: 1234, key: "f00d", secret: "beef" });
    nock.cleanAll();
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  xit("should send in the success case", function(done){
    var mock = nock("nativepush-cluster1.pusher.com:80")
    client.notify(['yolo'],{
      'apns': {
        'aps': {
          'alert':{
            'title': 'yolo',
            'body': 'woot'
          }
        }
      },
      'gcm': {
        'notification': {
          'title': 'huzzah',
          'icon': 'woot'
        }
      }

    }, function(){
      expect(mock.isDone()).to.be(true);
      done();
    });
  });
})
