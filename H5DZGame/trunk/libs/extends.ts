/**
 * @Brief use for extends the object method.
 * @Author wenzuoli
 * @Date 2018/05/31
 */
declare class StringConstructor{
    /**
     * 截取字符串并用replaceStr来隐藏多余的字符
     * @param length 目标长度
     * @param replaceStr 截取后多余部分用什么字符来显示
     */
    TrimString(oldStr:string,length:number,replaceStr:string):string;
} 

/**
 * @Brief format the date.
 * @Author wenzuoli
 * @Date 2018/06/19 
 */
declare class DateConstructor{
    /**
     * format the date to string.
     * @param date 时间
     * @param type 1:xxxx年xx月xx日 2 自定义
     */
    Format(date:Date,type:number,format?:string):string;
} 


/**
 * @Brief Number to string extends.
 * @Author wenzuoli
 * @Date 2018/07/26 
 */
declare class NumberConstructor{
    /**
     * keep decimal space.
     */
    ToDecimalString(num:number,count:number):string;
    /**
     * include the thousands separator
     */
    AddSplitor(num:number):string;

    /**
     * to a short display string as e.g: xxx万、
     * @param num amt
     */
    ToShortString(num:number):string;
}


declare function require(params:string):any;


//  declare module Laya{
//   class MiniAdpterConstructor{
//      getmyname(num:number):void; 
//     }
// }
 