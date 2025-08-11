# Centi Score Routes.

# Router : Tag w/ "Centi Score".
#
# API Endpoints :
#   - 'get_centi_score_status' - Get Comprehensive Status Of User's Centi Score Data.
#   - 'get_current_centi_score' - Get The Current/Latest Centi Score For The User.
#   - 'get_centi_score_history' - Get The History Of Weekly Centi Scores For The User.
#   - 'get_centi_score_growth' - Get Detailed Growth Analysis For The User's Centi Score.
#   - 'get_centi_score_summary' - Get A Quick Summary Of The User's Centi Score Growth.
#   - 'calculate_weekly_score' - Manually Calculate And Store A Weekly Centi Score For The Current Week.
#   - 'get_score_trend' - Get Trend Analysis For The User's Centi Score.
#   - 'calculate_all_users_weekly_scores' - Calculate Weekly Scores For All Users (Admin Function).


# Imports.
from datetime import date
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

# Local Imports.
from app.database import User

# Local Models.
from app.models import WeeklyCentiScore as WeeklyCentiScoreModel

# Local Utils.
from app.utils.db_utils import get_db
from app.utils.auth_utils import get_current_user
from app.utils.centi_score_utils import (
    create_weekly_score,
    get_latest_weekly_score,
    get_weekly_score_history,
    get_monday_of_week,
    calculate_score_trend,
    calculate_centi_score,
    get_user_financial_data,
    get_detailed_growth_analysis,
    get_score_growth_summary,
    check_user_centi_score_status
)

# Create Router Instance.
router = APIRouter(tags=["Centi Score"])

