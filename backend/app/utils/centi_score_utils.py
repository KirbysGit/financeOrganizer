# Imports.
import math
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, Optional, List
from datetime import datetime, date, timedelta

# Local Imports.
from ..database import WeeklyCentiScore, Transaction, Account

# -------------------------------------------------------- Calculate Centi Score.
def calculate_centi_score(
    net_worth: float,
    total_assets: float,
    total_liabilities: float,
    monthly_cash_flow: float,
    transaction_count: int
) -> Dict:
    """Calculate Centi Score Based On Financial Metrics. Returns Both Total Score And Breakdown Of Components."""
    
    # Initialize Component Scores.
    net_worth_score = 0
    assets_score = 0
    liabilities_score = 0
    cash_flow_score = 0
    
    # Net Worth Contribution (Up To 40 Points).
    if net_worth > 0:
        # Logarithmic Scaling For Net Worth.
        net_worth_score = min(40, int((math.log10(net_worth + 1) / 5) * 40))
    
    # Assets Contribution (Up To 30 Points).
    if total_assets > 0:
        # Logarithmic Scaling For Assets.
        assets_score = min(30, int((math.log10(total_assets + 1) / 5) * 30))
    
    # Liabilities Contribution (Up To 20 Points).
    if total_liabilities == 0:
        liabilities_score = 20  # Full Points For No Liabilities.
    else:
        # Penalty Based On Liability Amount.
        liability_ratio = min(1, total_liabilities / 50000)  # Cap At $50k.
        liabilities_score = max(0, int(20 * (1 - liability_ratio)))
    
    # Cash Flow Contribution (Up To 10 Points).
    if monthly_cash_flow > 0:
        # Positive Cash Flow Gets Points.
        cash_flow_score = min(10, int((monthly_cash_flow / 5000) * 10))
    else:
        # Negative cash flow gets penalty
        cash_flow_score = max(-5, int((monthly_cash_flow / 2000) * 5))
    
    # Calculate Total Score.
    total_score = max(0, min(100, net_worth_score + assets_score + liabilities_score + cash_flow_score))
    
    return {
        "total_score": total_score,
        "net_worth_score": net_worth_score,
        "assets_score": assets_score,
        "liabilities_score": liabilities_score,
        "cash_flow_score": cash_flow_score,
        "breakdown": {
            "net_worth": {"score": net_worth_score, "max": 40, "value": net_worth},
            "assets": {"score": assets_score, "max": 30, "value": total_assets},
            "liabilities": {"score": liabilities_score, "max": 20, "value": total_liabilities},
            "cash_flow": {"score": cash_flow_score, "max": 10, "value": monthly_cash_flow}
        }
    }

# -------------------------------------------------------- Get User Financial Data.
def get_user_financial_data(db: Session, user_id: int) -> Dict:
    """Get Current Financial Data For A User To Calculate Their Score."""

    # Get Current Date And Calculate Time Periods.
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1).date()
    
    # Calculate Net Worth (Assets - Liabilities).
    total_assets = db.query(func.sum(Account.current_balance)).filter(
        Account.user_id == user_id,
        Account.is_active == True,
        Account.current_balance > 0
    ).scalar() or 0
    
    total_liabilities = abs(db.query(func.sum(Account.current_balance)).filter(
        Account.user_id == user_id,
        Account.is_active == True,
        Account.current_balance < 0
    ).scalar() or 0)
    
    net_worth = total_assets - total_liabilities
    
    # Calculate Monthly Cash Flow.
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.amount > 0,
        Transaction.date >= start_of_month
    ).scalar() or 0
    
    monthly_spending = abs(db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.amount < 0,
        Transaction.date >= start_of_month
    ).scalar() or 0)
    
    monthly_cash_flow = monthly_income - monthly_spending
    
    # Get Transaction Count.
    transaction_count = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).count()
    
    return {
        "net_worth": net_worth,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "monthly_cash_flow": monthly_cash_flow,
        "transaction_count": transaction_count
    }

