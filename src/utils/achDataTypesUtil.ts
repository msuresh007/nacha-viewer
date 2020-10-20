
export class AchDataTypeUtil {

    //achformattedstring is dollars followed by 2 cents. $$$$$$$$cc
    public static toMoney(strAmount: string): number {
        let strLen = strAmount.length;
        let dollarNums = strAmount.substring(0, strLen - 2);
        let centNums = strAmount.substring(strLen - 2);
        let structuredMoney = dollarNums + "." + centNums;
        return Number(structuredMoney);
    }


}