from sqlalchemy.orm import Session
from models.business import BusinessProfile
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate
from typing import Optional, List

class BusinessProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, profile_id: int) -> Optional[BusinessProfile]:
        return self.db.query(BusinessProfile).filter(BusinessProfile.id == profile_id).first()

    def get_all(self, user_id: int) -> List[BusinessProfile]:
        return self.db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).all()

    def create(self, profile: BusinessProfileCreate, user_id: int) -> BusinessProfile:
        profile_data = profile.model_dump()
        profile_data["user_id"] = user_id
        db_profile = BusinessProfile(**profile_data)
        self.db.add(db_profile)
        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def update(self, profile_id: int, profile: BusinessProfileUpdate) -> Optional[BusinessProfile]:
        db_profile = self.get(profile_id)
        if not db_profile:
            return None
        
        update_data = profile.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_profile, key, value)
            
        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def delete(self, profile_id: int) -> bool:
        db_profile = self.get(profile_id)
        if not db_profile:
            return False
        
        self.db.delete(db_profile)
        self.db.commit()
        return True

    def exists(self) -> bool:
        return self.db.query(BusinessProfile).first() is not None
