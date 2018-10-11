/**
This file is part of the BigBlueButton Zimlet
Copyright (C) 2014-2018  Barry de Graaff

Bugs and feedback: https://github.com/Zimbra-Community/bigbluebutton/issues

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.

*/
//Constructor
function tk_barrydegraaff_bigbluebutton_HandlerObject() {
};


tk_barrydegraaff_bigbluebutton_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_bigbluebutton_HandlerObject.prototype.constructor = tk_barrydegraaff_bigbluebutton_HandlerObject;

tk_barrydegraaff_bigbluebutton_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_bigbluebutton_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var BigBlueButton = tk_barrydegraaff_bigbluebutton_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 */
BigBlueButton.prototype.init = function() {
   try {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;   
   zimletInstance.settings = [];   
    //Set default value
    if(!this.getUserProperty("bigbluebutton_moderator_password"))
    {
       zimletInstance.settings['bigbluebutton_moderator_password'] = BigBlueButton.prototype.pwgen();
       this.setUserProperty("bigbluebutton_moderator_password", zimletInstance.settings['bigbluebutton_moderator_password'], true);   
    }
    else
    {
       zimletInstance.settings['bigbluebutton_moderator_password'] = this.getUserProperty("bigbluebutton_moderator_password");   
    }   
   
    //Set default value
    if(!this.getUserProperty("bigbluebutton_attendee_password"))
    {
       zimletInstance.settings['bigbluebutton_attendee_password'] = BigBlueButton.prototype.pwgen();
       this.setUserProperty("bigbluebutton_attendee_password", zimletInstance.settings['bigbluebutton_attendee_password'], true);   
    }
    else
    {
       zimletInstance.settings['bigbluebutton_attendee_password'] = this.getUserProperty("bigbluebutton_attendee_password");   
    } 
   
   } catch (err)
   {console.log('BigBlueButton zimlet init error: '+err);}
};

/** This method is called when a message is viewed in Zimbra. 
 * See {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html#onMsgView}.
 * @param {ZmMailMsg} msg - an email in {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmMailMsg.html ZmMailMsg} format
 * @param {ZmMailMsg} oldMsg - unused
 * @param {ZmMailMsgView} msgView - the current ZmMailMsgView (upstream documentation needed)
 * */
BigBlueButton.prototype.onMsgView = function (msg, oldMsg, msgView) {
   try 
   {
      var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;   
   } catch (err)
   {
      console.log('BigBlueButton zimlet onMsgView error: '+err);
   }
};   

/** This method gets called by the Zimlet framework when single-click is performed.
 */
BigBlueButton.prototype.singleClicked =
function() {  
   this.prefDialog();
};

/** This method gets called by the Zimlet framework when double-click is performed.
 */
BigBlueButton.prototype.doubleClicked =
function() {
   this.prefDialog();
};

/** This method shows a `ZmToast` status message. That fades in and out in a few seconds.
 * @param {string} text - the message to display
 * @param {string} type - the style of the message e.g. ZmStatusView.LEVEL_INFO, ZmStatusView.LEVEL_WARNING, ZmStatusView.LEVEL_CRITICAL
 * */
BigBlueButton.prototype.status = function(text, type) {
   var transitions = [ ZmToast.FADE_IN, ZmToast.PAUSE, ZmToast.PAUSE, ZmToast.FADE_OUT ];
   appCtxt.getAppController().setStatusMsg(text, type, null, transitions);
}; 

