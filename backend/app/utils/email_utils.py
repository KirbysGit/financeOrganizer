# Email Utils.
#
# Functions :
#   - 'create_verification_token' - Create A JWT Token For Email Verification.
#   - 'verify_verification_token' - Verify And Decode A Verification Token.
#   - 'send_verification_email' - Send A Verification Email To A User.
#   - 'send_welcome_email' - Send A Welcome Email To A User After Successful Verification.
#   - 'send_password_reset_email' - Send A Password Reset Email To A User.
#   - 'send_contact_form_email' - Send A Contact Form Email From A User To Support Team.

# Imports.
import os
import jwt
import smtplib
from typing import Optional
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart

# Email Configuration.
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "user-support@centi.dev"
SENDER_PASSWORD = os.getenv("EMAIL_PASSWORD")

# JWT Settings for Verification Tokens.
VERIFICATION_SECRET_KEY = "your-verification-secret-key-here"
VERIFICATION_ALGORITHM = "HS256"
VERIFICATION_EXPIRE_HOURS = 24

# Frontend URL for Email Verification.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# -------------------------------------------------------- Create Verification Token.
def create_verification_token(email: str) -> str:
    """Create & Return A JWT Token For Email Verification."""
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=VERIFICATION_EXPIRE_HOURS),
        "type": "email_verification"
    }
    return jwt.encode(payload, VERIFICATION_SECRET_KEY, algorithm=VERIFICATION_ALGORITHM)

# -------------------------------------------------------- Verify Verification Token.
def verify_verification_token(token: str) -> Optional[str]:
    """Verify & Decode The Verification Token."""
    try:
        # Decode The Token.
        payload = jwt.decode(token, VERIFICATION_SECRET_KEY, algorithms=[VERIFICATION_ALGORITHM])

        # Check If Token Is Valid.
        if payload.get("type") == "email_verification":
            # Return Email If Token Is Valid.
            return payload.get("email")
        
        # Return None If Token Is Invalid.
        return None
    
    # Return None If Token Is Invalid.
    except jwt.PyJWTError:
        return None

# -------------------------------------------------------- Send Verification Email.
def send_verification_email(email: str, first_name: str, verification_token: str) -> bool:
    """Send Verification Email To User."""
    try:
        # Create Message.
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = "Welcome to Centi! Please verify your email"
        
        # Create Verification URL.
        verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}&email={email}"
        
        # Email Body.
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">Welcome to Centi! 🎉</h1>
                </div>
                
                <p>Hi {first_name},</p>
                
                <p>Thank you for creating your Centi account! We're excited to help you take control of your finances.</p>
                
                <p>To complete your registration and start using Centi, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: linear-gradient(135deg, #007bff, #28a745); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{verification_url}</p>
                
                <p><strong>This link will expire in 24 hours.</strong></p>
                
                <p>If you didn't create a Centi account, you can safely ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    Best regards,<br>
                    The Centi Team<br>
                    <a href="mailto:user-support@centi.dev">user-support@centi.dev</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        # Attach Email Body.
        msg.attach(MIMEText(body, 'html'))
        
        # Send Email. SMTP -> TTLS -> Login -> Send Email.
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, email, text)
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

# -------------------------------------------------------- Send Welcome Email.
def send_welcome_email(email: str, first_name: str) -> bool:
    """Send Welcome Email After Successful Verification."""
    try:
        # Create Message.
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = "Welcome to Centi! Your account is now verified"
        
        # Email Body.
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #28a745; margin: 0;">Welcome to Centi! ✅</h1>
                </div>
                
                <p>Hi {first_name},</p>
                
                <p>Great news! Your email has been successfully verified and your Centi account is now active.</p>
                
                <p>You can now:</p>
                <ul>
                    <li>Connect your bank accounts</li>
                    <li>Upload transaction files</li>
                    <li>Track your spending patterns</li>
                    <li>Get your personalized Centi Score</li>
                    <li>Analyze your financial health</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://centi.dev" 
                       style="background: linear-gradient(135deg, #007bff, #28a745); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block;">
                        Start Using Centi
                    </a>
                </div>
                
                <p>If you have any questions or need help getting started, feel free to reach out to us at <a href="mailto:user-support@centi.dev">user-support@centi.dev</a>.</p>
                
                <p>Happy financial tracking!</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    Best regards,<br>
                    The Centi Team<br>
                    <a href="mailto:user-support@centi.dev">user-support@centi.dev</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send Email.
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, email, text)
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False 

