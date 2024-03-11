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

### Changing the language of the confirmation email and the join meeting page

The confirmation email and the join meeting page default to english. There is no automatic detection of language. If you want to change to a different language, you have to configure it in the file `/opt/zimbra/lib/ext/bigbluebutton/config.properties`. For example to use french, add the following:

```
language=french
```
The translation will then be read from `/opt/zimbra/lib/ext/bigbluebutton/french.properties` the name of the properties file must match the one configured in the `langauge` property. There is no need to restart mailbox.

If you are adding a new translation make sure to use the unicode conversion tool from: http://itpro.cz/juniconv/

### Modern UI Zimlet

Modern UI Zimlet is also installed via the installer found above, but the sources can be found here for reference:

https://github.com/Zimbra/zimbra-zimlet-bigbluebutton
