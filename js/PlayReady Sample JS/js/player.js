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

    //TODO: retrieve service request type from Microsoft.Media.Protection.PlayReady
    if (serviceRequest.request.type !== "c6b344bd-6017-4199-8474-694ac3ec0b3f") {
        serviceRequest.request.uri = Windows.Foundation.Uri(licenseUrl);
    }

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
    plugins.registerByteStreamHandler("Windows.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pyv", null);
    plugins.registerByteStreamHandler("Windows.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pya", null);
}
