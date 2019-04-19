import { LoggerLevel } from "../../configs/customcfg/UserConfig";

/**
 * @desc : log handler.
 * @author: Wenzuoli
 * @Date: 2019/04/08
 */ 
export default class Logger{
        constructor(){
        }
        /**print log level:default only print error log */
        private _level:LoggerLevel = LoggerLevel.ERROR;
        /**setup the logger print level. */
        public set Level(level:LoggerLevel){
            this._level = level;
        }
        /**print debug log */
        public debug(...args:any[]):void{
            this.writeLog(LoggerLevel.DEBUG,args);
        }
        /**print info log */
        public info(...args:any[]):void{
            this.writeLog(LoggerLevel.INFO,args);
        }
        /**print warn log:will be highlighted */
        public warn(...args:any[]):void {
            this.writeLog(LoggerLevel.WARN,args);
        }
        /**print warn log:will be highlighted */
        public error(...args:any[]):void {
            this.writeLog(LoggerLevel.ERROR,args);
        }
         /**print warn log:will be highlighted */
        public fatal(...args:any[]):void {
            this.writeLog(LoggerLevel.FATAL,args);
        }

        private writeLog(level:number,args:any[]):void{
            if(this._level>=level){
                switch(level){
                    case LoggerLevel.ERROR:
                    case LoggerLevel.WARN:
                    case LoggerLevel.FATAL:
                        console.error(...args);
                    break;
                    default:
                        console.log(...args);
                    break;
                }
                
            }
            //console[DZGame.UserConfig.LoggerLevel[level].toLowerCase()](...args);
        }
    } 