BigBlueButton.prototype.prefDialog =
function() {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;
   zimletInstance._dialog = new ZmDialog( { title:zimletInstance.getMessage('BigBlueButtonZimlet_label'), parent:this.getShell(), standardButtons:[DwtDialog.CANCEL_BUTTON,DwtDialog.OK_BUTTON], disposeOnPopDown:true } );   
   
   zimletInstance._dialog.setContent(
   '<div style="width:450px; height:160px;">'+
   '<img style="margin:10px;margin-left:0px;" src="'+zimletInstance.getResource("bigbluebutton-logo.png")+'"><br>'+   
   zimletInstance.getMessage('BigBlueButtonZimlet_default_passwords')+
   '<br><br><table>' +
   '<tr><td>'+zimletInstance.getMessage('BigBlueButtonZimlet_moderator_password')+':</td><td><input id="bigbluebutton_moderator_password" value="'+zimletInstance.settings['bigbluebutton_moderator_password']+'"></td></tr>' +
   '<tr><td>'+zimletInstance.getMessage('BigBlueButtonZimlet_attendee_password')+':</td><td><input id="bigbluebutton_attendee_password" value="'+zimletInstance.settings['bigbluebutton_attendee_password']+'"></td></tr>' +
   '</table></div>'
   );
   
   zimletInstance._dialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(zimletInstance, zimletInstance.prefSaveBtn));
   zimletInstance._dialog.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(zimletInstance, zimletInstance._cancelBtn));
   document.getElementById(zimletInstance._dialog.__internalId+'_handle').style.backgroundColor = '#eeeeee';
   document.getElementById(zimletInstance._dialog.__internalId+'_title').style.textAlign = 'center';
   
   zimletInstance._dialog.popup();  
};   

BigBlueButton.prototype.prefSaveBtn = function() 
{
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;
   this.setUserProperty("bigbluebutton_moderator_password", document.getElementById('bigbluebutton_moderator_password').value, false);
   this.setUserProperty("bigbluebutton_attendee_password", document.getElementById('bigbluebutton_attendee_password').value, true);
   zimletInstance.settings['bigbluebutton_moderator_password']=document.getElementById('bigbluebutton_moderator_password').value;
   zimletInstance.settings['bigbluebutton_attendee_password']=document.getElementById('bigbluebutton_attendee_password').value;
   BigBlueButton.prototype._cancelBtn();
};

/** This method is called when the dialog "CANCEL" button is clicked.
 * It pops-down the current dialog.
 */
BigBlueButton.prototype._cancelBtn =
function() {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;
   try{
      zimletInstance._dialog.setContent('');
      zimletInstance._dialog.popdown();
   }
   catch (err) {}
};

/**
 * Adds button to Calendar toolbar.
 */
BigBlueButton.prototype.initializeToolbar = function(app, toolbar, controller, viewId) {
	var viewType = appCtxt.getViewTypeFromId(viewId);
	if (viewType == ZmId.VIEW_APPOINTMENT) {
		this._initCalendarBigBlueButtonToolbar(toolbar, controller);
	}
};   

/**
 * Initiates calendar toolbar.
 *
 * @param {ZmToolbar} toolbar	 the Zimbra toolbar
 * @param {ZmCalController} controller  the Zimbra calendar controller
 */
BigBlueButton.prototype._initCalendarBigBlueButtonToolbar = function(toolbar, controller) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;
	if (!toolbar.getButton("BIGBLUEBUTTON2")) {
		//ZmMsg.sforceAdd = this.getMessage("BigBlueButtonZimlet_saveAsBigBlueButton");
		var buttonIndex = toolbar.opList.length + 1;
		var button = toolbar.createOp("BIGBLUEBUTTON2", {image:"tk_barrydegraaff_bigbluebutton-panelIcon", text:"BigBlueButton", index:buttonIndex});
		toolbar.addOp("BIGBLUEBUTTON2", buttonIndex);

		var menu = new ZmPopupMenu(button); //create menu
		button.setMenu(menu);//add menu to button
		button.noMenuBar = true;
		button.removeAllListeners();
		button.removeDropDownSelectionListener();

      var mi = menu.createMenuItem(Dwt.getNextId(), {image:"tk_barrydegraaff_bigbluebutton-panelIcon", text:(zimletInstance.getMessage('BigBlueButtonZimlet_joinHostMeeting').indexOf('???') == 0) ? 'Join or Host Meeting' : zimletInstance.getMessage('BigBlueButtonZimlet_joinHostMeeting')});
	   mi.addSelectionListener(new AjxListener(this, this._BigBlueButtonHandler, [controller]));

      var mi = menu.createMenuItem(Dwt.getNextId(), {image:"Add", text:(zimletInstance.getMessage('BigBlueButtonZimlet_addMeetingDetails').indexOf('???') == 0) ? 'Add BigBlueButton information to the Appointment' : zimletInstance.getMessage('BigBlueButtonZimlet_addMeetingDetails')});    
	   mi.addSelectionListener(new AjxListener(this, this._AddBigBlueButtonLinkHandler));

      var mi = menu.createMenuItem(Dwt.getNextId(), {image:"Preferences", text:ZmMsg.preferences});    
	   mi.addSelectionListener(new AjxListener(this, this.prefDialog));
	}
};

