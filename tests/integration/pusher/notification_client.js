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

	it("should remove restricted GCM keys", function(){
		var notification = {
			'gcm': {
				'to': 'woot',
				'registration_ids': ['woot', 'bla'],
				'notification': {
					'title': 'yipee',
					'icon': 'huh'
				}
			}
		};

		client.validateNotification(notification);
		expect(notification).to.eql({ gcm: { notification: { title: 'yipee', icon: 'huh' }}});
	});

	it("should validate that either apns or gcm are present", function(){
		var notification = {};
		expect(function(){
			client.validateNotification(notification);
		}).to.throwException(/Notification must have fields APNS or GCM/);
	});

	it("should validate that only one interest is sent to", function(){
		expect(function(){
			client.notify(['yolo', 'woot'], {});
		}).to.throwException(/Currently sending to more than one interest is unsupported/);
	})

	it("should invalidate certain gcm payloads", function(){
		var invalidGcmPayloads = [
			{
				'gcm': {
					'time_to_live': -1,
					'notification': {
						'title': 'yipee',
						'icon': 'huh'
					}
				},
				exception: /GCM time_to_live must be between 0 and 241920 \(4 weeks\)/
			},
			{
				'gcm': {
					'time_to_live': 241921,
					'notification': {
						'title': 'yipee',
						'icon': 'huh'
					}
				},
				exception: /GCM time_to_live must be between 0 and 241920 \(4 weeks\)/
			},
			{
				'gcm': {
					'notification': {
						'title': 'yipee',
					}
				},
				exception: /GCM icon must be a string and not empty/
			},
			{
				'gcm': {
					'notification': {
						'icon': 'huh'
					}
				},
				exception: /GCM title must be a string and not empty/
			},
			{
				'gcm': {
					'notification': {
						'title': '',
						'icon': 'huh'
					}
				},
				exception: /GCM title must be a string and not empty/
			},
			{
				'gcm': {
					'notification': {
						'title': 'yipee',
						'icon': ''
					}
				},
				exception: /GCM icon must be a string and not empty/
			}
		]

		for (var index in invalidGcmPayloads) {
			var invalidPayload = invalidGcmPayloads[index];
			expect(function(){
				client.notify(['yolo'], invalidPayload);
			}).to.throwException(invalidPayload.exception || /%/);
		}
	});

	it("validates webhook config", function(){
		invalidWebhookConfig = [
			{
				'webhook_level': 'DEBUG',
				'apns': {
					'alert': {
					'title': 'yolo',
					'body': 'woot'
					}
				},
				'gcm': {
					'notification': {
						'title': 'yipee',
						'icon': 'huh'
					}
				},
				exception: 'webhook_level cannot be used without a webhook_url'
			},
			{
				'webhook_level': 'FOOBAR',
				'webhook_url': 'http://webhook.com',
				'apns': {
					'alert': {
					'title': 'yolo',
					'body': 'woot'
					}
				},
				'gcm': {
					'notification': {
						'title': 'yipee',
						'icon': 'huh'
					}
				},
				exception: 'webhook_level must be either INFO or DEBUG. Blank will default to INFO'
			}];

		for (var index in invalidWebhookConfig) {
			var invalidPayload = invalidWebhookConfig[index];
			expect(function(){
				client.notify(['yolo'], invalidPayload);
			}).to.throwException(new RegExp(invalidPayload.exception));
		}
	})
})
