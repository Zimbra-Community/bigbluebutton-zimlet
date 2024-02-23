Zimbra BigBlueButton Integration
==========

![Zimbra BBB](https://github.com/Zimbra-Community/bigbluebutton-zimlet/raw/master/docu/screen1.png)

![Zimbra BBB](https://github.com/Zimbra-Community/bigbluebutton-zimlet/raw/master/docu/screen2.png)

![Zimbra BBB](https://github.com/Zimbra-Community/bigbluebutton-zimlet/raw/master/docu/screen3.png)

![Zimbra BBB](https://github.com/Zimbra-Community/bigbluebutton-zimlet/raw/master/docu/screen4.png)

### Install prerequisites
  - Zimbra 8.8 and above
  
### Installing
Use the automated installer:

    wget https://raw.githubusercontent.com/Zimbra-Community/bigbluebutton-zimlet/master/bbb-installer.sh -O /tmp/bbb-installer.sh
    chmod +rx /tmp/bbb-installer.sh
    /tmp/bbb-installer.sh

After running the installer configure your BigBlueButton server and API secret like so:

     echo  "BBBSecret=your-secret-here
     BBBServerUrl=http://your-domain-here/bigbluebutton/api/" >> /opt/zimbra/lib/ext/bigbluebutton/config.properties



### Modern UI Zimlet

Modern UI Zimlet is also installed via the installer found above, but the sources can be found here for reference:

https://github.com/Zimbra-Community/zimbra-zimlet-bigbluebutton
