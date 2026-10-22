"""
CodeShield AI - Safe Demonstration Test Fixture
Contains intentional security flaws to verify AST detection,
Graphify impact propagation, and DigitalOcean AI remediation.
"""
import os
import subprocess
import pickle
import hashlib
from fastapi import FastAPI, Depends

app = FastAPI(title="Vulnerable Demo App")

# 1. HARDCODED SECRET
JWT_SECRET_KEY = "super_insecure_jwt_token_secret_123456789"
DATABASE_URL = "postgres://admin:password123@localhost:5432/app"


def get_db_connection():
    import psycopg2
    return psycopg2.connect(DATABASE_URL)


# 2. SQL INJECTION (Vulnerable Sink)
def execute_user_query(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Flaw: String interpolation into SQL query
    query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND status = 'active'"
    cursor.execute(query)
    return cursor.fetchall()


# Upstream Caller in Impact Path
@app.get("/api/users/profile")
def get_user_profile(username: str):
    user_record = execute_user_query(username)
    return {"user": user_record}


# 3. COMMAND INJECTION (Vulnerable Sink)
def generate_audit_report(filename: str):
    # Flaw: shell=True with unescaped argument
    command = f"generate_pdf --input {filename} --out /tmp/out.pdf"
    subprocess.Popen(command, shell=True)


# Upstream Caller in Impact Path
@app.post("/api/reports/export")
def export_report_endpoint(filename: str):
    generate_audit_report(filename)
    return {"status": "generating"}


# 4. INSECURE DESERIALIZATION
@app.post("/api/session/restore")
def restore_user_session(cookie_data: bytes):
    # Flaw: pickle.loads on user input
    return pickle.loads(cookie_data)


# 5. WEAK CRYPTO
def hash_user_password(password: str):
    # Flaw: MD5 used for password hashing
    return hashlib.md5(password.encode()).hexdigest()


if __name__ == "__main__":
    # 6. DEBUG MODE ENABLED IN PRODUCTION
    app.run(host="0.0.0.0", port=8000, debug=True)

