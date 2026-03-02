"""Email service for sending OTP and other notifications via SendGrid"""
import os
from typing import Optional
import asyncio
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.config.settings import SENDGRID_API_KEY, FROM_EMAIL

# Initialize SendGrid client
sg_client = SendGridAPIClient(SENDGRID_API_KEY) if SENDGRID_API_KEY else None


async def send_otp_email(email: str, otp: str, app_name: str = "Hostel Manager") -> bool:
    """
    Send OTP to user's email via SendGrid
    Args:
        email: User's email address
        otp: 6-digit OTP code
        app_name: Application name for email template
    Returns:
        True if email sent successfully, False otherwise
    """
    if not sg_client or not FROM_EMAIL:
        print(f"[WARNING] SendGrid not configured. OTP: {otp} for {email}")
        return False

    try:
        # Email template content
        subject = f"Your {app_name} Verification Code: {otp}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Email</h2>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Welcome to {app_name}! Use the verification code below to complete your registration.
                    </p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 6px; margin: 25px 0;">
                        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Your verification code</p>
                        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">{otp}</p>
                    </div>
                    
                    <p style="color: #999; font-size: 13px; text-align: center; margin-bottom: 10px;">
                        This code will expire in 10 minutes
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
                        If you didn't request this code, you can safely ignore this email.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                        <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
                            <strong>Security Note:</strong> Never share your verification code with anyone. 
                            {app_name} staff will never ask for your code.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """

        message = Mail(
            from_email=Email(FROM_EMAIL, "Hostel Manager"),
            to_emails=To(email),
            subject=subject,
            html_content=html_content
        )

        # Run SendGrid API call in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, sg_client.send, message)
        
        if response.status_code in [200, 201, 202]:
            print(f"[SUCCESS] OTP email sent to {email}")
            return True
        else:
            print(f"[ERROR] Failed to send OTP email. Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Exception sending OTP email to {email}: {str(e)}")
        return False


async def send_welcome_email(email: str, name: str, app_name: str = "Hostel Manager") -> bool:
    """
    Send welcome email after successful registration
    Args:
        email: User's email address
        name: User's full name
        app_name: Application name
    Returns:
        True if email sent successfully, False otherwise
    """
    if not sg_client or not FROM_EMAIL:
        print(f"[WARNING] SendGrid not configured. Welcome email not sent to {email}")
        return False

    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to {app_name}! 🎉</h2>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Hi {name.split()[0]},
                    </p>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Thank you for registering with {app_name}. Your account has been successfully created and verified.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        You can now log in to your account and start managing your hostel operations efficiently.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="#" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Get Started
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
                        If you have any questions, feel free to reach out to our support team.
                    </p>
                </div>
            </body>
        </html>
        """

        message = Mail(
            from_email=Email(FROM_EMAIL, "Hostel Manager"),
            to_emails=To(email),
            subject=f"Welcome to {app_name}!",
            html_content=html_content
        )

        # Run SendGrid API call in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, sg_client.send, message)
        
        if response.status_code in [200, 201, 202]:
            print(f"[SUCCESS] Welcome email sent to {email}")
            return True
        else:
            print(f"[ERROR] Failed to send welcome email. Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Exception sending welcome email to {email}: {str(e)}")
        return False
