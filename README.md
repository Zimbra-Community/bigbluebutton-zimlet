Zimbra BigBlueButton Integration
==========

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

 
