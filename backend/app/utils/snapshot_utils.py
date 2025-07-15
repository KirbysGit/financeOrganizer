# Imports.
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional, Dict, Any

# Local Imports.
from ..database import MonthlySnapshot

# -------------------------------------------------------- Create Monthly Snapshot.
def create_monthly_snapshot(
    db: Session, 
    user_id: int, 
    snapshot_date: date,
    net_worth: float,
    total_assets: float,
    total_liabilities: float,
    monthly_cash_flow: float,
    monthly_income: float,
    monthly_spending: float,
    transaction_count: int
) -> MonthlySnapshot:
    """Create A Monthly Snapshot For A User."""
    
    # Check If Snapshot Already Exists For This Month.
    existing_snapshot = db.query(MonthlySnapshot).filter(
        MonthlySnapshot.user_id == user_id,
        MonthlySnapshot.snapshot_date == snapshot_date
    ).first()
    
    # Check If Snapshot Already Exists For This Month.
    if existing_snapshot:
        # Update Existing Snapshot.
        existing_snapshot.net_worth = net_worth
        existing_snapshot.total_assets = total_assets
        existing_snapshot.total_liabilities = total_liabilities
        existing_snapshot.monthly_cash_flow = monthly_cash_flow
        existing_snapshot.monthly_income = monthly_income
        existing_snapshot.monthly_spending = monthly_spending
        existing_snapshot.transaction_count = transaction_count
        db.commit()
        return existing_snapshot
    else:
        # Create New Snapshot.
        snapshot = MonthlySnapshot(
            user_id=user_id,
            snapshot_date=snapshot_date,
            net_worth=net_worth,
            total_assets=total_assets,
            total_liabilities=total_liabilities,
            monthly_cash_flow=monthly_cash_flow,
            monthly_income=monthly_income,
            monthly_spending=monthly_spending,
            transaction_count=transaction_count,
            created_at=datetime.now()
        )

        # Add New Snapshot To Database.
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)

        # Return New Snapshot.
        return snapshot

# -------------------------------------------------------- Get Monthly Snapshot.
def get_monthly_snapshot(db: Session, user_id: int, snapshot_date: date) -> Optional[MonthlySnapshot]:
    """Get A Specific Monthly Snapshot For A User."""

    # Get Snapshot For User And Date.
    return db.query(MonthlySnapshot).filter(
        MonthlySnapshot.user_id == user_id,
        MonthlySnapshot.snapshot_date == snapshot_date
    ).first()

# -------------------------------------------------------- Get Previous Month Snapshot.
def get_previous_month_snapshot(db: Session, user_id: int, current_date: date) -> Optional[MonthlySnapshot]:
    """Get The Previous Month's Snapshot For Comparison."""

    # Calculate Previous Month's First Day.
    if current_date.month == 1:
        prev_month = date(current_date.year - 1, 12, 1)
    else:
        prev_month = date(current_date.year, current_date.month - 1, 1)
    
    # Get Previous Month Snapshot.
    return get_monthly_snapshot(db, user_id, prev_month)

# -------------------------------------------------------- Get Snapshots For User.
def get_snapshots_for_user(db: Session, user_id: int, limit: int = 12) -> list[MonthlySnapshot]:
    """Get The Last N Monthly Snapshots For A User."""

    # Get Snapshots For User.
    return db.query(MonthlySnapshot).filter(
        MonthlySnapshot.user_id == user_id
    ).order_by(MonthlySnapshot.snapshot_date.desc()).limit(limit).all()

# -------------------------------------------------------- Calculate Growth From Snapshots.
def calculate_growth_from_snapshots(
    current_snapshot: MonthlySnapshot,
    previous_snapshot: Optional[MonthlySnapshot]
) -> Dict[str, float]:
    """Calculate Growth Percentages Between Two Snapshots."""
    
    # -------------------------------------------------------- Safe Growth Percentage.
    def safe_growth_percentage(current: float, previous: float) -> float:
        """Calculate Growth Percentage With Safety Checks."""

        # Check If Previous Is 0.
        if previous == 0:
            return 0.0  # No meaningful growth from 0
        percentage = ((current - previous) / abs(previous)) * 100
        # Cap at reasonable limits
        return max(-100.0, min(100.0, percentage))
    
    if not previous_snapshot:
        return {
            "net_worth": 0.0,
            "total_assets": 0.0,
            "total_liabilities": 0.0,
            "monthly_cash_flow": 0.0,
            "monthly_income": 0.0,
            "monthly_spending": 0.0
        }
    
    # Return Growth Percentages.
    return {
        "net_worth": safe_growth_percentage(current_snapshot.net_worth, previous_snapshot.net_worth),
        "total_assets": safe_growth_percentage(current_snapshot.total_assets, previous_snapshot.total_assets),
        "total_liabilities": safe_growth_percentage(current_snapshot.total_liabilities, previous_snapshot.total_liabilities),
        "monthly_cash_flow": safe_growth_percentage(current_snapshot.monthly_cash_flow, previous_snapshot.monthly_cash_flow),
        "monthly_income": safe_growth_percentage(current_snapshot.monthly_income, previous_snapshot.monthly_income),
        "monthly_spending": safe_growth_percentage(current_snapshot.monthly_spending, previous_snapshot.monthly_spending)
    }

# -------------------------------------------------------- Get Growth Context.
def get_growth_context(
    current_snapshot: MonthlySnapshot,
    previous_snapshot: Optional[MonthlySnapshot]
) -> Dict[str, Any]:
    """Get Growth Context With Both Percentages And Absolute Values."""

    # Calculate Growth Percentages.
    growth_percentages = calculate_growth_from_snapshots(current_snapshot, previous_snapshot)

    # Return Growth Context.
    context = {
        "current": {
            "net_worth": current_snapshot.net_worth,
            "total_assets": current_snapshot.total_assets,
            "total_liabilities": current_snapshot.total_liabilities,
            "monthly_cash_flow": current_snapshot.monthly_cash_flow,
            "monthly_income": current_snapshot.monthly_income,
            "monthly_spending": current_snapshot.monthly_spending,
            "transaction_count": current_snapshot.transaction_count
        },
        "previous": {
            "net_worth": previous_snapshot.net_worth if previous_snapshot else 0,
            "total_assets": previous_snapshot.total_assets if previous_snapshot else 0,
            "total_liabilities": previous_snapshot.total_liabilities if previous_snapshot else 0,
            "monthly_cash_flow": previous_snapshot.monthly_cash_flow if previous_snapshot else 0,
            "monthly_income": previous_snapshot.monthly_income if previous_snapshot else 0,
            "monthly_spending": previous_snapshot.monthly_spending if previous_snapshot else 0,
            "transaction_count": previous_snapshot.transaction_count if previous_snapshot else 0
        },
        "growth": growth_percentages,
        "has_historical_data": previous_snapshot is not None
    }
    
    return context 