# -------------------------------------------------------- Send Password Reset Email.
def send_password_reset_email(email: str, first_name: str, reset_token: str) -> bool:
    """Send Password Reset Email To User."""
    try:
        # Create Message.
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = "Reset your Centi password"
        
        # Create Reset URL.
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}&email={email}"
        
        # Email Body.
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">Reset Your Password 🔐</h1>
                </div>
                
                <p>Hi {first_name},</p>
                
                <p>We received a request to reset your Centi password. If you didn't make this request, you can safely ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background: linear-gradient(135deg, #007bff, #28a745); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{reset_url}</p>
                
                <p><strong>This link will expire in 24 hours.</strong></p>
                
                <p>For security reasons, this link can only be used once. If you need to reset your password again, please request a new link.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    Best regards,<br>
                    The Centi Team<br>
                    <a href="mailto:user-support@centi.dev">user-support@centi.dev</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        # Attach Email Body.
        msg.attach(MIMEText(body, 'html'))
        
        # Send Email. SMTP -> TTLS -> Login -> Send Email.
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, email, text)
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False 

# -------------------------------------------------------- Send Contact Form Email.
def send_contact_form_email(user_email: str, user_name: str, topic: str, description: str, attachments: list, user=None) -> bool:
    """Send Contact Form Email From User To Support Team."""
    try:
        # Create Message.
        msg = MIMEMultipart()
        msg['From'] = "user-review@centi.dev"
        msg['To'] = "user-support@centi.dev"
        msg['Subject'] = f"[Centi Contact] {topic} - {user_name}"
        
        # Format Attachments List.
        attachments_text = ""
        if attachments:
            attachments_text = "\n".join([f"   • {att['name']} ({att['size']} bytes)" for att in attachments])
        else:
            attachments_text = "None"
        
        # Get User Details If Available.
        user_details = ""
        if user:
            user_details = f"""
👤 User Details:
   • User ID: {user.id}
   • Email: {user.email}
   • Name: {user.first_name} {user.last_name}
   • Verified: {user.is_verified}
   • Created: {user.created_at.strftime('%Y-%m-%d %H:%M:%S')}
   • Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never'}
"""
        else:
            user_details = f"""
👤 User Details:
   • Email: {user_email}
   • Name: {user_name}
   • Status: Not registered user
"""
        
        # Email Body.
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">📧 New Contact Form Submission</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333; margin-top: 0;">📋 Submission Details</h2>
                    
                    <p><strong>⏰ Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    <p><strong>📧 Topic:</strong> {topic}</p>
                    <p><strong>👤 From:</strong> {user_name} ({user_email})</p>
                </div>
                
                {user_details}
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #856404; margin-top: 0;">📝 User Message:</h3>
                    <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
{description}
                    </div>
                </div>
                
                <div style="background: #e2e3e5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #495057; margin-top: 0;">📎 Attachments:</h3>
                    <div style="font-family: monospace; background: white; padding: 15px; border-radius: 5px;">
{attachments_text}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666; font-size: 14px;">
                        <strong>Action Required:</strong> Please review and respond to this user inquiry.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    This email was sent from the Centi Contact Form<br>
                    Sent to: user-support@centi.dev<br>
                    From: user-review@centi.dev
                </p>
            </div>
        </body>
        </html>
        """
        
        # Attach Email Body.
        msg.attach(MIMEText(body, 'html'))
        
        # Send Email. SMTP -> TTLS -> Login -> Send Email.
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail("user-review@centi.dev", "user-support@centi.dev", text)
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Error sending contact form email: {e}")
        return False 