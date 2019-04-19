
import { dzapp } from "../../../Main";
import HttpGet from "../netmgr/HttpService";
import GameVerify from "../../utils/common";
import UserConfig from "../../configs/customcfg/UserConfig";

 

/** 
 *  @desc : event log handler
 *  @author : wenzuoli
 *  @date : 2018/08/20
 */ 
    /**
     * event log handler
     */
    export default class EventLog{
        constructor(){

        }

        /**
         * button press event.
         * @param btnId the unique button id
         * @param btnFlag the btn flag
         * @param completedCallback request completed callback
         * @param errorCallback request error callback
         * @param sendCallback request send callback
         * @param progressCallback request progress callback
         */
        public static PressButton(btnId:string,btnFlag:string,completedCallback?:Laya.Handler,errorCallback?:Laya.Handler,sendCallback?:Laya.Handler,progressCallback?:Laya.Handler):void{
            let url:string = UserConfig.eventLogSubmitUrl.concat("?");
            url = url.concat("act=webdzmnewtexclient&time="+(new Date().getTime()/1000)+"&uid="+dzapp.Player.mUserId+"&gid=ddz_match&tick=0&sid=0&cid="+btnId+"&type=&cont=&name="+btnFlag+"&url=&ext_1=");
            let httpGet:HttpGet = new HttpGet(url,completedCallback,errorCallback,progressCallback,sendCallback);
            httpGet.send();
        }

        /**
         * report client info to server.
         */
        public static ClientInfoReport(acc:string):void{
            ///目前只开web
            if(GameVerify.isWebMode()){
                let uAgent:string = Laya.Browser.window.navigator.userAgent;
                let n:any = Laya.Browser.window.navigator;
                let browserName:string = EventLog.getBrowserName(n);
                let language:string = EventLog.getLanguage(n);
                let platform:string = EventLog.getPlatform(n);
                let sysname:string = EventLog.getSystemName(n);
                let _url:string = UserConfig.ResourceUrl.concat("wx/Handler.ashx?");
                _url = _url.replace("https","http");
                let _parames:string = "action=clientinforeport&bname="+browserName+"&lan="+language+"&plat="+platform+"&sysname="+sysname+"&acc="+acc;
                let httpGet:HttpGet = new HttpGet(_url.concat(_parames));
                httpGet.send();
            }
        }
 
        private static getPlatform(n:any):string{
            return n.platform;
        }

        /**
         * get user browser language.
         * @param n navigator
         */
        private static getLanguage(n:any){
            return n.language;
        }

        private static getSystemName(n:any){
            let uagent:string = n.userAgent.toString().toLowerCase();
            let hark:string = uagent.substr(uagent.indexOf("(")+1, uagent.indexOf(")") - uagent.indexOf("(")-1);
            let harkArr:string[] = hark.split(";");
            for(let i=0;i<harkArr.length;i++){
                let _tem:string = harkArr[i].toLowerCase();
                if(_tem.indexOf("windows")>-1){
                    return EventLog.getWindowsName(_tem);
                }
                if(_tem.indexOf("iphone os")>-1){
                    return EventLog.getIphoneName(_tem);
                }

                if(_tem.indexOf("android")>-1){
                    return _tem;
                }
            }
        }

        private static getIphoneName(_sys:string):string{
            var hArr = _sys.split(";");
            var _sysName = hArr[1]; 
            return _sysName.replace("cpu", "").replace("like mac os x","");
        }

        private static getWindowsName(_win:string):string{
            switch(_win){
                case "Windows NT 6.4":
                    return "windows 10";
                case "Windows NT 6.3":
                    return "windows 8.1";
                case "Windows NT 6.2":
                    return "windows 8";
                case "Windows NT 6.0":
                    return "Windows vista";
                case "Windows NT 6.1":
                    return "Windows 7";
                case "Windows NT 5.1":
                    return "Windows XP";
                default:
                    return "windows 10";
            }
            return "UN-KNOW WINDOWS";
        }


        private static getBrowserName(n:any):string{
            let uagent:string = n.userAgent.toString().toLowerCase();
            //chrome
            let vendor:string = n.vendor.toString().toLowerCase(); 
            let appname:string = n.appName.toString().toLowerCase();
            let hark:string = uagent.substr(uagent.indexOf("(")+1, uagent.indexOf(")") - uagent.indexOf("(")-1);
            let harkArr:string[] = hark.split(";");
			if(uagent.indexOf("edge")>-1){
                return  EventLog.getShowString(uagent,"edge");
            }

            if(uagent.indexOf("qqbrowser")>-1){
                return EventLog.getShowString(uagent,"qqbrowser"); 
            }
            //预计为google
            if(vendor.indexOf("google")>-1&&harkArr.length==3){
                return EventLog.getShowString(uagent,"chrome"); 
            }
            //预计为360 模仿google
            if(vendor.indexOf("google")>-1&&harkArr.length==2){
                return EventLog.getShowString(uagent,"chrome"); 
            }
            //为firefox
            if(uagent.indexOf("firefox")>-1){
                return EventLog.getShowString(uagent,"firefox");
            }

            //IE
            if(appname.indexOf("microsoft")>-1){
                for(var i=0;i<harkArr.length;i++){
                    if(harkArr[i].toLowerCase().indexOf("msie")>-1){
                        return harkArr[i];
                    }
                }
                return "IE";
            }
            //safari
            if(vendor.indexOf("apple")>-1){
                return EventLog.getShowString(uagent,"safari");
            } 

            return "UN-KNOW";
        }

        private static getShowString(oldStr:string,temStr:string):string{
            let temArr:string[] = oldStr.split(" ");
            for(let i=0;i<temArr.length;i++){
                if(temArr[i].toLowerCase().indexOf(temStr)>-1){
                    return temArr[i];
                }
            }
            return temStr;
        } 
    }