# Imports.
import time
import asyncio
import schedule
from threading import Thread
from datetime import datetime, date

# Local Imports.
from ..database import SessionLocal, User, WeeklyCentiScore
from .centi_score_utils import create_weekly_score, get_monday_of_week

# -------------------------------------------------------- Centi Score Scheduler.
class CentiScoreScheduler:
    """Handles Scheduled Tasks Like Weekly Centi Score Calculations."""

    # -------------------------------------------------------- Initialize Scheduler.
    def __init__(self):
        """Initialize The Scheduler."""
        self.is_running = False
        self.scheduler_thread = None

    # -------------------------------------------------------- Start Scheduler.
    def start(self):    
        """Start The Scheduler In A Separate Thread."""

        # Check If Scheduler Is Already Running.
        if self.is_running:
            return
        
        # Set Scheduler To Running And Start Thread.
        self.is_running = True
        self.scheduler_thread = Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()

        # Print Message.
        print("Centi Score Scheduler started.")
    
    # -------------------------------------------------------- Stop Scheduler.
    def stop(self):
        """Stop The Scheduler."""

        # Set Scheduler To Not Running And Join Thread.
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()

        # Print Message.
        print("Centi Score Scheduler stopped.")
    
    # -------------------------------------------------------- Run Scheduler.
    def _run_scheduler(self):
        """Run The Scheduler Loop."""

        # Schedule Weekly Centi Score Calculation For Every Monday At 12:00 AM.
        schedule.every().monday.at("00:00").do(self._calculate_all_users_scores)
        
        # Print Message.
        print("Scheduled weekly Centi Score calculation for every Monday at 12:00 AM.")
        
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check Every Minute.
    
    # -------------------------------------------------------- Calculate All Users Scores.
    def _calculate_all_users_scores(self):
        """Calculate Weekly Centi Scores For All Users."""
        try:
            # Print Message.
            print(f"Starting weekly Centi Score calculation at {datetime.now()}.")
            
            # Get Database Session.
            db = SessionLocal()
            try:
                # Get All Active Users.
                users = db.query(User).filter(User.is_active == True).all()
                
                # Check If No Active Users Were Found.
                if not users:
                    print("No active users found for Centi Score calculation")
                    return
                
                # Get Monday Of Current Week.
                current_monday = get_monday_of_week(date.today())
                
                # Initialize Counters.
                success_count = 0
                error_count = 0
                
                # Loop Through All Users.
                for user in users:
                    try:
                        # Check If Score Already Exists For This Week.
                        existing_score = db.query(WeeklyCentiScore).filter(
                            WeeklyCentiScore.user_id == user.id,
                            WeeklyCentiScore.score_date == current_monday
                        ).first()
                        
                        # Check If Score Already Exists For This Week.
                        if existing_score:
                            # Print Message.
                            print(f"Score already exists for user {user.email} for week of {current_monday}.")
                            continue
                        
                        # Create Weekly Score.
                        weekly_score = create_weekly_score(db, user.id, current_monday)
                        success_count += 1
                        
                        # Print Message.
                        print(f"Calculated Centi Score {weekly_score.total_score} for user {user.email}.")
                        
                    except Exception as e:
                        error_count += 1
                        print(f"Error calculating score for user {user.email}: {str(e)}")
                
                # Print Message.
                print(f"Weekly Centi Score calculation completed:")
                print(f"  - Success: {success_count}.")
                print(f"  - Errors: {error_count}.")
                print(f"  - Total users: {len(users)}.")
                
            finally:
                # Close Database Session.
                db.close()
                
        except Exception as e:
            # Print Message.
            print(f"Error in weekly Centi Score calculation: {str(e)}")
    
    # -------------------------------------------------------- Calculate Scores Now.
def calculate_scores_now(self):
    """Manually trigger score calculation for all users."""
    self._calculate_all_users_scores()

# -------------------------------------------------------- Global Scheduler Instance.
centi_score_scheduler = CentiScoreScheduler()

# -------------------------------------------------------- Start Scheduler.
def start_scheduler():
    """Start the Centi Score scheduler."""
    centi_score_scheduler.start()

# -------------------------------------------------------- Stop Scheduler.
def stop_scheduler():
    """Stop the Centi Score scheduler."""
    centi_score_scheduler.stop()

# -------------------------------------------------------- Calculate Scores Manually.
def calculate_scores_manually():
    """Manually trigger score calculation."""
    centi_score_scheduler.calculate_scores_now() 