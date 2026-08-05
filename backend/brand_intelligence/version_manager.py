from sqlalchemy.orm import Session
from models.brand import BrandMemoryVersion, BrandProfile
from sqlalchemy import func

class VersionManager:
    def __init__(self, db: Session):
        self.db = db

    def get_next_version(self, business_id: int) -> int:
        profile = self.db.query(BrandProfile).filter_by(business_id=business_id).first()
        if not profile:
            return 1
            
        max_version = self.db.query(func.max(BrandMemoryVersion.version)).filter_by(brand_profile_id=profile.id).scalar()
        if max_version is None:
            return 1
        return max_version + 1
