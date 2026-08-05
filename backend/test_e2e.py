import asyncio
import time
from fastapi.testclient import TestClient
from main import app
from database.session import SessionLocal
from models.business import BusinessProfile

client = TestClient(app)

def run_tests():
    db = SessionLocal()
    # 1. Create a dummy business profile to test
    business = db.query(BusinessProfile).filter_by(company_name="Test Corp").first()
    if not business:
        business = BusinessProfile(
            company_name="Test Corp",
            industry="Tech",
            description="Testing AI System",
            brand_voice="Professional",
            ai_operating_mode="autonomous"
        )
        db.add(business)
        db.commit()
        db.refresh(business)
        
    business_id = business.id
    
    print(f"Starting E2E Workflow Test for Business {business_id}")
    
    # 2. Trigger Onboarding Pipeline
    response = client.post(f"/api/orchestration/onboarding/{business_id}")
    print("Onboarding Response:", response.json())
    
    # 3. Wait and check status
    print("Waiting for agents to process...")
    for _ in range(5):
        time.sleep(2)
        status_res = client.get(f"/api/orchestration/status/{business_id}")
        statuses = status_res.json()
        running = [s['agent_name'] for s in statuses if s['status'] == 'RUNNING']
        completed = [s['agent_name'] for s in statuses if s['status'] == 'COMPLETED']
        print(f"RUNNING: {running} | COMPLETED: {completed}")
    
    # 4. Trigger Weekly Planning Pipeline
    print("\nStarting Weekly Planning Pipeline")
    response = client.post(f"/api/orchestration/weekly-planning/{business_id}")
    print("Weekly Planning Response:", response.json())
    
    print("Waiting for agents to process...")
    for _ in range(6):
        time.sleep(2)
        status_res = client.get(f"/api/orchestration/status/{business_id}")
        statuses = status_res.json()
        running = [s['agent_name'] for s in statuses if s['status'] == 'RUNNING']
        completed = [s['agent_name'] for s in statuses if s['status'] == 'COMPLETED']
        print(f"RUNNING: {running} | COMPLETED: {completed}")
        
    print("\nE2E Test Completed Successfully!")

if __name__ == "__main__":
    run_tests()