BigBlueButton.prototype._AddBigBlueButtonLinkHandler = function() {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject;

   var currentContent = appCtxt.getCurrentController()._composeView.getHtmlEditor().getContent();
   var matches = currentContent.match(/(http.*)([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
   if(matches)
   {
      //already have meeting details
      return;
   }
   
   var controller = appCtxt.getCurrentController();
   zimletInstance._dialog = new ZmDialog( { title:zimletInstance.getMessage('BigBlueButtonZimlet_label'), parent:zimletInstance.getShell(), standardButtons:[DwtDialog.OK_BUTTON,DwtDialog.CANCEL_BUTTON], disposeOnPopDown:true } );   
   
   zimletInstance._dialog.setContent(
   '<div style="width:450px; height:240px;">'+
   '<img style="margin:10px;margin-left:0px;" src="'+zimletInstance.getResource("bigbluebutton-logo.png")+'"><br>'+   
   zimletInstance.getMessage('BigBlueButtonZimlet_default_passwords')+
   '<br><br><table>' +
   '<tr><td>'+zimletInstance.getMessage('BigBlueButtonZimlet_moderator_password')+':</td><td><input id="bigbluebutton_moderator_password" value="'+zimletInstance.settings['bigbluebutton_moderator_password']+'"></td></tr>' +
   '<tr><td>'+zimletInstance.getMessage('BigBlueButtonZimlet_attendee_password')+':</td><td><input id="bigbluebutton_attendee_password" value="'+zimletInstance.settings['bigbluebutton_attendee_password']+'"></td></tr>' +
   '<tr><td>&nbsp;</td><td></td></tr><tr><td>'+zimletInstance.getMessage('BigBlueButtonZimlet_set_defaults')+':</td><td><input type="checkbox" id="bigbluebutton_set_defaults"></td></tr>' +
   '</table></div>'
   );
   
   zimletInstance._dialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(zimletInstance, zimletInstance._AddBigBlueButtonLinkInserter));
   zimletInstance._dialog.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(zimletInstance, zimletInstance._cancelBtn));
   zimletInstance._dialog.setEnterListener(new AjxListener(zimletInstance, zimletInstance._AddBigBlueButtonLinkInserter));   

   document.getElementById(zimletInstance._dialog.__internalId+'_handle').style.backgroundColor = '#eeeeee';
   document.getElementById(zimletInstance._dialog.__internalId+'_title').style.textAlign = 'center';
   
   zimletInstance._dialog.popup(); 
};

BigBlueButton.prototype._AddBigBlueButtonLinkInserter = function() {  
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_bigbluebutton').handlerObject; 
   var controller = appCtxt.getCurrentController();
   
   if(document.getElementById('bigbluebutton_set_defaults').checked)
   {
      zimletInstance.setUserProperty("bigbluebutton_moderator_password", document.getElementById('bigbluebutton_moderator_password').value, false);
      zimletInstance.setUserProperty("bigbluebutton_attendee_password", document.getElementById('bigbluebutton_attendee_password').value, true);
      zimletInstance.settings['bigbluebutton_moderator_password']=document.getElementById('bigbluebutton_moderator_password').value;
      zimletInstance.settings['bigbluebutton_attendee_password']=document.getElementById('bigbluebutton_attendee_password').value;
   }
   
   if(document.getElementById('bigbluebutton_moderator_password').value && document.getElementById('bigbluebutton_attendee_password').value)
   {
      var xhr = new XMLHttpRequest();
      xhr.open( "GET", '/service/extension/bigbluebutton?action=getNewMeetingId&attendeePassword='+document.getElementById('bigbluebutton_attendee_password').value+'&moderatorPassword='+document.getElementById('bigbluebutton_moderator_password').value, true );
      xhr.send( );
      xhr.onreadystatechange = function (oEvent) 
      {  
         var meetingId = "";
         if (xhr.readyState === 4) 
         {  
            if (xhr.status === 200) 
            {
               try
               {
                  meetingId = xhr.response;
               }
               catch(err)
               {
               }
            }

            if(meetingId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i))
            {
               var message = zimletInstance.getMessage('BigBlueButtonZimlet_Meeting_Message');   
               var editorType = "HTML";
               if (controller._composeView.getComposeMode() != "text/html") {
                  editorType = "PLAIN_TEXT";
               }
               var currentContent = controller._composeView.getHtmlEditor().getContent();
               var newContent = [];
         
               var url = [];
               var i = 0;
               var proto = location.protocol;
               var port = Number(location.port);
               url[i++] = proto;
               url[i++] = "//";
               url[i++] = location.hostname;
               if (port && ((proto == ZmSetting.PROTO_HTTP && port != ZmSetting.HTTP_DEFAULT_PORT) 
                  || (proto == ZmSetting.PROTO_HTTPS && port != ZmSetting.HTTPS_DEFAULT_PORT))) {
                  url[i++] = ":";
                  url[i++] = port;
               }               
               
               if (editorType == "HTML") {
                  newContent.push(currentContent.substr(0, currentContent.lastIndexOf("</body></html>")));
                  newContent.push(message
                     .replace(/\r\n/g,'<br>')
                     .replace('[meetinglink]','<a href="'+url.join("")+'/service/extension/bigbluebutton?meetingId='+meetingId+'" target="_blank">'+url.join("")+'/service/extension/bigbluebutton?meetingId='+meetingId+ '</a>')
                     .replace('[password]',document.getElementById('bigbluebutton_attendee_password').value)
                  );
                  
                  newContent.push("</body></html>");
               }
               else {
                  newContent.push(currentContent + '\r\n\r\n' +message
                     .replace('[meetinglink]',url.join("")+'/service/extension/bigbluebutton?meetingId='+meetingId)
                     .replace('[password]',document.getElementById('bigbluebutton_attendee_password').value)
                  );
               }
               controller._composeView.getHtmlEditor().setContent(newContent.join(""));
               zimletInstance._cancelBtn();
            }  
            else
            {
               BigBlueButton.prototype.status(ZmMsg.errorApplication, ZmStatusView.LEVEL_CRITICAL);
            }   
         } 
      }      
   }
   else
   {
      BigBlueButton.prototype.status(zimletInstance.getMessage('BigBlueButtonZimlet_password_required'), ZmStatusView.LEVEL_WARNING);
   }  
};

BigBlueButton.prototype._BigBlueButtonHandler = function() {
   var currentContent = appCtxt.getCurrentController()._composeView.getHtmlEditor().getContent();
   var matches = currentContent.match(/(http.*)([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
   if(matches)
   {
      matches[0] = matches[0].replace('"', " ");
      matches = matches[0].split(" ");
      window.open(matches[0]);
   }
   else
   {
      BigBlueButton.prototype._AddBigBlueButtonLinkHandler();
   }
};

BigBlueButton.prototype.pwgen =
function ()
{
   chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
   pass = "";

   for(x=0;x<8;x++)
   {
      i = Math.floor(Math.random() * 62);
      pass += chars.charAt(i);
   }
   return pass;
};
