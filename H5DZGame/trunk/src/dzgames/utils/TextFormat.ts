import GameVerify from "./common";

String.TrimString = function(oldString:string,length:number,replaceStr:string) {
    let str:string = oldString;
    if(str==null || str==void 0){
        str= "";
    }else if(str.length>length){
        str = str.substring(0,length).concat(replaceStr);
    }
   return str;
}
/**
* format the date to string.
* @param type 1:xxxx年xx月xx日
*/
Date.Format=function(date:Date,type:number,format?:string):string{ 
   if(1==type){
       return date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日";
   }else if(2==type){
       let _str:string = format;
       let _hours:string = date.getHours()<10?"0"+date.getHours():date.getHours().toString();
       let _minutes:string = date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes().toString();
       let _seconds:string = date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds().toString();
       _str=_str.replace("yyyy",date.getFullYear().toString()); 
       _str=_str.replace("yy",date.getFullYear().toString().substr(2));
       _str=_str.replace("mm",(date.getMonth()+1).toString());
       _str=_str.replace("dd",date.getDate().toString());
       _str=_str.replace("h",_hours);
       _str=_str.replace("m",_minutes);
       _str=_str.replace("s",_seconds);
       return _str;
   }
   return date.toUTCString();
}

/**
* keep decimal space.
*/
Number.ToDecimalString=function(num:number,count:number):string{
   return (Number(parseInt((num*Math.pow(10,count)).toString()))/Math.pow(10,count)).toString(); 
}

/**
* include the thousands separator
*/
Number.AddSplitor = function(num:number):string{
   // return num&&num.toString()
   //     .replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {return $1 + ",";});

   var source = String(num).split(".");//按小数点分成2部分
   source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");//只将整数部分进行都好分割
   return source.join(".");//再将小数部分合并进来
}

Number.ToShortString = function(num:number):string{
   if(num < 10000){
       return num.toString();  
   }else if(num<10000*10000){
       return Number(Math.floor(Number(num / 10000) *10).toFixed(1))/10 + "万";
   }else{
       return Number(Math.floor(Number(num / (10000*10000)) *10).toFixed(1))/10 + "亿";
   }
}



