export const mockStats = {
  totalFindings: 7,
  critical: 2,
  high: 3,
  medium: 1,
  low: 1,
  filesScanned: 18,
  linesOfCode: 2450,
  lastScanTimestamp: "2026-10-22T08:15:00Z",
  aiCreditsSaved: "85%",
  cachedAiQueries: 14,
  activeModel: "kimi-k3 (DigitalOcean)"
};

export const mockFindings = [
  {
    id: "F-001",
    title: "SQL Injection via Unsanitized Query Parameter",
    severity: "Critical",
    ruleId: "python.lang.security.audit.sqli.raw-string-format",
    file: "services/user_service.py",
    line: 42,
    evidence: "query = f\"SELECT * FROM users WHERE username = '{username}' AND status = 'active'\"",
    recommendation: "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE username = %s AND status = %s', (username, 'active'))",
    status: "Open",
    confidence: "High",
    component: "UserService.get_user_by_name",
    codeSnippet: `def get_user_by_name(cursor, username: str):\n    # POTENTIAL SQL INJECTION: Direct string formatting into raw query\n    query = f"SELECT * FROM users WHERE username = '{username}' AND status = 'active'\\n    cursor.execute(query)\n    return cursor.fetchone()`,
    impactNodes: ["node-user-service", "node-auth-controller", "node-login-endpoint"],
    aiExplanation: "The username parameter is interpolated directly into an SQL command without parameterization or escaping. An attacker can supply `' OR '1'='1` to bypass authentication and gain unauthorized database read access.",
    aiFix: `def get_user_by_name(cursor, username: str):\n    # SECURE: Parameterized execution prevents query manipulation\n    query = "SELECT * FROM users WHERE username = %s AND status = %s"\n    cursor.execute(query, (username, "active"))\n    return cursor.fetchone()`,
    cached: true
  },
  {
    id: "F-002",
    title: "Hardcoded API Secret in Database Config",
    severity: "Critical",
    ruleId: "generic.secrets.security.hardcoded-jwt-secret",
    file: "config/database.py",
    line: 14,
    evidence: "JWT_SECRET_KEY = \"do_not_share_live_jwt_prod_secret_89214798124\"",
    recommendation: "Load credentials dynamically using os.environ.get('JWT_SECRET_KEY') or a secret vault.",
    status: "Open",
    confidence: "High",
    component: "DatabaseConfig",
    codeSnippet: `class DatabaseConfig:\n    # CRITICAL: Secret committed into source control\n    JWT_SECRET_KEY = "do_not_share_live_jwt_prod_secret_89214798124"\n    DB_HOST = "10.0.4.12"`,
    impactNodes: ["node-db-config", "node-auth-middleware", "node-token-verifier"],
    aiExplanation: "Hardcoded cryptographic keys expose the token verification logic to anyone with read access to the repository, enabling arbitrary JWT forgery and impersonation of admin accounts.",
    aiFix: `import os\n\nclass DatabaseConfig:\n    # SECURE: Load secret from environment variable\n    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")\n    if not JWT_SECRET_KEY:\n        raise ValueError("JWT_SECRET_KEY environment variable is not configured")`,
    cached: true
  },
  {
    id: "F-003",
    title: "Command Injection via Unsanitized subprocess.Popen",
    severity: "High",
    ruleId: "python.lang.security.audit.subprocess-shell-true",
    file: "utils/report_generator.py",
    line: 28,
    evidence: "subprocess.Popen(f\"generate_pdf --input {user_supplied_filename}\", shell=True)",
    recommendation: "Avoid shell=True and pass arguments as a list of strings: subprocess.run(['generate_pdf', '--input', filename], shell=False)",
    status: "Open",
    confidence: "High",
    component: "ReportGenerator.create_pdf",
    codeSnippet: `def create_pdf(user_supplied_filename: str):\n    # HIGH RISK: shell=True with unescaped user string\n    subprocess.Popen(f"generate_pdf --input {user_supplied_filename}", shell=True)`,
    impactNodes: ["node-report-gen", "node-export-route"],
    aiExplanation: "Executing commands through the shell with concatenated user input allows arbitrary command chaining (e.g. `; rm -rf /;` or reverse shells).",
    aiFix: `import subprocess\n\ndef create_pdf(user_supplied_filename: str):\n    # SECURE: Pass executable and arguments as an array without shell execution\n    subprocess.run(["generate_pdf", "--input", user_supplied_filename], shell=False, check=True)`,
    cached: false
  },
  {
    id: "F-004",
    title: "Insecure Deserialization via pickle.loads",
    severity: "High",
    ruleId: "python.lang.security.audit.pickle-insecure-deserialization",
    file: "cache/session_store.py",
    line: 55,
    evidence: "session_data = pickle.loads(raw_cookie_payload)",
    recommendation: "Replace pickle with safe serialization formats such as JSON or itsdangerous signed serializers.",
    status: "Open",
    confidence: "High",
    component: "SessionStore.restore_session",
    codeSnippet: `def restore_session(raw_cookie_payload: bytes):\n    # DANGEROUS: Arbitrary code execution during pickle unpickling\n    return pickle.loads(raw_cookie_payload)`,
    impactNodes: ["node-session-store", "node-auth-middleware"],
    aiExplanation: "Python's pickle module can construct arbitrary objects during deserialization via __reduce__, allowing remote code execution if the payload was tampered with by the client.",
    aiFix: `import json\n\ndef restore_session(raw_cookie_payload: bytes):\n    # SECURE: Safe JSON parsing without arbitrary object reconstruction\n    return json.loads(raw_cookie_payload.decode("utf-8"))`,
    cached: false
  },
  {
    id: "F-005",
    title: "Weak Cryptographic Hash Function (MD5) for Password Storage",
    severity: "High",
    ruleId: "python.crypto.weak-hash-md5",
    file: "services/crypto_helper.py",
    line: 19,
    evidence: "hashlib.md5(password.encode()).hexdigest()",
    recommendation: "Use Argon2id, bcrypt, or PBKDF2 with salt for password storage.",
    status: "Open",
    confidence: "High",
    component: "CryptoHelper.hash_password",
    codeSnippet: `import hashlib\n\ndef hash_password(password: str) -> str:\n    # WEAK HASH: MD5 is vulnerable to collision attacks and rainbow tables\n    return hashlib.md5(password.encode()).hexdigest()`,
    impactNodes: ["node-crypto-helper", "node-user-service"],
    aiExplanation: "MD5 has severe collision vulnerabilities and can be computed trillions of times per second on GPUs, making offline brute-force and rainbow table recovery trivial.",
    aiFix: `import bcrypt\n\ndef hash_password(password: str) -> str:\n    # SECURE: Adaptive salted hashing with bcrypt\n    salt = bcrypt.gensalt(rounds=12)\n    return bcrypt.hashpw(password.encode(), salt).decode("utf-8")`,
    cached: true
  },
  {
    id: "F-006",
    title: "Path Traversal in Static Asset Handler",
    severity: "Medium",
    ruleId: "python.lang.security.audit.path-traversal",
    file: "routes/asset_router.py",
    line: 33,
    evidence: "file_path = os.path.join(STATIC_DIR, requested_file)",
    recommendation: "Validate that resolved path starts with the allowed root directory: os.path.commonpath([resolved_path, STATIC_DIR]) == STATIC_DIR",
    status: "Open",
    confidence: "Medium",
    component: "AssetRouter.serve_asset",
    codeSnippet: `def serve_asset(requested_file: str):\n    # Directory traversal vulnerability if requested_file has '../../'\n    file_path = os.path.join(STATIC_DIR, requested_file)\n    return open(file_path, "rb").read()`,
    impactNodes: ["node-asset-router"],
    aiExplanation: "An attacker could pass `../../etc/passwd` or application config files to read arbitrary files from the filesystem.",
    aiFix: `from pathlib import Path\n\ndef serve_asset(requested_file: str):\n    base_dir = Path(STATIC_DIR).resolve()\n    target_file = (base_dir / requested_file).resolve()\n    if not str(target_file).startswith(str(base_dir)):\n        raise PermissionError("Access denied: path traversal attempt")\n    return target_file.read_bytes()`,
    cached: false
  },
  {
    id: "F-007",
    title: "Debug Mode Left Active in Production Blueprint",
    severity: "Low",
    ruleId: "python.flask.security.debug-mode-enabled",
    file: "app.py",
    line: 12,
    evidence: "app.run(host='0.0.0.0', port=5000, debug=True)",
    recommendation: "Disable debug mode in production environments: app.run(debug=False)",
    status: "Open",
    confidence: "High",
    component: "FlaskApplication",
    codeSnippet: `if __name__ == '__main__':\n    # LOW/MEDIUM: Interactive Werkzeug debugger exposed\n    app.run(host='0.0.0.0', port=5000, debug=True)`,
    impactNodes: ["node-app-entry"],
    aiExplanation: "Debug mode allows the Werkzeug interactive debugger in browser on unhandled exceptions, which provides an interactive Python console permitting arbitrary command execution.",
    aiFix: `import os\n\nif __name__ == '__main__':\n    is_debug = os.getenv("ENVIRONMENT") == "development"\n    app.run(host='0.0.0.0', port=5000, debug=is_debug)`,
    cached: false
  }
];

