"""
Migration Script: Initialize 3 default subscriptions for all users
Ensures every user has exactly 3 subscription documents (free, pro, premium) with active status
"""
import asyncio
from datetime import datetime, timedelta
from app.database.mongodb import db
from app.services.subscription_service import SUBSCRIPTION_PLANS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def migrate_subscriptions():
    """
    Migrate existing users to have 3 default subscriptions
    """
    try:
        # Get all users
        users = await db["users"].find({}).to_list(length=None)
        logger.info(f"Found {len(users)} total users")
        
        if not users:
            logger.warning("No users found in database")
            return
        
        users_updated = 0
        users_with_subs = 0
        
        now = datetime.now().isoformat()
        period_end = (datetime.now() + timedelta(days=30)).isoformat()
        
        for user in users:
            user_id = str(user["_id"])
            
            # Check existing subscriptions for this user
            existing_subs = await db["subscriptions"].find(
                {"ownerId": user_id}
            ).to_list(length=None)
            
            existing_plans = {sub["plan"] for sub in existing_subs}
            
            if len(existing_subs) == 3 and existing_plans == {"free", "pro", "premium"}:
                # User already has 3 subscriptions
                users_with_subs += 1
                
                # Ensure free is active, pro/premium are inactive
                await db["subscriptions"].update_many(
                    {"ownerId": user_id, "plan": "free"},
                    {"$set": {"status": "active"}}
                )
                await db["subscriptions"].update_many(
                    {"ownerId": user_id, "plan": {"$in": ["pro", "premium"]}},
                    {"$set": {"status": "inactive"}}
                )
                logger.info(f"✓ User {user_id}: Already has 3 subscriptions (free: active, pro/premium: inactive)")
                continue
            
            # Create missing subscriptions
            subscriptions_to_create = []
            required_plans = ["free", "pro", "premium"]
            
            for plan in required_plans:
                if plan not in existing_plans:
                    plan_limits = SUBSCRIPTION_PLANS[plan]
                    # Only free plan is active by default
                    status = 'active' if plan == 'free' else 'inactive'
                    
                    sub_doc = {
                        "ownerId": user_id,
                        "plan": plan,
                        "status": status,
                        "price": plan_limits["price"],
                        "currentPeriodStart": now,
                        "currentPeriodEnd": period_end,
                        "propertyLimit": plan_limits["properties"],
                        "roomLimit": plan_limits["rooms"],
                        "tenantLimit": plan_limits["tenants"],
                        "staffLimit": plan_limits["staff"],
                        "createdAt": now,
                        "updatedAt": now,
                    }
                    subscriptions_to_create.append(sub_doc)
            
            if subscriptions_to_create:
                await db["subscriptions"].insert_many(subscriptions_to_create)
                users_updated += 1
                logger.info(
                    f"✓ User {user_id}: Created {len(subscriptions_to_create)} subscriptions "
                    f"(missing plans: {[s['plan'] for s in subscriptions_to_create]})"
                )
            
            # Update existing subscriptions: free should be active, pro/premium should be inactive
            await db["subscriptions"].update_many(
                {"ownerId": user_id, "plan": "free"},
                {"$set": {"status": "active"}}
            )
            await db["subscriptions"].update_many(
                {"ownerId": user_id, "plan": {"$in": ["pro", "premium"]}},
                {"$set": {"status": "inactive"}}
            )
        
        logger.info("\n" + "="*60)
        logger.info("MIGRATION COMPLETE")
        logger.info("="*60)
        logger.info(f"Total users processed: {len(users)}")
        logger.info(f"Users already with 3 subscriptions: {users_with_subs}")
        logger.info(f"Users updated with new subscriptions: {users_updated}")
        logger.info(f"All subscriptions set to active status")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}", exc_info=True)
        raise


async def verify_subscriptions():
    """
    Verify that all users have exactly 3 subscriptions with active status
    """
    try:
        logger.info("\nVerifying subscriptions...")
        logger.info("="*60)
        
        users = await db["users"].find({}).to_list(length=None)
        issues = []
        
        for user in users:
            user_id = str(user["_id"])
            subs = await db["subscriptions"].find(
                {"ownerId": user_id}
            ).to_list(length=None)
            
            plans = {sub["plan"] for sub in subs}
            
            # Check if has 3 subscriptions
            if len(subs) != 3:
                issues.append(f"User {user_id}: Has {len(subs)} subscriptions (expected 3)")
                continue
            
            # Check if has all plans
            if plans != {"free", "pro", "premium"}:
                missing = {"free", "pro", "premium"} - plans
                issues.append(f"User {user_id}: Missing plans {missing}")
                continue
            
            # Check if all are active
            free_subs = [s for s in subs if s.get("plan") == "free"]
            pro_premium_subs = [s for s in subs if s.get("plan") in ["pro", "premium"]]
            
            if free_subs and free_subs[0].get("status") != "active":
                issues.append(f"User {user_id}: Free plan is not active")
                continue
            
            if any(s.get("status") != "inactive" for s in pro_premium_subs):
                issues.append(f"User {user_id}: Pro/Premium plans are not inactive")
            
            # Check if price field exists
            no_price = [s for s in subs if "price" not in s]
            if no_price:
                issues.append(f"User {user_id}: {len(no_price)} subscriptions missing price field")
        
        if not issues:
            logger.info(f"✓ All {len(users)} users have valid subscriptions!")
            logger.info("✓ Each user has exactly 3 subscriptions (free, pro, premium)")
            logger.info("✓ Free plan is active for all users")
            logger.info("✓ Pro and Premium plans are inactive until user subscribes")
            logger.info("✓ All subscriptions have price field")
        else:
            logger.warning(f"\nFound {len(issues)} issues:\n")
            for issue in issues:
                logger.warning(f"  - {issue}")
        
        logger.info("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}", exc_info=True)


async def main():
    """Run migration and verification"""
    logger.info("Starting subscription migration...\n")
    await migrate_subscriptions()
    await verify_subscriptions()
    logger.info("Migration and verification complete!")


if __name__ == "__main__":
    asyncio.run(main())
