from sqlalchemy.orm import Session
from app.database import Tag

def create_default_tags(db: Session, user_id: int):
    """Create default tags for a new user."""
    
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
    
    created_tags = []
    for tag_data in default_tags:
        # Check if tag already exists for this user
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

def get_user_tags(db: Session, user_id: int):
    """Get all tags for a user."""
    return db.query(Tag).filter(Tag.user_id == user_id).all()

def get_tag_by_name(db: Session, user_id: int, tag_name: str):
    """Get a specific tag by name for a user."""
    return db.query(Tag).filter(
        Tag.user_id == user_id,
        Tag.name == tag_name
    ).first() 