export const mockImpactGraph = {
  nodes: [
    {
      id: "node-login-endpoint",
      type: "customNode",
      position: { x: 50, y: 150 },
      data: {
        label: "POST /api/auth/login",
        type: "API Controller",
        file: "routes/auth_routes.py",
        risk: "affected",
        description: "Public entry point exposed to web traffic"
      }
    },
    {
      id: "node-auth-controller",
      type: "customNode",
      position: { x: 320, y: 150 },
      data: {
        label: "AuthController.authenticate()",
        type: "Controller",
        file: "controllers/auth_controller.py",
        risk: "affected",
        description: "Orchestrates user lookup and password verification"
      }
    },
    {
      id: "node-user-service",
      type: "customNode",
      position: { x: 620, y: 150 },
      data: {
        label: "UserService.get_user_by_name()",
        type: "Vulnerable Function",
        file: "services/user_service.py",
        risk: "vulnerable",
        findingId: "F-001",
        description: "Direct SQL string concatenation without parameterization"
      }
    },
    {
      id: "node-db-config",
      type: "customNode",
      position: { x: 620, y: 320 },
      data: {
        label: "DatabaseConfig.JWT_SECRET",
        type: "Vulnerable Secret",
        file: "config/database.py",
        risk: "vulnerable",
        findingId: "F-002",
        description: "Hardcoded production JWT secret key"
      }
    },
    {
      id: "node-auth-middleware",
      type: "customNode",
      position: { x: 320, y: 320 },
      data: {
        label: "AuthMiddleware.verify_token()",
        type: "Security Filter",
        file: "middleware/auth.py",
        risk: "affected",
        description: "Validates incoming Bearer tokens using configured secret"
      }
    },
    {
      id: "node-db-pool",
      type: "customNode",
      position: { x: 920, y: 150 },
      data: {
        label: "DatabasePool.execute_raw()",
        type: "Database Driver",
        file: "database/connection.py",
        risk: "dependency",
        description: "Direct PostgreSQL connection cursor execution"
      }
    },
    {
      id: "node-session-store",
      type: "customNode",
      position: { x: 320, y: 460 },
      data: {
        label: "SessionStore.restore_session()",
        type: "Vulnerable Function",
        file: "cache/session_store.py",
        risk: "vulnerable",
        findingId: "F-004",
        description: "pickle.loads on untrusted cookie input"
      }
    },
    {
      id: "node-report-gen",
      type: "customNode",
      position: { x: 620, y: 460 },
      data: {
        label: "ReportGenerator.create_pdf()",
        type: "Vulnerable Utility",
        file: "utils/report_generator.py",
        risk: "vulnerable",
        findingId: "F-003",
        description: "subprocess.Popen with shell=True"
      }
    }
  ],
  edges: [
    {
      id: "e-login-ctrl",
      source: "node-login-endpoint",
      target: "node-auth-controller",
      label: "routes to",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 }
    },
    {
      id: "e-ctrl-service",
      source: "node-auth-controller",
      target: "node-user-service",
      label: "calls vulnerable function",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 }
    },
    {
      id: "e-service-db",
      source: "node-user-service",
      target: "node-db-pool",
      label: "executes SQL",
      animated: false,
      style: { stroke: "#f59e0b", strokeWidth: 2 }
    },
    {
      id: "e-middleware-config",
      source: "node-auth-middleware",
      target: "node-db-config",
      label: "reads secret",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 }
    },
    {
      id: "e-ctrl-middleware",
      source: "node-login-endpoint",
      target: "node-auth-middleware",
      label: "protected by",
      animated: false,
      style: { stroke: "#64748b", strokeWidth: 1.5 }
    },
    {
      id: "e-middleware-session",
      source: "node-auth-middleware",
      target: "node-session-store",
      label: "deserializes state",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 }
    }
  ]
};

