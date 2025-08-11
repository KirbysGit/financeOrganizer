# Parser Utils.
#
# Functions :
#   - 'parse_chase_csv' - Parse Chase CSV File.

# Imports.
import pandas as pd
from io import BytesIO

# Local Imports.
from app.utils.vendor_utils import normalize_vendor
from app.utils.type_label_map import TRANSACTION_TYPE_LABELS

def parse_chase_csv(contents: bytes, filename: str) -> pd.DataFrame:
    # Reads File Contents.
    df = pd.read_csv(BytesIO(contents))

    # Prints Columns.
    print("Raw columns:", df.columns.tolist())  

    # Gets Columns From Contents.
    df.columns = [col.strip() for col in df.columns]

    print("Stripped columns:", df.columns.tolist())

    # Rename Contents To Simpler Names In Data Frame.
    df = df.rename(columns={
        "Transaction Date": "date",
        "Description": "description",
        "Amount": "amount",
        "Type": "type"
    })

    df["type"] = df["type"].str.lower().map(TRANSACTION_TYPE_LABELS).fillna("Other")

    # Set Date To DateTime.
    df["date"] = pd.to_datetime(df["date"])

    # Get Vendor Using Normalize Vendor Func.
    df["vendor"] = df["description"].apply(normalize_vendor)

    # Set File Name from 'filename';
    df["file"] = filename

    # Return Data Frame.
    return df[["date", "vendor", "description", "amount", "type", "file"]]