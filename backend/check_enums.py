from sqlalchemy import text
from database.session import engine
with engine.connect() as conn:
    res = conn.execute(text("SELECT enum_range(NULL::runstatus)")).scalar()
    print('runstatus ENUM:', res)
    res2 = conn.execute(text("SELECT enum_range(NULL::pipelinestatus)")).scalar()
    print('pipelinestatus ENUM:', res2)
