
export class ArrayUtil {

    public static isFirstElement(elementIndex:number, arrayLength:number):boolean {
        return (elementIndex === 0);
    }

    public static isLastElement(elementIndex:number, arrayLength:number):boolean {
        return (elementIndex+1 === arrayLength);
    }

    public static isOneOfTheMiddleElements(elementIndex:number, arrayLength:number):boolean {
        return ((elementIndex > 0) &&
            (elementIndex+1 < arrayLength));
    }
}
