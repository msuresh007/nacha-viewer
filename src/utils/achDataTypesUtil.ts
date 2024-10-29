
export class AchDataTypeUtil {

    //achformattedstring is dollars followed by 2 cents. $$$$$$$$cc
    public static toMoney(strAmount: string, includeDollarSymbol: boolean = true): number | string {
        let strLen = strAmount.length;
        let dollarNums = strAmount.substring(0, strLen - 2);
        let centNums = strAmount.substring(strLen - 2);
        let structuredMoney = dollarNums + "." + centNums;
        let numMoney = Number(structuredMoney);

        if (isNaN(numMoney)) {
            return "Invalid Money value - " + strAmount;
        }

        let dollarSymbol = ''
        if (includeDollarSymbol == true) {
            //dollarSymbol = '$ ';
            dollarSymbol = ''; // for now always removing the $ symbol till we get clear differentiation between dollar based amounts and non-dollar based ones
        }

        return dollarSymbol + numMoney.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        
    }

    //ach formatted date will be YYMMDD
    public static toDate(strDate: string): Date | string {

        let yyNum = Number(strDate.substring(0, 2));
        let mmNum = Number(strDate.substring(2, 4));
        let ddNum = Number(strDate.substring(4));
        if (isNaN(yyNum) || isNaN(mmNum) || isNaN(ddNum)) {
            return "Invalid Date Value - " + strDate;
        }
        
        //let prefixedWith20 = 2000 + yyNum;
        //return new Date(prefixedWith20, mmNum, ddNum).toLocaleDateString();
        return `${mmNum}/${ddNum}/${yyNum}`;
    }

    //ach formatted time wil be HHMM (24 hour format)
    public static toTime(strTime: string): Date | string {

        let hhNum = Number(strTime.substring(0, 2));
        let mmNum = Number(strTime.substring(2, 4));
        if (isNaN(hhNum) || isNaN(mmNum) ) {
            return "Invalid Time Value - " + strTime;
        }

        let date: Date = new Date();  
        date.setHours(hhNum);
        date.setMinutes(mmNum);
        date.setSeconds(0);
        
        return date.toLocaleTimeString();
    }
}