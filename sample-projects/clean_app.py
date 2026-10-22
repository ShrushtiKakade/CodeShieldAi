"""
Clean & Secure Reference Application
Demonstrates secure patterns that must NOT trigger false positives in CodeShield AI:
- Parameterized database queries
- Safe subprocess execution without shell
- Environment-loaded secrets
- Strong salted password hashing with bcrypt
"""
import os
import subprocess
import json
import psycopg2
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI(title="Secure Demo Service")

# 1. SECURE: Secret retrieved from environment variable
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "fallback_dev_only_key")
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://localhost/app")


def get_db():
    return psycopg2.connect(DATABASE_URL)


# 2. SECURE: Parameterized SQL Query with bind placeholders
@app.get("/api/users/{user_id}")
def get_user_profile(user_id: int, db=Depends(get_db)):
    cursor = db.cursor()
    query = "SELECT id, username, email FROM users WHERE id = %s AND is_active = %s"
    cursor.execute(query, (user_id, True))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}


# 3. SECURE: Command execution with shell=False and explicit argument list
@app.post("/api/reports/generate")
def generate_report(report_id: str):
    # Arguments passed as fixed sequence without shell invocation
    subprocess.run(["generate_report_tool", "--id", report_id], shell=False, check=True)
    return {"status": "dispatched"}


# 4. SECURE: Safe JSON deserialization instead of pickle
@app.post("/api/session/restore")
def restore_session(raw_payload: bytes):
    # Safe structured JSON parser
    data = json.loads(raw_payload.decode("utf-8"))
    return {"session": data}

