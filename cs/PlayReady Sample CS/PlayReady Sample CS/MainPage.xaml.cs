using System;
using Windows.Media;
using Windows.Media.Protection.PlayReady;
using Windows.UI.Xaml.Controls;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace PlayReady_Sample_CS
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        string mediaFileNameClear = "http://mediadl.microsoft.com/mediadl/iisnet/smoothmedia/Experience/BigBuckBunny_720p.ism/Manifest";
        string mediaFileName = "http://playready.directtaps.net/smoothstreaming/TTLSS720VC1PR/To_The_Limit_720.ism/Manifest";
        string licenseUrl = "http://playready.directtaps.net/win/rightsmanager.asmx";

        public MainPage()
        {
            this.InitializeComponent();

            this._initialiseMediaExtensionManager();

            this._initialiseMediaProtectionManager(mediaElement);

            mediaElement.Source = new Uri(mediaFileName);
        }

        private void _initialiseMediaExtensionManager()
        {
            var plugins = new MediaExtensionManager();
            plugins.RegisterByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "text/xml");
            plugins.RegisterByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "application/vnd.ms-sstr+xml");
            plugins.RegisterByteStreamHandler("Windows.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pyv", "");
            plugins.RegisterByteStreamHandler("Windows.Media.Protection.PlayReady.PlayReadyByteStreamHandler", ".pya", "");
        }

        private void _initialiseMediaProtectionManager(MediaElement mediaElement)
        {
            var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager();
            mediaProtectionManager.Properties["Windows.Media.Protection.MediaProtectionContainerGuid"] = "{9A04F079-9840-4286-AB92-E65BE0885F95}"; // Setup the container GUID for CFF

            var cpsystems = new Windows.Foundation.Collections.PropertySet();
            cpsystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Windows.Media.Protection.PlayReady.PlayReadyWinRTTrustedInput"; // PlayReady
            mediaProtectionManager.Properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = cpsystems;
            mediaProtectionManager.Properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";

            mediaElement.ProtectionManager = mediaProtectionManager;

            mediaProtectionManager.ServiceRequested += MediaProtectionManager_ServiceRequested;
        }

        private async void MediaProtectionManager_ServiceRequested(Windows.Media.Protection.MediaProtectionManager sender, Windows.Media.Protection.ServiceRequestedEventArgs e)
        {
            var completionNotifier = e.Completion;

            IPlayReadyServiceRequest request = (IPlayReadyServiceRequest)e.Request;

            //TODO: retrieve service request type from Microsoft.Media.Protection.PlayReady
            if (request.Type != new Guid("c6b344bd-6017-4199-8474-694ac3ec0b3f"))
            {
                request.Uri = new Uri(licenseUrl);
            }

            try
            {
                await request.BeginServiceRequest();

                completionNotifier.Complete(true);
            }
            catch (Exception ex)
            {
                completionNotifier.Complete(false);
            }
        }
    }
}
