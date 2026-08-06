from sqlalchemy.orm import Session
from typing import Optional, List
from repositories.business_repository import BusinessProfileRepository
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileResponse
from agents.business_understanding.agent import BusinessUnderstandingAgent

class BusinessProfileService:
    def __init__(self, db: Session):
        self.repository = BusinessProfileRepository(db)
        self.agent = BusinessUnderstandingAgent()

    def get_profile(self, profile_id: int) -> Optional[BusinessProfileResponse]:
        profile = self.repository.get(profile_id)
        if profile:
            return BusinessProfileResponse.model_validate(profile)
        return None
        
    def get_all_profiles(self, user_id: int) -> List[BusinessProfileResponse]:
        profiles = self.repository.get_all(user_id)
        return [BusinessProfileResponse.model_validate(p) for p in profiles]

    def create_profile(self, profile_data: BusinessProfileCreate, user_id: int) -> BusinessProfileResponse:
        # Pass through the Business Understanding Agent pipeline first
        processed_data = self.agent.process_input(profile_data)
        
        # Save to DB via repository
        db_profile = self.repository.create(processed_data, user_id)
        return BusinessProfileResponse.model_validate(db_profile)

    def update_profile(self, profile_id: int, profile_data: BusinessProfileUpdate) -> Optional[BusinessProfileResponse]:
        # Agent processing could also apply to updates
        processed_data = self.agent.process_input(profile_data)
        
        db_profile = self.repository.update(profile_id, processed_data)
        if db_profile:
            return BusinessProfileResponse.model_validate(db_profile)
        return None

    def delete_profile(self, profile_id: int) -> bool:
        return self.repository.delete(profile_id)
