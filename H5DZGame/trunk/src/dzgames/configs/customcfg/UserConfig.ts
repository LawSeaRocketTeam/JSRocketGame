 /**
 * brief:common enums defind
 * Author: wenzuoli
 * Date: 2019/04/02
 */
    export  default class UserConfig{
    /**
     * 程序需要运行的模式
     */
     public static RunningMode={
        /**网页版 */
        web:1,
        /**微信小程序 */
        miniProgram:2, 
        /**安卓APP */
        androidApp:3,
        /**IOS APP */
        iosApp:4
    }
    /**connection control room ID */
    static controlRoomId:number = 0X11041104;
    /**system base room id:GC server */
    static baseRoomId:number = 1;
    /** program running mode:web/miniprogram/android app/ios app e.g.*/
    static runningMode:number = UserConfig.RunningMode.web;
    /**game server address:dev server:172.17.3.180 */
    static serverAddress:string = "172.17.3.180";
    /**game server port;default port:8300 */
    static serverPort:number = 7777;
    //Custom game config into here
    /**enable log print */
    static enableEventLog:boolean = false;
    /**event log submit path. */
    static eventLogSubmitUrl:string = "http://stat2.web.yy.com/c.gif";
    /**resource url */
    static ResourceUrl:string ="https://small.dozengame.com/";
    //e.g.
    //static resourceUrl:string = "http://game.dozengame.com/";
    //Custom game config end.
     
}
export enum LoggerLevel{
    ALL=0,
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
    OFF
}