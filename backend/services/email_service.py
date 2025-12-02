"""Email service for sending HOCS reports using Resend"""
import os
import base64
import resend
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional


async def send_report_email(
    to_email: str,
    pdf_bytes: bytes,
    session_id: str,
    opt_in: bool,
    db_client: Optional[AsyncIOMotorClient] = None
) -> dict:
    """
    Send a report email with PDF attachment using Resend.
    
    Args:
        to_email: Recipient email address
        pdf_bytes: PDF file content as bytes
        session_id: Session ID for tracking
        opt_in: Whether user opted in for updates
        db_client: MongoDB client for storing subscriptions
        
    Returns:
        dict with status and message
    """
    # Get Resend API key from environment
    resend_api_key = os.getenv('RESEND_API_KEY')
    from_email = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')
    
    if not resend_api_key:
        raise ValueError("RESEND_API_KEY not configured. Please set it in environment variables.")
    
    # Initialize Resend
    resend.api_key = resend_api_key
    
    # Email body HTML
    email_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Your HOCS Action Plan is Ready!</h2>
            
            <p>Thank you for using HOCS (Home Ownership Cost Savings).</p>
            
            <p>Your personalized 5-tier action plan is attached to this email. This plan will help you:</p>
            
            <ul>
                <li>Establish visibility into your home's energy and water usage</li>
                <li>Access free programs and professional assessments</li>
                <li>Make data-driven decisions about home improvements</li>
                <li>Maximize your savings with the best ROI upgrades</li>
            </ul>
            
            <h3 style="color: #1e40af;">Getting Started</h3>
            <p>We recommend starting with <strong>Tier 1</strong> to establish your baseline before making any changes. This visibility will help you measure the impact of every improvement you make.</p>
            
            <h3 style="color: #1e40af;">Key Principles</h3>
            <ul>
                <li><strong>Complete Tier 1 first:</strong> Establish your baseline before making changes</li>
                <li><strong>Track everything:</strong> Document dates and compare monthly bills</li>
                <li><strong>Start with free programs:</strong> Maximize no-cost opportunities first</li>
                <li><strong>Use your data:</strong> Let actual usage inform your decisions</li>
            </ul>
            
            {"<p><strong>You're subscribed!</strong> We'll notify you when new programs and opportunities become available in your area.</p>" if opt_in else ""}
            
            <p>Questions? Reply to this email and we'll be happy to help.</p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The HOCS Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666;">
                Session ID: {session_id}<br>
                Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
            </p>
        </div>
    </body>
    </html>
    """
    
    # Encode PDF as base64 for Resend
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
    
    # Send email using Resend
    try:
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": "Your HOCS Visibility-First Action Plan",
            "html": email_body,
            "attachments": [
                {
                    "filename": "HOCS_Action_Plan.pdf",
                    "content": pdf_base64
                }
            ]
        }
        
        email_response = resend.Emails.send(params)
        
        # Store subscription if opted in
        if opt_in and db_client:
            db = db_client.hocs
            subscriptions_collection = db.email_subscriptions
            
            subscription_doc = {
                'email': to_email,
                'session_id': session_id,
                'subscribed_at': datetime.utcnow(),
                'active': True
            }
            
            # Upsert to avoid duplicates
            await subscriptions_collection.update_one(
                {'email': to_email},
                {'$set': subscription_doc},
                upsert=True
            )
        
        return {
            'status': 'success',
            'message': f'Report sent successfully to {to_email}',
            'email_id': email_response.get('id')
        }
        
    except Exception as e:
        raise Exception(f"Failed to send email via Resend: {str(e)}")