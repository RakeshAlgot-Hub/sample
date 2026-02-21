import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

async def send_verification_email(to_email: str, verification_link: str):
    if not SENDGRID_API_KEY or not FROM_EMAIL:
        raise RuntimeError("SendGrid API key and FROM_EMAIL must be set in environment variables.")
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject="Verify your email address",
        html_content=f"""
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href='{verification_link}'>Verify Email</a>
        <p>If you did not register, please ignore this email.</p>
        """
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
    except Exception as e:
        raise RuntimeError(f"Failed to send verification email: {e}")
