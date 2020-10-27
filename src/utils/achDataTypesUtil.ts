
export class AchDataTypeUtil {

    //achformattedstring is dollars followed by 2 cents. $$$$$$$$cc
    public static toMoney(strAmount: string): number | string {
        let strLen = strAmount.length;
        let dollarNums = strAmount.substring(0, strLen - 2);
        let centNums = strAmount.substring(strLen - 2);
        let structuredMoney = dollarNums + "." + centNums;
        let numMoney = Number(structuredMoney);

        if (isNaN(numMoney)) {
            return "Invalid Money value - " + strAmount;
        }

        return numMoney;
        
    }

    //ach formatted date will be YYMMDD
    public static toDate(strDate: string): Date | string {

        let yyNum = Number(strDate.substring(0, 2));
        let mmNum = Number(strDate.substring(2, 4));
        let ddNum = Number(strDate.substring(5));
        if (isNaN(yyNum) || isNaN(mmNum) || isNaN(ddNum)) {
            return "Invalid Date Value - " + strDate;
        }
        
        return new Date(yyNum, mmNum, ddNum);
    }

}