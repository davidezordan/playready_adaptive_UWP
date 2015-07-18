// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
				// TODO: This application has been newly launched. Initialize your application here.
			} else {
				// TODO: This application has been reactivated from suspension.
				// Restore application state here.
			}
			args.setPromise(WinJS.UI.processAll());

			startPlayer();
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	app.start();
})();

var mediaFileName = "http://playready.directtaps.net/smoothstreaming/TTLSS720VC1PR/To_The_Limit_720.ism/Manifest",
    licenseUrl = "http://playready.directtaps.net/win/rightsmanager.asmx";

startPlayer = function () {
    initialiseMediaExtensionManager();

    initialiseMediaProtectionManager(videoElement);

    videoElement.addEventListener("error", onError, false);

    videoElement.src = mediaFileName;
}

initialiseMediaProtectionManager = function (video) {
    var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager();
    mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionContainerGuid"] = "{9A04F079-9840-4286-AB92-E65BE0885F95}"; // Setup the container GUID for CFF

    var cpsystems = new Windows.Foundation.Collections.PropertySet();
    cpsystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Windows.Media.Protection.PlayReady.PlayReadyWinRTTrustedInput"; // PlayReady
    mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = cpsystems;
    mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = '{F4637010-03C3-42CD-B932-B48ADF3A6A54}';

    mediaProtectionManager.addEventListener("servicerequested", onServiceRequested, false);

    video.msSetMediaProtectionManager(mediaProtectionManager);
}

onServiceRequested = function (serviceRequest) {
    var completionNotifier = serviceRequest.completion;

    serviceRequest.request.uri = Windows.Foundation.Uri(licenseUrl);

    serviceRequest.request.beginServiceRequest().then(function () {
        completionNotifier.complete(true);
    }, function error() {
        completionNotifier.complete(false);
    });
}

onError = function (error) {
    var error = videoElement.error;
    //TODO: log error
}

function initialiseMediaExtensionManager() {
    var plugins = new Windows.Media.MediaExtensionManager();
    plugins.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "text/xml");
    plugins.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "application/vnd.ms-sstr+xml");
    plugins.registerByteStreamHandler("Microsoft.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pyv", null);
    plugins.registerByteStreamHandler("Microsoft.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pya", null);
}
