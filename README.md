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

Deploy the Zimlet

     cd /tmp
     wget --no-cache https://github.com/Zimbra-Community/bigbluebutton-zimlet/releases/download/0.0.4/tk_barrydegraaff_bigbluebutton.zip -O /tmp/tk_barrydegraaff_bigbluebutton.zip
     su zimbra

     cd /tmp
     zmzimletctl deploy tk_barrydegraaff_bigbluebutton.zip

Deploy the Zimlet for Modern UI (Zimbra 9)

See: https://github.com/Zimbra-Community/zimbra-zimlet-bigbluebutton