# -------------------------------------------------------- Create Weekly Score.
def create_weekly_score(db: Session, user_id: int, score_date: date) -> WeeklyCentiScore:
    """Create A Weekly Centi Score For A User."""

    # Get User's Financial Data.
    financial_data = get_user_financial_data(db, user_id)
    
    # Calculate Score.
    score_result = calculate_centi_score(
        net_worth=financial_data["net_worth"],
        total_assets=financial_data["total_assets"],
        total_liabilities=financial_data["total_liabilities"],
        monthly_cash_flow=financial_data["monthly_cash_flow"],
        transaction_count=financial_data["transaction_count"]
    )
    
    # Check If Score Already Exists For This Week.
    existing_score = db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id,
        WeeklyCentiScore.score_date == score_date
    ).first()
    
    if existing_score:
        # Update Existing Score.
        existing_score.total_score = score_result["total_score"]
        existing_score.net_worth_score = score_result["net_worth_score"]
        existing_score.assets_score = score_result["assets_score"]
        existing_score.liabilities_score = score_result["liabilities_score"]
        existing_score.cash_flow_score = score_result["cash_flow_score"]
        existing_score.net_worth = financial_data["net_worth"]
        existing_score.total_assets = financial_data["total_assets"]
        existing_score.total_liabilities = financial_data["total_liabilities"]
        existing_score.monthly_cash_flow = financial_data["monthly_cash_flow"]
        existing_score.transaction_count = financial_data["transaction_count"]
        db.commit()
        return existing_score
    else:
        # Create New Score.
        weekly_score = WeeklyCentiScore(
            user_id=user_id,
            score_date=score_date,
            total_score=score_result["total_score"],
            net_worth_score=score_result["net_worth_score"],
            assets_score=score_result["assets_score"],
            liabilities_score=score_result["liabilities_score"],
            cash_flow_score=score_result["cash_flow_score"],
            net_worth=financial_data["net_worth"],
            total_assets=financial_data["total_assets"],
            total_liabilities=financial_data["total_liabilities"],
            monthly_cash_flow=financial_data["monthly_cash_flow"],
            transaction_count=financial_data["transaction_count"]
        )
        db.add(weekly_score)
        db.commit()
        db.refresh(weekly_score)
        return weekly_score

# -------------------------------------------------------- Get Weekly Score.
def get_weekly_score(db: Session, user_id: int, score_date: date) -> Optional[WeeklyCentiScore]:
    """Get A Specific Weekly Score For A User."""

    return db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id,
        WeeklyCentiScore.score_date == score_date
    ).first()

# -------------------------------------------------------- Get Latest Weekly Score.
def get_latest_weekly_score(db: Session, user_id: int) -> Optional[WeeklyCentiScore]:
    """Get The Most Recent Weekly Score For A User."""

    return db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id
    ).order_by(WeeklyCentiScore.score_date.desc()).first()

# -------------------------------------------------------- Get Weekly Score History.
def get_weekly_score_history(db: Session, user_id: int, limit: int = 12) -> List[WeeklyCentiScore]:
    """Get The Last N Weekly Scores For A User."""

    return db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id
    ).order_by(WeeklyCentiScore.score_date.desc()).limit(limit).all()

# -------------------------------------------------------- Get Monday Of Week.
def get_monday_of_week(target_date: date) -> date:
    """Get The Monday Of The Week Containing The Target Date."""

    # Calculate Days Since Monday.
    days_since_monday = target_date.weekday()
    monday = target_date - timedelta(days=days_since_monday)
    return monday

# -------------------------------------------------------- Calculate Score Trend.
def calculate_score_trend(scores: List[WeeklyCentiScore]) -> Dict:
    """Calculate Trend Information From A List Of Scores."""

    if len(scores) < 2:
        return {
            "trend": "stable",
            "change": 0,
            "change_percentage": 0,
            "weeks_tracked": len(scores)
        }
    
    # Calculate Latest And Previous Score.
    latest_score = scores[0].total_score
    previous_score = scores[1].total_score
    change = latest_score - previous_score
    change_percentage = ((change / previous_score) * 100) if previous_score > 0 else 0
    
    # Determine Trend.
    if change > 0:
        trend = "improving"
    elif change < 0:
        trend = "declining"
    else:
        trend = "stable"
    
    return {
        "trend": trend,
        "change": change,
        "change_percentage": change_percentage,
        "weeks_tracked": len(scores)
    }

