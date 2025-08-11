# Vendor Utils For Simplifying Vendor Names.
#
# Functions :
#   - 'normalize_vendor' - Normalize Vendor Names.

# Imports.
import re
import html

# TST*name - Name Until Character That Is Not Space, Then Trim End Space If Exists, Then Capital First Letter, And Lowercase rest
# If else not in vendor rules, Capital First Letters, Lowercase Rest.
# Also, a lot of these names, Just go until # sign then remove after that and just Lowercase the words, with capital letters works.
# Really the goal is just no numbers and clean text. I'll deal with hard cases but can you help me set that up.

VENDOR_RULES = [
    (r"AGAVE AZUL", "Agave Azul"),
    (r"AMC", "AMC"),
    (r"AMAZON", "Amazon"),
    (r"AMAZON MKTPL", "Amazon"),
    (r"Amazon.com", "Amazon"),
    (r"AMZN", "Amazon"),
    (r"ATT", "AT&T"),
    (r"AT&", "AT&T"),
    (r"BAR LOUIE", "Bar Louie"),
    (r"Best Buy", "Best Buy"),
    (r"BEST BUY", "Best Buy"),
    (r"CANVA", "Canva"),
    (r"CHATGPT", "ChatGPT"),
    (r"CHEGG", "Chegg"),
    (r"CHEGG STUDY", "Chegg"),
    (r"CHICK FIL A", "Chick-Fil-A"),
    (r"CHICK-FIL-A", "Chick-Fil-A"),
    (r"CHIPOTLE", "Chipotle"),
    (r"COSTCO GAS", "Costco Gas"),
    (r"COSTCO WHSE", "Costco Wholesale"),
    (r"CURSOR AI", "Cursor AI"),
    (r"CURSOR AI POWERED", "Cursor AI"),
    (r"CVS", "CVS"),
    (r"D'AMICO", "D'Amico & Sons Italian Market & Bakery"),
    (r"DIGITALOCEAN", "Digital Ocean"),
    (r"DON JULIO MEXICAN KI", "Don Julio's Mexican Kitchen"),
    (r"DUKE-ENERGY", "Duke Energy"),
    (r"EXXON", "Exxon"),
    (r"FIRST WATCH", "First Watch"),
    (r"FORTNITE", "Fortnite"),
    (r"GODADDY", "Go Daddy"),
    (r"GOODWILL", "Goodwill"),
    (r"HAWKERS ASIAN", "Hawkers Asian Street Food"),
    (r"HEROKU", "Heroku"),
    (r"HOLLERBACHS", "Hollerbach's Willow Tree Cafe"),
    (r"JEREMIAHS", "Jeremiah's Italian Ice"),
    (r"JLCPCB", "JLCPCB"),
    (r"LA FIT", "LA Fitness"),
    (r"LA FITNESS", "LA Fitness"),
    (r"LAF ", "LA Fitness"),
    (r"LIFT 365", "Lift 365"),
    (r"MACYS", "Macy's"),
    (r"MCDONALD'S", "McDonald's"),
    (r"MENS WEARHOUSE", "Men's Wearhouse"),
    (r"MULTISIM", "Multisim"),
    (r"OPENAI", "ChatGPT"),
    (r"PAT'S LIQUOR", "Pat's Liquor Leaf & Wine"),
    (r"PIGGLY WIGGLY", "Piggly Wiggly"),
    (r"PUBLIX", "Publix"),
    (r"QDOBA", "Qdoba"),
    (r"QUIZLET", "Quizlet"),
    (r"RACETRAC", "RaceTrac"),
    (r"REDBUBBLE", "RedBubble"),
    (r"REG ", "Regal Cinema"),
    (r"Steam Purchase", "Steam"),
    (r"STEAMGAMES", "Steam"),
    (r"ST GEORGE ISL", "St. George Island"),
    (r"SOCIETY OF HISPANIC", "Society Of Hispanic Professional Engineers"),
    (r"TIJUANA FLATS", "Tijuana Flats"),
    (r"THEAVESTWELVE100", "The Aves @ Twelve100"),
    (r"UNIV-OF-C-FLA-BKSTOR", "UCF Bookstore"),
    (r"VERIZON", "Verizon"),
    (r"WAL-MART", "Walmart"),
    (r"WEST END TRADING CO", "West End Trading Company"),
    (r"YELLOW DOG EATS", "Yellow Dog Eats"),
    (r"ZG *", "Zillow"),
]

ACRONYMS = {
    "AI", "APR", "ATM", "AUG", "CO", "CSC", "DEC", "FEB", "IDE", "INC", "JAN",
    "JUL", "JUN", "LA", "LLC", "MAR", "MAY", "NOV", "NY", "OCT", "SEP",
    "SHPE", "TX", "UCF", "USA"
}


PREFIXES = {
    "DKC*", "DNH*", "ETT*", "NIC*-", "NIC*", "PY", "SQ *", "SQ*", "TST*", "WL"
}


def normalize_vendor(description: str) -> str:
    # 1. Decode HTML (e..g. &amp;).
    desc = html.unescape(description).upper().strip()

    # 2. Match known vendor rules.
    for pattern, vendor in VENDOR_RULES:
        if re.search(pattern, desc):
            return vendor
    
    # 3. Strip known prefixes.
    for prefix in PREFIXES:
        if desc.startswith(prefix):
            desc = desc[len(prefix):].strip()
            break

    # 4. Remove trailing '*XYZ123' suffixes
    desc = re.sub(r"\*[A-Z0-9]{4,}$", "", desc).strip()

    # 5. Remove everything after double space or #.
    desc = re.split(r"[#]", desc)[0]
    desc = re.sub(r"\s{2,}", " ", desc).strip()

    # 6. Remove trailing digits.
    desc = re.sub(r"\d+$", "", desc).strip()

    desc = re.sub(r"[^\w\s&\-\'\.]", "", desc)

    # 7. Word cleanup and smart casing.
    words = desc.split()
    cleaned_words = []

    for word in words:
        if word in ACRONYMS:
            cleaned_words.append(word) # keep the full caps
        else:
            cleaned_words.append(word.capitalize())

    name = " ".join(cleaned_words)

    return name;