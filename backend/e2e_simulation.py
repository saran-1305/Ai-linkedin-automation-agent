import asyncio
import os
import uuid
from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.user import User
from models.business import BusinessProfile
from workflow.orchestrator import AutonomousWorkflowOrchestrator

async def run_e2e():
    db: Session = SessionLocal()
    try:
        # Create a fresh user
        email = f"e2e_{uuid.uuid4().hex[:8]}@example.com"
        user = User(email=email, name="E2E Test User", hashed_password="hashed_password", role="admin")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create a fresh business
        business = BusinessProfile(
            company_name="E2E Test Business",
            industry="Software Development",
            description="We build great AI software for enterprises.",
            brand_voice="Professional yet approachable",
            ai_operating_mode="autonomous"
        )
        db.add(business)
        db.commit()
        db.refresh(business)
        
        print(f"Created fresh user ({email}) and business ({business.company_name})")
        print("Starting E2E Autonomous Workflow...")
        
        orchestrator = AutonomousWorkflowOrchestrator(db)
        
        # Run the workflow
        # The workflow runs asynchronously in the background. We can trigger it manually for testing.
        await asyncio.to_thread(orchestrator.run_cycle, business.id)
        print("Pipeline triggered successfully. Check logs or database for progress.")

    finally:
        db.close()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(".env")
    asyncio.run(run_e2e())
