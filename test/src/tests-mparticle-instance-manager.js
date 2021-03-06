import sinon from 'sinon';
import { urls, MPConfig } from './config';

var mockServer;

function returnEventForMPInstance(server, apiKey, eventName) {
    var requests = [];
    var requestsPerApiKey = server.requests.filter(function(request) {
        return request.url.includes(apiKey);
    });
    requestsPerApiKey.forEach(function(request) {
        if (request.requestBody && request.requestBody.includes(eventName)) {
            requests.push(JSON.parse(request.requestBody));
        }
    });
    return requests;
}

describe('mParticle instance manager', function() {
    it('has all public apis on it', function(done) {
        mParticle.ProductActionType.should.have.properties([
            'Unknown',
            'AddToCart',
            'RemoveFromCart',
            'Checkout',
            'CheckoutOption',
            'Click',
            'ViewDetail',
            'Purchase',
            'Refund',
            'AddToWishlist',
            'RemoveFromWishlist',
            'getName',
            'getExpansionName',
        ]);
        mParticle.CommerceEventType.should.have.properties([
            'ProductAddToCart',
            'ProductRemoveFromCart',
            'ProductCheckout',
            'ProductCheckoutOption',
            'ProductClick',
            'ProductViewDetail',
            'ProductPurchase',
            'ProductRefund',
            'PromotionView',
            'PromotionClick',
            'ProductAddToWishlist',
            'ProductRemoveFromWishlist',
            'ProductImpression',
        ]);
        mParticle.EventType.should.have.properties([
            'Unknown',
            'Navigation',
            'Location',
            'Search',
            'Transaction',
            'UserContent',
            'UserPreference',
            'Social',
            'Other',
            'Media',
            'getName',
        ]);
        mParticle.PromotionType.should.have.properties([
            'Unknown',
            'PromotionView',
            'PromotionClick',
            'getName',
            'getExpansionName',
        ]);
        mParticle.IdentityType.should.have.properties([
            'Other',
            'CustomerId',
            'Facebook',
            'Twitter',
            'Google',
            'Microsoft',
            'Yahoo',
            'Email',
            'FacebookCustomAudienceId',
            'Other2',
            'Other3',
            'Other4',
            'isValid',
            'getName',
            'getIdentityType',
            'getIdentityName',
        ]);
        mParticle.Identity.should.have.properties([
            'HTTPCodes',
            'identify',
            'logout',
            'login',
            'modify',
            'getCurrentUser',
            'getUser',
            'getUsers',
            'aliasUsers',
            'createAliasRequest',
        ]);
        mParticle.Identity.HTTPCodes.should.have.properties([
            'noHttpCoverage',
            'activeIdentityRequest',
            'activeSession',
            'validationIssue',
            'nativeIdentityRequest',
            'loggingDisabledOrMissingAPIKey',
            'tooManyRequests',
        ]);
        mParticle.eCommerce.should.have.properties([
            'Cart',
            'setCurrencyCode',
            'createProduct',
            'createPromotion',
            'createImpression',
            'createTransactionAttributes',
            'logCheckout',
            'logProductAction',
            'logPurchase',
            'logPromotion',
            'logImpression',
            'logRefund',
            'expandCommerceEvent',
        ]);
        mParticle.Consent.should.have.properties([
            'createGDPRConsent',
            'createCCPAConsent',
            'createConsentState',
        ]);
        mParticle.sessionManager.should.have.property('getSession');

        mParticle.should.have.properties([
            'Store',
            'getDeviceId',
            'generateHash',
            'sessionManager',
            'isIOS',
            'Identity',
            'IdentityType',
            'EventType',
            'CommerceEventType',
            'PromotionType',
            'ProductActionType',
            'init',
            'setLogLevel',
            'reset',
            '_resetForTests',
            'ready',
            'getVersion',
            'setAppVersion',
            'getAppName',
            'setAppName',
            'getAppVersion',
            'stopTrackingLocation',
            'startTrackingLocation',
            'setPosition',
            'startNewSession',
            'endSession',
            'logBaseEvent',
            'logEvent',
            'logError',
            'logLink',
            'logForm',
            'logPageView',
            'Consent',
            'eCommerce',
            'setSessionAttribute',
            'setOptOut',
            'setIntegrationAttribute',
            'getIntegrationAttributes',
            'addForwarder',
            'configurePixel',
            '_getActiveForwarders',
            '_getIntegrationDelays',
            '_setIntegrationDelay',
        ]);

        done();
    });

    describe('multiple instances testing', function() {
        beforeEach(function() {
            //remove each of the instance's localStorage
            localStorage.removeItem('mprtcl-v4_wtTest1');
            localStorage.removeItem('mprtcl-v4_wtTest2');
            localStorage.removeItem('mprtcl-v4_wtTest3');
            localStorage.removeItem('mprtcl-prodv4_wtTest1');
            localStorage.removeItem('mprtcl-prodv4_wtTest2');
            localStorage.removeItem('mprtcl-prodv4_wtTest3');

            mParticle._resetForTests(MPConfig);

            mockServer = sinon.createFakeServer();
            mockServer.respondImmediately = true;

            //config default instance
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey1/config?env=0',
                [200, {}, JSON.stringify({ workspaceToken: 'wtTest1' })]
            );
            //config instance 2
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey2/config?env=0',
                [200, {}, JSON.stringify({ workspaceToken: 'wtTest2' })]
            );
            //config instance 3
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey3/config?env=0',
                [200, {}, JSON.stringify({ workspaceToken: 'wtTest3' })]
            );

            // default instance event mock
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey1/Events',
                [200, {}, JSON.stringify({ store: {} })]
            );
            // instance1 event mock
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey2/Events',
                [200, {}, JSON.stringify({ store: {} })]
            );
            // instance2 event mock
            mockServer.respondWith(
                'https://jssdkcdns.mparticle.com/JS/v2/apiKey3/Events',
                [200, {}, JSON.stringify({ store: {} })]
            );

            // identity mock
            mockServer.respondWith(
                urls.identify,
                [
                    200,
                    {},
                    JSON.stringify({ mpid: 'testMPID', is_logged_in: false }),
                ]
            );

            window.mParticle.config.requestConfig = true;
            delete window.mParticle.config.workspaceToken;

            mParticle.init('apiKey1', window.mParticle.config);
            mParticle.init('apiKey2', window.mParticle.config, 'instance2');
            mParticle.init('apiKey3', window.mParticle.config, 'instance3');
        });

        afterEach(function() {
            mockServer.restore();
        });

        it('creates multiple instances with their own cookies', function(done) {
            var cookies1 = window.localStorage.getItem('mprtcl-v4_wtTest1');
            var cookies2 = window.localStorage.getItem('mprtcl-v4_wtTest2');
            var cookies3 = window.localStorage.getItem('mprtcl-v4_wtTest3');

            cookies1.includes('apiKey1').should.equal(true);
            cookies2.includes('apiKey2').should.equal(true);
            cookies3.includes('apiKey3').should.equal(true);

            done();
        });

        it('logs events to their own instances', function(done) {
            mParticle.getInstance('default_instance').logEvent('hi1');
            mParticle.getInstance('instance2').logEvent('hi2');
            mParticle.getInstance('instance3').logEvent('hi3');

            var instance1Events = returnEventForMPInstance(
                mockServer,
                'apiKey1',
                'hi1'
            );
            instance1Events.length.should.equal(1);

            var instance2Events = returnEventForMPInstance(
                mockServer,
                'apiKey2',
                'hi2'
            );
            instance2Events.length.should.equal(1);

            var instance3Events = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'hi3'
            );
            instance3Events.length.should.equal(1);

            var instance1EventsFail1 = returnEventForMPInstance(
                mockServer,
                'apiKey1',
                'hi2'
            );
            instance1EventsFail1.length.should.equal(0);

            var instance1EventsFail2 = returnEventForMPInstance(
                mockServer,
                'apiKey1',
                'hi3'
            );
            instance1EventsFail2.length.should.equal(0);

            var instance2EventsFail1 = returnEventForMPInstance(
                mockServer,
                'apiKey2',
                'hi1'
            );
            instance2EventsFail1.length.should.equal(0);

            var instance2EventsFail2 = returnEventForMPInstance(
                mockServer,
                'apiKey2',
                'hi3'
            );
            instance2EventsFail2.length.should.equal(0);

            var instance3EventsFail1 = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'hi1'
            );
            instance3EventsFail1.length.should.equal(0);

            var instance3EventsFail2 = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'hi2'
            );
            instance3EventsFail2.length.should.equal(0);

            done();
        });

        it('logs purchase events to their own instances', function(done) {
            var prodattr1 = {
                journeyType: 'testjourneytype1',
                eventMetric1: 'metric2',
            };
            var prodattr2 = {
                'hit-att2': 'hit-att2-type',
                prodMetric1: 'metric1',
            };

            var product1 = mParticle.eCommerce.createProduct(
                'iphone',
                'iphoneSKU',
                999,
                1,
                'variant',
                'category',
                'brand',
                1,
                'coupon',
                prodattr1
            );
            var product2 = mParticle.eCommerce.createProduct(
                'galaxy',
                'galaxySKU',
                799,
                1,
                'variant',
                'category',
                'brand',
                1,
                'coupon',
                prodattr2
            );

            var ta = mParticle.eCommerce.createTransactionAttributes(
                'TAid1',
                'aff1',
                'coupon',
                1798,
                10,
                5
            );
            mParticle
                .getInstance()
                .eCommerce.logPurchase(ta, [product1, product2]);

            var instance1Events = returnEventForMPInstance(
                mockServer,
                'apiKey1',
                'eCommerce - Purchase'
            );
            var instance2Events = returnEventForMPInstance(
                mockServer,
                'apiKey2',
                'eCommerce - Purchase'
            );
            var instance3Events = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'eCommerce - Purchase'
            );
            instance1Events.length.should.equal(1);
            instance2Events.length.should.equal(0);
            instance3Events.length.should.equal(0);

            mParticle
                .getInstance('instance2')
                .eCommerce.logPurchase(ta, [product1, product2]);

            instance2Events = returnEventForMPInstance(
                mockServer,
                'apiKey2',
                'eCommerce - Purchase'
            );
            instance3Events = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'eCommerce - Purchase'
            );

            instance2Events.length.should.equal(1);
            instance3Events.length.should.equal(0);

            mParticle
                .getInstance('instance3')
                .eCommerce.logPurchase(ta, [product1, product2]);

            instance3Events = returnEventForMPInstance(
                mockServer,
                'apiKey3',
                'eCommerce - Purchase'
            );

            instance3Events.length.should.equal(1);

            done();
        });
    });
});
