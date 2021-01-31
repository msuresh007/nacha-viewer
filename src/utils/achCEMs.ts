//constants enums and Maps file

export  class AchCEMs {

    public static readonly serviceClassCodes: Map<number, string> = new Map([
        [200, 'ACH Entries Mixed Debits and Credits'],
        [220, 'ACH Credits Only'],
        [225, 'ACH Debits Only']
      ]);

    public static readonly transactionCodes: Map<number, string> = new Map([
        [22, 'Deposit destined for a Checking Account'],
        [23, 'Prenotification for a checking credit'],
        [24, 'Zero dollar with remittance into Checking Account'],
        [27, 'Debit destined for a Checking Account'],
        [28, 'Prenotification for a checking debit'],
        [29, 'Zero dollar with remittance into Checking Account'],
        [32, 'Deposit destined for a Savings Account'],
        [33, 'Prenotification for a savings credit'],
        [34, 'Zero dollar with remittance into Savings Account'],
        [37, 'Debit destined for a Savings Account'],
        [38, 'Prenotification for a Savings debit'],
        [39, 'Zero dollar with remittance into Savings Account']
      ]); 
}

export enum RecordType {
    fileHeader          = "1",
    batchHeader         = "5",
    entryDetail         = "6",
    entryDetailAddenda  = "7",
    batchControl        = "8",
    fileControl         = "9"
}
