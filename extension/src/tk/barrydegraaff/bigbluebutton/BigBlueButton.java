/*

Copyright (C) 2018  Barry de Graaff

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

package tk.barrydegraaff.bigbluebutton;


import com.zimbra.client.ZGetInfoResult;
import com.zimbra.client.ZMailbox;
import com.zimbra.common.auth.ZAuthToken;
import com.zimbra.common.mime.MimeConstants;

import javax.mail.internet.MimeMessage;

import com.zimbra.common.mime.shim.JavaMailInternetAddress;
import com.zimbra.common.util.ZimbraLog;
import com.zimbra.common.zmime.ZMimeMessage;
import com.zimbra.cs.extension.ExtensionHttpHandler;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;

import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.sql.*;

import com.zimbra.cs.account.AuthToken;
import com.zimbra.cs.account.Provisioning;
import com.zimbra.cs.account.Account;
import com.zimbra.cs.account.Cos;

import com.zimbra.cs.mailbox.MailSender;
import com.zimbra.cs.mailbox.Mailbox;
import com.zimbra.cs.mailbox.MailboxManager;
import com.zimbra.cs.mailbox.calendar.Util;
import com.zimbra.cs.mime.Mime;
import com.zimbra.cs.util.JMSession;
import org.json.JSONObject;
import org.json.XML;
import org.apache.commons.codec.digest.DigestUtils;

public class BigBlueButton extends ExtensionHttpHandler {

    /**
     * The path under which the handler is registered for an extension.
     * * @return path
     */
    @Override
    public String getPath() {
        return "/bigbluebutton";
    }

    private String BBBSecret;
    private String BBBServerUrl;
    private String DbConnectionString;

    /**
     * Processes HTTP POST requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        resp.getOutputStream().print("tk.barrydegraaff.bigbluebutton is installed. HTTP POST method is not supported");
    }

    /**
     * Processes HTTP GET requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {

        //Get the information of the currently logged in Zimbra user
        String authTokenStr = null;
        Account zimbraCurrentUserAccount = null;
        //Just read a cos value to see if its a valid user
        try {
            Cookie[] cookies = req.getCookies();
            for (int n = 0; n < cookies.length; n++) {
                Cookie cookie = cookies[n];

                if (cookie.getName().equals("ZM_AUTH_TOKEN")) {
                    authTokenStr = cookie.getValue();
                    break;
                }
            }

            if (authTokenStr != null) {
                AuthToken authToken = AuthToken.getAuthToken(authTokenStr);
                Provisioning prov = Provisioning.getInstance();
                zimbraCurrentUserAccount = Provisioning.getInstance().getAccountById(authToken.getAccountId());
                Cos cos = prov.getCOS(zimbraCurrentUserAccount);
                Set<String> allowedDomains = cos.getMultiAttrSet(Provisioning.A_zimbraProxyAllowedDomains);
            } else {
                zimbraCurrentUserAccount = null;
            }

        } catch (Exception ex) {
            //crafted cookie?
            zimbraCurrentUserAccount = null;
        }

        //Get the extension properties
        Properties prop = new Properties();
        try {
            FileInputStream input = new FileInputStream("/opt/zimbra/lib/ext/bigbluebutton/config.properties");
            prop.load(input);
            this.BBBSecret = prop.getProperty("BBBSecret");
            this.BBBServerUrl = prop.getProperty("BBBServerUrl");
            this.DbConnectionString = prop.getProperty("db_connect_string");
            input.close();
        } catch (Exception ex) {
            ex.printStackTrace();
            return;
        }

        //Process get request with parameters
        final Map<String, String> paramsMap = new HashMap<String, String>();
        if (req.getQueryString() != null) {
            String[] params = req.getQueryString().split("&");
            for (String param : params) {
                String[] subParam = param.split("=");
                if (subParam.length == 2) {
                    paramsMap.put(subParam[0], subParam[1]);
                } else {
                    paramsMap.put(subParam[0], "");
                }
            }

            String action = "join";
            try {
                String newAction = paramsMap.get("action");
                if ((newAction != null && (newAction.length() > 1))) {
                    action = newAction;
                }
            } catch (Exception e) {

            }

            switch (action) {
                case "join":
                    //https://zimbradev/service/extension/bigbluebutton?meetingId=d73a55f1-f2aa-45fd-897f-94967a9cbf58  (point to form with meetingId pre-filled)
                    //https://zimbradev/service/extension/bigbluebutton?meetingId=d73a55f1-f2aa-45fd-897f-94967a9cbf58&name=Barry&password=up3lyhMWi&action=join (redirects to bbb after the form)
                    try {
                        //Make sure we have a GUID meetingId (prevents SQL injection)
                        UUID isValid = UUID.fromString(paramsMap.get("meetingId"));
                        if (isValid.toString().length() > 1) {
                            String db_connect_string = this.DbConnectionString;
                            Connection dbconnection = DriverManager.getConnection(db_connect_string);
                            PreparedStatement stmt = dbconnection.prepareStatement("SELECT * FROM meetings WHERE meetingID = ?");
                            stmt.setString(1, paramsMap.get("meetingId"));
                            ResultSet meeting = stmt.executeQuery();
                            Boolean meetingFound = false;
                            //Should always run just once, as meetingId is PK in SQL.
                            while (meeting.next()) {
                                meetingFound = true;
                                bbbRequest("create", "meetingID=" + meeting.getString("meetingId") + "&attendeePW=" + meeting.getString("attendeePW") + "&moderatorPW=" + meeting.getString("moderatorPW"));

                                try {
                                    //req.getParameter throws nullpointer when not specified, then the else block would not get called. To-do rewrite
                                    if (
                                            (req.getParameter("name").length() > 0) &&
                                                    (req.getParameter("password").length() > 0)
                                    ) {
                                        String joinUrl = bbbRequest("join", "meetingID=" + meeting.getString("meetingId") + "&password=" + req.getParameter("password") + "&fullName=" + req.getParameter("name").replaceAll(" ", "+"));
                                        resp.setCharacterEncoding("UTF-8");
                                        resp.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                                        resp.setHeader("Location", joinUrl);
                                    } else {
                                        showPage(resp, meeting.getString("meetingId"));
                                    }
                                } catch (Exception e) {
                                    e.printStackTrace();
                                    dbconnection.close();
                                    showPage(resp, meeting.getString("meetingId"));
                                }
                            }
                            dbconnection.close();
                            if (!meetingFound) {
                                showPage(resp, "");
                            }
                        } else {
                            showPage(resp, "");
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                        showPage(resp, "");
                    }

                    break;
                case "getNewMeetingId":
                    //api call: https://zimbradev/service/extension/bigbluebutton?action=getNewMeetingId&attendeePassword=1234&moderatorPassword=2345
                    try {
                        //This is an authenticated Zimbra user, allow creation of meeting
                        if (zimbraCurrentUserAccount != null) {
                            final String newMeetingId = java.util.UUID.randomUUID().toString();
                            String db_connect_string = this.DbConnectionString;
                            Connection connection = DriverManager.getConnection(db_connect_string);

                            if (!connection.isClosed()) {
                                PreparedStatement stmt = connection.prepareStatement("INSERT INTO meetings VALUES (?,?,?,?,NOW())");
                                //Perhaps we should wrap uriDecode() around the parameters to decode them? Seems Java already did at this point
                                stmt.setString(1, zimbraCurrentUserAccount.getName());
                                stmt.setString(2, newMeetingId);
                                stmt.setString(3, req.getParameter("attendeePassword"));
                                stmt.setString(4, req.getParameter("moderatorPassword"));
                                stmt.executeQuery();

                                sendConfirmation(zimbraCurrentUserAccount, newMeetingId, req.getParameter("attendeePassword"), req.getParameter("moderatorPassword"));
                            }
                            connection.close();
                            responseWriter(resp, newMeetingId);
                        } else {
                            responseWriter(resp, "Error getting new meeting (1).");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        responseWriter(resp, "Error getting new meeting (2).");
                    }
                    break;
                default:
                    showPage(resp, "");
                    break;

            }
            return;

        } else {
            //Show the default response
            showPage(resp, "");
            return;
        }
    }

    private void responseWriter(HttpServletResponse resp, String message) {
        try {

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setHeader("Content-Type", "text/html");
            resp.getWriter().write(message);

            resp.getWriter().flush();
            resp.getWriter().close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String bbbRequest(String action, String queryString) {
        try {

            String checksum = DigestUtils.sha1Hex(action + queryString + this.BBBSecret);

            StringBuilder result = new StringBuilder();
            URL url = new URL(this.BBBServerUrl + action + "?" + queryString + "&checksum=" + checksum);
            if ("join".equals(action)) {
                return url.toString();
            }
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = rd.readLine()) != null) {
                result.append(line);
            }
            rd.close();
            conn.disconnect();

            JSONObject xmlJSONObj = XML.toJSONObject(result.toString());
            return xmlJSONObj.toString(4);

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    private void showPage(HttpServletResponse resp, String meetingID) throws IOException, ServletException {
        try {

            resp.setHeader("Content-Type", "text/html");
            String message = "<form method=\"GET\" action=\"/service/extension/bigbluebutton\"><table>\n" +
                    "<tr><td>Meeting ID:</td><td><input name=\"meetingId\" placeholder=\"Meeting ID\" value=\"" + meetingID + "\"></td></tr>\n" +
                    "<tr><td>Your name:</td><td><input name=\"name\" placeholder=\"Your name\"></td></tr>\n" +
                    "<tr><td>Password:</td><td><input name=\"password\" placeholder=\"Password\"><input type=\"hidden\" name=\"action\" placeholder=\"action\" value=\"join\"></td></tr>\n" +
                    "<tr><td></td><td><input type=\"Submit\"></td></tr>\n" +
                    "</table></form>";

            resp.getOutputStream().print("<!DOCTYPE HTML>\r\n<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><style>");

            byte[] encoded = Files.readAllBytes(Paths.get("/opt/zimbra/lib/ext/bigbluebutton/page.css"));
            resp.getOutputStream().print(new String(encoded, StandardCharsets.UTF_8));
            resp.getOutputStream().print("</style><title>Zimbra BigBlueButton Meeting</title>");
            if (!"".equals(message)) {
                message = message.concat("<br><br>");
            }
            resp.getOutputStream().print("</head><body><div class=\"main\"><div class=\"logo\"></div><h1>Join Meeting</h1><p>" + message + "</p>");
        } catch (
                Exception ex) {
            ex.printStackTrace();
        }
    }

    private void sendConfirmation(Account account, String meetingId, String attendeePassword, String moderatorPassword) {
        try {
            MimeMessage mm = new Mime.FixedMimeMessage(JMSession.getSmtpSession(account));

            String to = account.getName();

            mm.setRecipient(javax.mail.Message.RecipientType.TO, new JavaMailInternetAddress(to));
            //mm.setText("To join the Meeting Online go to:\\r\\n[meetinglink]\\r\\n\\r\\nYou can use the following password:\\r\\n[password]\\r\\n", MimeConstants.P_CHARSET_UTF8);
            mm.setContent("You have just scheduled a new BigBlueButton meeting.<br><br><a href=\"/service/extension/bigbluebutton?meetingId="+meetingId+"\">Click here to join Online Meeting</a><br><br>You can use the following moderator password: <b>"+moderatorPassword+"</b><br>And share the following password for your attendees: <b>"+attendeePassword+"</b>",MimeConstants.CT_TEXT_HTML);
            mm.setSubject("BigBlueButton meeting confirmation");
            mm.saveChanges();

            Mailbox mbox = MailboxManager.getInstance().getMailboxByAccount(account);
            MailSender mailSender = mbox.getMailSender();

            mailSender.setSaveToSent(false);
            mailSender.sendMimeMessage(null, mbox, mm);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}