# -------------------------------------------------------- Get Detailed Growth Analysis.
def get_detailed_growth_analysis(db: Session, user_id: int) -> Dict:
    """Get Detailed Growth Analysis Including Monthly Comparisons And Streaks."""

    # Get All Scores For The User.
    all_scores = db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id
    ).order_by(WeeklyCentiScore.score_date.desc()).all()
    
    if len(all_scores) < 2:
        return {
            "has_growth_data": False,
            "message": "Need at least 2 weeks of data to show growth analysis"
        }
    
    # Calculate Basic Trend.
    trend_data = calculate_score_trend(all_scores)
    
    # Calculate Monthly Comparison.
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Get Current And Previous Month Scores.
    current_month_scores = [s for s in all_scores if s.score_date.month == current_month and s.score_date.year == current_year]
    previous_month_scores = [s for s in all_scores if s.score_date.month == (current_month - 1 if current_month > 1 else 12) and s.score_date.year == (current_year if current_month > 1 else current_year - 1)]
    
    monthly_comparison = None
    if current_month_scores and previous_month_scores:
        current_month_avg = sum(s.total_score for s in current_month_scores) / len(current_month_scores)
        previous_month_avg = sum(s.total_score for s in previous_month_scores) / len(previous_month_scores)
        monthly_change = current_month_avg - previous_month_avg
        monthly_comparison = {
            "current_month_avg": round(current_month_avg, 1),
            "previous_month_avg": round(previous_month_avg, 1),
            "change": round(monthly_change, 1),
            "change_percentage": round((monthly_change / previous_month_avg * 100) if previous_month_avg > 0 else 0, 1)
        }
    
    # Calculate Growth Streak.
    growth_streak = 0
    decline_streak = 0
    current_streak = 0
    streak_type = "stable"
    
    for i in range(len(all_scores) - 1):
        # Get Current And Next Score.
        current_score = all_scores[i].total_score
        next_score = all_scores[i + 1].total_score
        
        # Check If Current Score Is Greater Than Next Score.
        if current_score > next_score:
            if streak_type == "improving":
                growth_streak = max(growth_streak, current_streak)
                current_streak = 1
                streak_type = "improving"
            else:
                current_streak += 1
                streak_type = "improving"
        elif current_score < next_score:
            if streak_type == "declining":
                decline_streak = max(decline_streak, current_streak)
                current_streak = 1
                streak_type = "declining"
            else:
                current_streak += 1
                streak_type = "declining"
        else:
            # Reset Streak On Stable Scores.
            if streak_type == "improving":
                growth_streak = max(growth_streak, current_streak)
            elif streak_type == "declining":
                decline_streak = max(decline_streak, current_streak)
            current_streak = 0
            streak_type = "stable"
    
    # Update Final Streaks.
    if streak_type == "improving":
        growth_streak = max(growth_streak, current_streak)
    elif streak_type == "declining":
        decline_streak = max(decline_streak, current_streak)
    
    # Calculate Best & Worst Scores.
    best_score = max(s.total_score for s in all_scores)
    worst_score = min(s.total_score for s in all_scores)
    best_score_date = next(s.score_date for s in all_scores if s.total_score == best_score)
    worst_score_date = next(s.score_date for s in all_scores if s.total_score == worst_score)
    
    # Calculate Average Score.
    avg_score = sum(s.total_score for s in all_scores) / len(all_scores)
    
    return {
        "has_growth_data": True,
        "current_score": all_scores[0].total_score if all_scores else 0,
        "previous_score": all_scores[1].total_score if len(all_scores) > 1 else 0,
        "trend": trend_data,
        "monthly_comparison": monthly_comparison,
        "streaks": {
            "current_growth_streak": growth_streak,
            "current_decline_streak": decline_streak,
            "longest_growth_streak": growth_streak,
            "longest_decline_streak": decline_streak
        },
        "stats": {
            "total_scores": len(all_scores),
            "best_score": best_score,
            "best_score_date": best_score_date,
            "worst_score": worst_score,
            "worst_score_date": worst_score_date,
            "average_score": round(avg_score, 1),
            "score_range": best_score - worst_score
        },
        "recent_scores": [
            {
                "date": score.score_date,
                "score": score.total_score,
                "net_worth": score.net_worth,
                "assets": score.total_assets,
                "liabilities": score.total_liabilities,
                "cash_flow": score.monthly_cash_flow
            }
            for score in all_scores[:8]  # Last 8 weeks
        ]
    }

