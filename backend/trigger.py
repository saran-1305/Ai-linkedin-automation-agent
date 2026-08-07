import sys
import logging
from database.session import SessionLocal
from workflow.orchestrator import AutonomousWorkflowOrchestrator
from workflow.schedule_repository import ScheduleRepository
from models.business import BusinessProfile

logging.basicConfig(level=logging.INFO)
db = SessionLocal()
try:
    business = db.query(BusinessProfile).first()
    if not business:
        print('No business found')
        sys.exit(0)
    
    print(f'Triggering autonomous cycle for business {business.id}')
    
    # Mark it as run so the schedule repository knows
    repo = ScheduleRepository(db)
    repo.mark_run(business.id)
    
    # Run the cycle
    orchestrator = AutonomousWorkflowOrchestrator(db)
    orchestrator.run_cycle(business.id)
    print('Cycle started successfully!')
finally:
    db.close()
