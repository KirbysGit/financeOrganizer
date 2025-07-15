# Imports.

# -------------------------------------------------------- Transaction Type Labels.
TRANSACTION_TYPE_LABELS = {
    "sale": "Purchase",
    "payment": "Credit Card Payment",
    "refund": "Refund / Reimbursement",
    "fee": "Service / Late Fee",
    "interest": "Interest Charge",
    "adjustment": "Account Adjustment",
    "transfer": "Transfer",
    "other": "Other",
}

# -------------------------------------------------------- Negative Types.
NEGATIVE_TYPES = {"sale", "fee", "interest", "adjustment"}
POSITIVE_TYPES = {"refund", "payment", "transfer"}