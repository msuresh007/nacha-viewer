//constants enums and Maps file

export  class AchCEMs {

    public static readonly serviceClassCodes: Map<number, string> = new Map([
        [200, 'ACH Entries Mixed Debits and Credits'],
        [220, 'ACH Credits Only'],
        [225, 'ACH Debits Only']
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
