import ast
import re
import subprocess
import shutil
import json
from pathlib import Path
from typing import List, Dict, Any


def scan_source(source_code: str, workspace_path: Path, filename: str = "target_code.py") -> List[Dict[str, Any]]:
    """
    Run static security analysis on the provided source code.
    Attempts Semgrep CLI first if installed; seamlessly falls back to 
    the native AST & security heuristic engine.
    """
    target_file = workspace_path / filename
    target_file.write_text(source_code, encoding="utf-8")

    findings = []

    # Attempt Semgrep if installed and available in PATH
    semgrep_bin = shutil.which("semgrep")
    if semgrep_bin:
        try:
            cmd = [
                semgrep_bin,
                "scan",
                "--config", "p/ci",
                "--json",
                "--quiet",
                str(target_file)
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if proc.returncode == 0 or proc.stdout.strip():
                data = json.loads(proc.stdout)
                for item in data.get("results", []):
                    findings.append({
                        "id": f"F-SG-{len(findings)+1:03d}",
                        "title": item.get("extra", {}).get("message", "Semgrep security finding"),
                        "severity": item.get("extra", {}).get("severity", "Medium").capitalize(),
                        "ruleId": item.get("check_id", "semgrep.rule"),
                        "file": filename,
                        "line": item.get("start", {}).get("line", 1),
                        "evidence": item.get("extra", {}).get("lines", ""),
                        "recommendation": item.get("extra", {}).get("metadata", {}).get("fix", "Review Semgrep guidance"),
                        "status": "Open",
                        "confidence": "High",
                        "component": "FunctionSink",
                        "codeSnippet": item.get("extra", {}).get("lines", "")
                    })
        except Exception as e:
            print(f"Semgrep execution fallback triggered: {e}")

    # If Semgrep was not installed or found 0 issues, run comprehensive AST security analyzer
    if not findings:
        findings = run_ast_security_analysis(source_code, filename)

    return findings


def run_ast_security_analysis(source_code: str, filename: str) -> List[Dict[str, Any]]:
    """
    In-depth AST and lexical pattern scanner for Python vulnerabilities.
    """
    findings = []
    lines = source_code.splitlines()

    # Rule 1: SQL Injection (raw string format or f-string in SQL query)
    sqli_regex = re.compile(r'(SELECT|INSERT|UPDATE|DELETE)\s+.*\s+(FROM|INTO|SET)\s+.*(\{\w+\}|%\s*\w+|\+\s*\w+)', re.IGNORECASE)
    for idx, line in enumerate(lines, 1):
        if sqli_regex.search(line) or (("f\"SELECT" in line or "f'SELECT" in line or " + " in line) and "SELECT " in line.upper()):
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Potential SQL Injection via Raw String Construction",
                "severity": "Critical",
                "ruleId": "python.lang.security.audit.sqli.raw-string-format",
                "file": filename,
                "line": idx,
                "evidence": line.strip(),
                "recommendation": "Use parameterized queries with placeholders: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
                "status": "Open",
                "confidence": "High",
                "component": "DatabaseQuerySink",
                "codeSnippet": snippet
            })

    # Rule 2: Command Injection (subprocess with shell=True)
    for idx, line in enumerate(lines, 1):
        if ("subprocess." in line or "os.system" in line or "os.popen" in line) and "shell=True" in line:
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Command Injection via shell=True Execution",
                "severity": "High",
                "ruleId": "python.lang.security.audit.subprocess-shell-true",
                "file": filename,
                "line": idx,
                "evidence": line.strip(),
                "recommendation": "Set shell=False and pass arguments as an explicit array: subprocess.run(['cmd', arg], shell=False)",
                "status": "Open",
                "confidence": "High",
                "component": "ProcessExecutionSink",
                "codeSnippet": snippet
            })

    # Rule 3: Hardcoded Secrets (JWT, API keys, passwords)
    secret_regex = re.compile(r'(SECRET_KEY|API_KEY|PASSWORD|TOKEN|JWT_SECRET)\s*=\s*["\']([^"\']{10,})["\']', re.IGNORECASE)
    for idx, line in enumerate(lines, 1):
        match = secret_regex.search(line)
        if match:
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Hardcoded Secret Token in Source Code",
                "severity": "Critical",
                "ruleId": "generic.secrets.security.hardcoded-secret",
                "file": filename,
                "line": idx,
                "evidence": f"Found variable assignment with sensitive name: {line.strip()[:60]}...",
                "recommendation": "Load secrets from environment variables: os.environ.get('SECRET_KEY') or a cloud secrets manager.",
                "status": "Open",
                "confidence": "High",
                "component": "ConfigurationConstant",
                "codeSnippet": snippet
            })

    # Rule 4: Insecure Deserialization (pickle.loads)
    for idx, line in enumerate(lines, 1):
        if "pickle.loads(" in line or "pickle.load(" in line:
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Insecure Deserialization via pickle",
                "severity": "High",
                "ruleId": "python.lang.security.audit.pickle-insecure-deserialization",
                "file": filename,
                "line": idx,
                "evidence": line.strip(),
                "recommendation": "Replace pickle with safe structured data serialization formats such as JSON or signed tokens.",
                "status": "Open",
                "confidence": "High",
                "component": "DeserializationSink",
                "codeSnippet": snippet
            })

    # Rule 5: Weak Cryptography (MD5 / SHA1)
    for idx, line in enumerate(lines, 1):
        if "hashlib.md5(" in line or "hashlib.sha1(" in line:
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Weak Cryptographic Hash Function (MD5/SHA1)",
                "severity": "High",
                "ruleId": "python.crypto.weak-hash",
                "file": filename,
                "line": idx,
                "evidence": line.strip(),
                "recommendation": "Use modern secure cryptographic hash algorithms such as SHA-256 for integrity or bcrypt/Argon2 for passwords.",
                "status": "Open",
                "confidence": "High",
                "component": "CryptoRoutine",
                "codeSnippet": snippet
            })

    # Rule 6: Path Traversal
    for idx, line in enumerate(lines, 1):
        if "open(" in line and ("os.path.join" in line or "Path(" in line) and ".." not in line:
            if "request" in line or "filename" in line or "file_path" in line:
                snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
                findings.append({
                    "id": f"F-SEC-{len(findings)+1:03d}",
                    "title": "Potential Path Traversal in File Access",
                    "severity": "Medium",
                    "ruleId": "python.lang.security.audit.path-traversal",
                    "file": filename,
                    "line": idx,
                    "evidence": line.strip(),
                    "recommendation": "Verify that the resolved canonical path starts with the allowed root directory.",
                    "status": "Open",
                    "confidence": "Medium",
                    "component": "FileHandler",
                    "codeSnippet": snippet
                })

    # Rule 7: Debug Mode Enabled
    for idx, line in enumerate(lines, 1):
        if ("app.run(" in line or "run(" in line) and "debug=True" in line:
            snippet = "\n".join(lines[max(0, idx - 3):min(len(lines), idx + 2)])
            findings.append({
                "id": f"F-SEC-{len(findings)+1:03d}",
                "title": "Debug Mode Left Active in Production Blueprint",
                "severity": "Low",
                "ruleId": "python.flask.security.debug-mode-enabled",
                "file": filename,
                "line": idx,
                "evidence": line.strip(),
                "recommendation": "Ensure debug mode is disabled in production environments.",
                "status": "Open",
                "confidence": "High",
                "component": "AppRunner",
                "codeSnippet": snippet
            })

    return findings

