import pandas as pd
from io import BytesIO

def parse_chase_csv(contents: bytes) -> pd.DataFrame:
    df = pd.read_csv(BytesIO(contents))

    print("Raw columns:", df.columns.tolist())  

    df.columns = [col.strip() for col in df.columns]

    print("Stripped columns:", df.columns.tolist())

    df = df.rename(columns={
        "Transaction Date": "date",
        "Description": "description",
        "Amount": "amount",
        "Type": "type"
    })

    df["date"] = pd.to_datetime(df["date"])
    return df[["date", "description", "amount", "type"]]