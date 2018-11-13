#!/bin/bash

# Copyright (C) 2017-2018 Barry de Graaff
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see http://www.gnu.org/licenses/.

set -e
# if you want to trace your script uncomment the following line
# set -x


echo "This is a development script, do not run it in prod. Hit enter, if you want to continue running this script, or CTRL+C  to abort";
read dum;

# Make sure only root can run our script
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

TMPFOLDER="$(mktemp -d /tmp/bbb-installer.XXXXXXXX)"
cd $TMPFOLDER
git clone --depth=1 https://github.com/Zimbra-Community/bigbluebutton-zimlet
cd bigbluebutton-zimlet

DB_PWD=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-10};echo;)
DB_HOST=$(su zimbra -c "source ~/bin/zmshutil && zmsetvars && env" | grep "mysql_bind_address" | grep -Ev "antispam" | awk -F "=" '{print $2}')
DB_PORT=$(su zimbra -c "source ~/bin/zmshutil && zmsetvars && env" | grep "mysql_port" | grep -Ev "antispam" | awk -F "=" '{print $2}')

# creating a user, just to make sure we have one (for mysql on CentOS 6, so we can execute the next mysql queries w/o errors)
BBBDBCREATE="$(mktemp /tmp/bbb-dbcreate.XXXXXXXX.sql)"
cat <<EOF > "${BBBDBCREATE}"
CREATE DATABASE bigbluebutton CHARACTER SET 'UTF8'; 
CREATE USER 'bigbluebutton'@'$DB_HOST' IDENTIFIED BY '${DB_PWD}'; 
GRANT ALL PRIVILEGES ON bigbluebutton . * TO 'bigbluebutton'@'$DB_HOST' WITH GRANT OPTION; 
FLUSH PRIVILEGES ; 
EOF

/opt/zimbra/bin/mysql --force < "${BBBDBCREATE}" > /dev/null 2>&1

cat <<EOF > "${BBBDBCREATE}"
DROP USER 'bigbluebutton'@'$DB_HOST';
DROP DATABASE bigbluebutton;
CREATE DATABASE bigbluebutton DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin; 
CREATE USER 'bigbluebutton'@'$DB_HOST' IDENTIFIED BY '${DB_PWD}'; 
GRANT ALL PRIVILEGES ON bigbluebutton . * TO 'bigbluebutton'@'$DB_HOST' WITH GRANT OPTION; 
FLUSH PRIVILEGES ; 
EOF

echo "Creating database and user"
/opt/zimbra/bin/mysql < "${BBBDBCREATE}"

rm -Rf /opt/zimbra/lib/ext/bigbluebutton
mkdir -p /opt/zimbra/lib/ext/bigbluebutton

#here one could optionally support mysql by using jdbc:mysql://, ssl is disabled as this is a local connection
echo "db_connect_string=jdbc:mariadb://$DB_HOST:$DB_PORT/bigbluebutton?user=bigbluebutton&password=$DB_PWD" > /opt/zimbra/lib/ext/bigbluebutton/config.properties

echo "Populating database please wait..."
/opt/zimbra/bin/mysql bigbluebutton < sql/bigbluebutton.sql

cp extension/out/artifacts/BigBlueButton_jar/BigBlueButton.jar /opt/zimbra/lib/ext/bigbluebutton/
cp css/page.css /opt/zimbra/lib/ext/bigbluebutton/

rm -Rf $TMPFOLDER


echo "--------------------------------------------------------------------------------------------------------------
BigBlueButton Extension installed successful

To activate your configuration, run as zimbra user:
su - zimbra -c \"zmmailboxdctl restart\"

WARNING: BigBlueButton database is dropped on Zimbra upgrades!

Please deploy the Zimlet yourself:
    cd /tmp
    wget --no-cache https://github.com/Zimbra-Community/bigbluebutton-zimlet/releases/download/0.0.2/tk_barrydegraaff_bigbluebutton.zip -O /tmp/tk_barrydegraaff_bigbluebutton.zip
    su zimbra
    
    cd /tmp
    zmzimletctl deploy tk_barrydegraaff_bigbluebutton.zip
--------------------------------------------------------------------------------------------------------------
"
