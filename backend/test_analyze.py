import sys
from database.session import SessionLocal
from market_intelligence.analyzers.competitor_analyzer import CompetitorAnalyzer

db = SessionLocal()
analyzer = CompetitorAnalyzer(db)
analyzer.analyze_competitor(2)
