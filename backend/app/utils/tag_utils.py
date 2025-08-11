# Tag Utils.
#
# Functions :
#   - 'create_default_tags' - Create Default Tags For A New User.
#   - 'get_user_tags' - Get All Tags For A User.
#   - 'get_tag_by_name' - Get A Specific Tag By Name For A User.

# Imports.
from sqlalchemy.orm import Session
from app.database import Tag

# -------------------------------------------------------- Create Default Tags.
def create_default_tags(db: Session, user_id: int):
    """Create Default Tags For A New User."""
    
    default_tags = [
        {"name": "Travel", "emoji": "✈️", "color": "#9AA2E9"},
        {"name": "Groceries", "emoji": "🛒", "color": "#10b981"},
        {"name": "Bills", "emoji": "📄", "color": "#f59e0b"},
        {"name": "Services", "emoji": "🔧", "color": "#8b5cf6"},
        {"name": "Entertainment", "emoji": "🎬", "color": "#ec4899"},
        {"name": "Transportation", "emoji": "🚗", "color": "#06b6d4"},
        {"name": "Healthcare", "emoji": "🏥", "color": "#ef4444"},
        {"name": "Shopping", "emoji": "🛍️", "color": "#f97316"},
        {"name": "Dining", "emoji": "🍽️", "color": "#84cc16"},
        {"name": "Education", "emoji": "📚", "color": "#6366f1"},
        {"name": "Home", "emoji": "🏠", "color": "#8b5cf6"},
        {"name": "Work", "emoji": "💼", "color": "#6366f1"},
        {"name": "Gifts", "emoji": "🎁", "color": "#ec4899"},
        {"name": "Subscriptions", "emoji": "📱", "color": "#06b6d4"},
        {"name": "Utilities", "emoji": "⚡", "color": "#f59e0b"}
    ]
    
    # Create Default Tags.
    created_tags = []
    for tag_data in default_tags:
        # Check If Tag Already Exists For This User.
        existing_tag = db.query(Tag).filter(
            Tag.user_id == user_id,
            Tag.name == tag_data["name"]
        ).first()
        
        if not existing_tag:
            new_tag = Tag(
                user_id=user_id,
                name=tag_data["name"],
                emoji=tag_data["emoji"],
                color=tag_data["color"],
                is_default=True
            )
            db.add(new_tag)
            created_tags.append(new_tag)
    
    db.commit()
    return created_tags

# -------------------------------------------------------- Get User Tags.
def get_user_tags(db: Session, user_id: int):
    """Get All Tags For A User."""
    return db.query(Tag).filter(Tag.user_id == user_id).all()

# -------------------------------------------------------- Get Tag By Name.
def get_tag_by_name(db: Session, user_id: int, tag_name: str):
    """Get A Specific Tag By Name For A User."""
    return db.query(Tag).filter(
        Tag.user_id == user_id,
        Tag.name == tag_name
    ).first() 