# -------------------------------------------------------- Get Score Growth Summary.
def get_score_growth_summary(db: Session, user_id: int) -> Dict:
    """Get A Quick Summary Of Score Growth For Display In UI."""

    latest_score = get_latest_weekly_score(db, user_id)
    if not latest_score:
        return {
            "has_data": False,
            "message": "No Centi Score data available"
        }
    
    # Get The Previous Score.
    previous_score = db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id,
        WeeklyCentiScore.score_date < latest_score.score_date
    ).order_by(WeeklyCentiScore.score_date.desc()).first()
    
    if not previous_score:
        return {
            "has_data": True,
            "current_score": latest_score.total_score,
            "is_first_score": True,
            "message": "This is your first Centi Score! Keep adding financial data to see your growth."
        }
    
    # Calculate Change And Change Percentage.
    change = latest_score.total_score - previous_score.total_score
    change_percentage = ((change / previous_score.total_score) * 100) if previous_score.total_score > 0 else 0
    
    # Determine Growth Message.
    if change > 0:
        if change >= 5:
            growth_message = f"Great progress! Your score increased by {change} points."
        elif change >= 2:
            growth_message = f"Nice improvement! Your score went up by {change} points."
        else:
            growth_message = f"Small gain of {change} points."
    elif change < 0:
        if change <= -5:
            growth_message = f"Score dropped by {abs(change)} points - Time to review your finances."
        elif change <= -2:
            growth_message = f"Score decreased by {abs(change)} points"
        else:
            growth_message = f"Small decrease of {abs(change)} points"
    else:
        growth_message = "Your score stayed the same"
    
    return {
        "has_data": True,
        "current_score": latest_score.total_score,
        "previous_score": previous_score.total_score,
        "change": change,
        "change_percentage": round(change_percentage, 1),
        "growth_message": growth_message,
        "last_updated": latest_score.created_at,
        "score_date": latest_score.score_date
    }

# -------------------------------------------------------- Check User Centi Score Status.
def check_user_centi_score_status(db: Session, user_id: int) -> Dict:
    """Check If A User Has Centi Score Data And Provide A Comprehensive Status."""

    # Get All Scores For The User.
    all_scores = db.query(WeeklyCentiScore).filter(
        WeeklyCentiScore.user_id == user_id
    ).order_by(WeeklyCentiScore.score_date.desc()).all()
    
    if not all_scores:
        return {
            "has_centi_scores": False,
            "total_scores": 0,
            "message": "No Centi Score data found. Add financial data and calculate your first score!",
            "can_calculate": True
        }
    
    # Get Latest Score.
    latest_score = all_scores[0]
    total_scores = len(all_scores)
    
    # Calculate Basic Stats.
    best_score = max(s.total_score for s in all_scores)
    worst_score = min(s.total_score for s in all_scores)
    avg_score = sum(s.total_score for s in all_scores) / total_scores
    
    # Determine Score Trend.
    if total_scores >= 2:
        trend = "improving" if latest_score.total_score > all_scores[1].total_score else "declining" if latest_score.total_score < all_scores[1].total_score else "stable"
        change = latest_score.total_score - all_scores[1].total_score
    else:
        trend = "new"
        change = 0
    
    # Calculate Weeks Tracked.
    if total_scores > 0:
        first_score_date = all_scores[-1].score_date
        last_score_date = all_scores[0].score_date
        weeks_tracked = (last_score_date - first_score_date).days // 7 + 1
    else:
        weeks_tracked = 0
    
    return {
        "has_centi_scores": True,
        "total_scores": total_scores,
        "weeks_tracked": weeks_tracked,
        "latest_score": latest_score.total_score,
        "latest_score_date": latest_score.score_date,
        "best_score": best_score,
        "worst_score": worst_score,
        "average_score": round(avg_score, 1),
        "trend": trend,
        "change": change,
        "last_updated": latest_score.created_at,
        "message": f"You have {total_scores} Centi Score{'s' if total_scores > 1 else ''} tracked over {weeks_tracked} week{'s' if weeks_tracked > 1 else ''}",
        "can_calculate": True,
        "score_history": [
            {
                "date": score.score_date,
                "score": score.total_score,
                "net_worth": score.net_worth,
                "assets": score.total_assets,
                "liabilities": score.total_liabilities,
                "cash_flow": score.monthly_cash_flow
            }
            for score in all_scores[:12]  # Last 12 scores
        ]
    } 