# -------------------------------------------------------- Get Centi Score Status.
@router.get("/centi-score/status")
def get_centi_score_status(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get Comprehensive Status Of User's Centi Score Data."""
    try:
        # Get Status Data.
        status_data = check_user_centi_score_status(db, current_user.id)

        # Return Status Data.
        return status_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving Centi Score status: {str(e)}")

# -------------------------------------------------------- Get Current Centi Score.
@router.get("/centi-score/current")
def get_current_centi_score(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get The Current/Latest Centi Score For The User."""
    try:
        # Get The Latest Weekly Score.
        latest_score = get_latest_weekly_score(db, current_user.id)
        
        if not latest_score:
            # Calculate Current Score Without Saving.
            financial_data = get_user_financial_data(db, current_user.id)
            score_result = calculate_centi_score(
                net_worth=financial_data["net_worth"],
                total_assets=financial_data["total_assets"],
                total_liabilities=financial_data["total_liabilities"],
                monthly_cash_flow=financial_data["monthly_cash_flow"],
                transaction_count=financial_data["transaction_count"]
            )
            
            # Return Score Data.
            return {
                "score": score_result["total_score"],
                "breakdown": score_result["breakdown"],
                "financial_data": financial_data,
                "last_updated": None,
                "is_weekly_score": False
            }
        
        # Convert To Response Model.
        score_data = {
            "score": latest_score.total_score,
            "breakdown": {
                "net_worth": {"score": latest_score.net_worth_score, "max": 40, "value": latest_score.net_worth},
                "assets": {"score": latest_score.assets_score, "max": 30, "value": latest_score.total_assets},
                "liabilities": {"score": latest_score.liabilities_score, "max": 20, "value": latest_score.total_liabilities},
                "cash_flow": {"score": latest_score.cash_flow_score, "max": 10, "value": latest_score.monthly_cash_flow}
            },
            "financial_data": {
                "net_worth": latest_score.net_worth,
                "total_assets": latest_score.total_assets,
                "total_liabilities": latest_score.total_liabilities,
                "monthly_cash_flow": latest_score.monthly_cash_flow,
                "transaction_count": latest_score.transaction_count
            },
            "last_updated": latest_score.created_at,
            "score_date": latest_score.score_date,
            "is_weekly_score": True
        }
        
        # Return Score Data.
        return score_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving Centi Score: {str(e)}")

# -------------------------------------------------------- Get Centi Score History.
@router.get("/centi-score/history")
def get_centi_score_history(
    limit: int = 12, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get The History Of Weekly Centi Scores For The User."""
    try:
        # Get Weekly Scores.
        scores = get_weekly_score_history(db, current_user.id, limit)
        
        # Calculate Trend.
        trend_data = calculate_score_trend(scores)
        
        # Convert To Response Format.
        score_history = []
        for score in scores:
            score_history.append({
                "score_date": score.score_date,
                "total_score": score.total_score,
                "net_worth_score": score.net_worth_score,
                "assets_score": score.assets_score,
                "liabilities_score": score.liabilities_score,
                "cash_flow_score": score.cash_flow_score,
                "net_worth": score.net_worth,
                "total_assets": score.total_assets,
                "total_liabilities": score.total_liabilities,
                "monthly_cash_flow": score.monthly_cash_flow,
                "transaction_count": score.transaction_count,
                "created_at": score.created_at
            })
        
        # Return Score History.
        return {
            "scores": score_history,
            "trend": trend_data,
            "total_scores": len(score_history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving score history: {str(e)}")

# -------------------------------------------------------- Get Centi Score Growth.
@router.get("/centi-score/growth")
def get_centi_score_growth(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get Detailed Growth Analysis For The User's Centi Score."""
    try:
        # Get Growth Data.
        growth_data = get_detailed_growth_analysis(db, current_user.id)

        # Return Growth Data.
        return growth_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving growth analysis: {str(e)}")

# -------------------------------------------------------- Get Centi Score Summary.
@router.get("/centi-score/summary")
def get_centi_score_summary(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get A Quick Summary Of The User's Centi Score Growth."""
    try:
        # Get Summary Data.
        summary_data = get_score_growth_summary(db, current_user.id)

        # Return Summary Data.
        return summary_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving score summary: {str(e)}")

# -------------------------------------------------------- Calculate Weekly Centi Score.
@router.post("/centi-score/calculate")
def calculate_weekly_score(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Manually Calculate And Store A Weekly Centi Score For The Current Week."""
    try:
        # Get Monday Of Current Week.
        current_monday = get_monday_of_week(date.today())
        
        # Create Weekly Score.
        weekly_score = create_weekly_score(db, current_user.id, current_monday)
        
        # Return Weekly Score Data.
        return {
            "message": "Weekly Centi Score Calculated Successfully!",
            "score_date": weekly_score.score_date,
            "total_score": weekly_score.total_score,
            "created_at": weekly_score.created_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating weekly score: {str(e)}")

# -------------------------------------------------------- Get Centi Score Trend.
@router.get("/centi-score/trend")
def get_score_trend(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get Trend Analysis For The User's Centi Score."""
    try:
        # Get Last 4 Weeks Of Scores.
        scores = get_weekly_score_history(db, current_user.id, 4)
        
        # If Less Than 2 Weeks Of Data, Return Insufficient Data.
        if len(scores) < 2:
            return {
                "trend": "insufficient_data",
                "message": "Need at least 2 weeks of data to calculate trend",
                "weeks_tracked": len(scores)
            }
        
        # Calculate Trend.
        trend_data = calculate_score_trend(scores)
        
        # Return Trend Data.
        return {
            "trend": trend_data["trend"],
            "change": trend_data["change"],
            "change_percentage": trend_data["change_percentage"],
            "weeks_tracked": trend_data["weeks_tracked"],
            "latest_score": scores[0].total_score if scores else None,
            "previous_score": scores[1].total_score if len(scores) > 1 else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating trend: {str(e)}")

# -------------------------------------------------------- Calculate All Users Weekly Scores.
@router.post("/centi-score/calculate-all-users")
def calculate_all_users_weekly_scores(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Calculate Weekly Scores For All Users (Admin Function)."""
    try:
        # Check If User Is Admin (You Can Implement Your Own Admin Check).
        if current_user.email != "admin@example.com":  # Replace With Your Admin Check.
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get All Users.
        users = db.query(User).filter(User.is_active == True).all()
        
        # Get Current Monday.
        current_monday = get_monday_of_week(date.today())

        # Initialize Results List.
        results = []

        # Calculate Weekly Scores For Each User.
        for user in users:
            try:
                weekly_score = create_weekly_score(db, user.id, current_monday)
                results.append({
                    "user_id": user.id,
                    "user_email": user.email,
                    "score": weekly_score.total_score,
                    "status": "success"
                })
            except Exception as e:
                results.append({
                    "user_id": user.id,
                    "user_email": user.email,
                    "score": None,
                    "status": "error",
                    "error": str(e)
                })
        
        # Return Results.
        return {
            "message": f"Calculated Weekly Scores For {len(users)} Users",
            "score_date": current_monday,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating scores for all users: {str(e)}") 