export const mockScanHistory = [
  {
    id: "scan-20261022-01",
    timestamp: "2026-10-22 13:30:12",
    target: "repo/ecommerce-backend (main branch)",
    totalFindings: 7,
    critical: 2,
    high: 3,
    medium: 1,
    low: 1,
    durationMs: 1420,
    status: "Completed",
    scannedBy: "Local Developer",
    graphNodesCount: 14,
    aiInferenceCalls: 3,
    aiTokensUsed: 840,
    aiCreditsOptimized: true
  },
  {
    id: "scan-20261021-04",
    timestamp: "2026-10-21 17:45:00",
    target: "repo/payment-gateway-service",
    totalFindings: 3,
    critical: 1,
    high: 1,
    medium: 1,
    low: 0,
    durationMs: 980,
    status: "Completed",
    scannedBy: "CI/CD Pipeline",
    graphNodesCount: 8,
    aiInferenceCalls: 1,
    aiTokensUsed: 280,
    aiCreditsOptimized: true
  },
  {
    id: "scan-20261020-02",
    timestamp: "2026-10-20 09:12:40",
    target: "repo/user-auth-microservice",
    totalFindings: 4,
    critical: 0,
    high: 2,
    medium: 2,
    low: 0,
    durationMs: 1150,
    status: "Completed",
    scannedBy: "Local Developer",
    graphNodesCount: 11,
    aiInferenceCalls: 2,
    aiTokensUsed: 520,
    aiCreditsOptimized: true
  }
];

export const sampleCodeSnippets = {
  sqlInjection: `from fastapi import FastAPI, Depends, HTTPException
import psycopg2

app = FastAPI()

def get_db():
    return psycopg2.connect("dbname=app user=postgres")

@app.get("/users/search")
def search_users(username: str, db = Depends(get_db)):
    cursor = db.cursor()
    # VULNERABLE: Direct string interpolation into raw SQL
    query = f"SELECT id, username, email FROM users WHERE username = '{username}' AND active = 1"
    cursor.execute(query)
    results = cursor.fetchall()
    return {"users": results}
`,
  commandInjection: `import subprocess
from fastapi import FastAPI

app = FastAPI()

@app.post("/reports/export")
def export_report(filename: str):
    # VULNERABLE: shell=True with unvalidated user filename allows command injection
    cmd = f"generate_pdf --source {filename} --out /tmp/report.pdf"
    subprocess.Popen(cmd, shell=True)
    return {"status": "generating", "file": filename}
`,
  hardcodedSecret: `import os
from datetime import datetime, timedelta

# VULNERABLE: Hardcoded JWT private key committed to repository
JWT_SECRET_KEY = "super_secret_production_master_jwt_token_2026"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    # Signing token with hardcoded secret
    import jwt
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
`
};
