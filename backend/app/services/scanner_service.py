import ast
import re
import shutil
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.security.file_safety import redact_sensitive_evidence


def scan_source_workspace(workspace_path: Path) -> List[Dict[str, Any]]:
    """
    Scans all supported source files in the workspace (single file or entire extracted project).
    """
    findings = []
    py_files = sorted(list(workspace_path.glob("**/*.py")))
    if not py_files:
        py_files = sorted(list(workspace_path.glob("*.txt")))

    for file_path in py_files:
        try:
            rel_path = file_path.relative_to(workspace_path).as_posix()
        except Exception:
            rel_path = file_path.name

        try:
            source = file_path.read_text(encoding="utf-8", errors="replace")
            file_findings = scan_single_file(source, rel_path)
            findings.extend(file_findings)
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")

    # Re-index unique IDs
    for idx, f in enumerate(findings, 1):
        f["id"] = f"F-{idx:03d}"

    return findings


def scan_source(source_code: str, workspace_path: Path, filename: str = "target_code.py") -> List[Dict[str, Any]]:
    """
    Writes source to target file and runs scanner.
    """
    target_file = workspace_path / filename
    target_file.write_text(source_code, encoding="utf-8")
    return scan_source_workspace(workspace_path)


def scan_single_file(source_code: str, filename: str) -> List[Dict[str, Any]]:
    """
    Applies syntax-aware rules and contextual pattern matching on Python source code.
    """
    findings = []
    lines = source_code.splitlines()

    # Rule 1: SQL Injection
    # Look for query construction with f-string or string formatting into SQL statement
    sqli_keywords = ("SELECT ", "INSERT INTO ", "UPDATE ", "DELETE FROM ")
    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        upper_line = stripped.upper()
        if any(kw in upper_line for kw in sqli_keywords):
            # Check if using dynamic interpolation (f-string with variables, % format, or + concatenation)
            has_fstring_var = ("f\"" in line or "f'" in line) and "{" in line and "}" in line
            has_string_concat = (" + " in line) and any(kw in upper_line for kw in sqli_keywords)
            has_percent_format = (" % " in line) and not ("%s" in line and "execute(" in line)
            
            # Ensure not a false positive: if parameterized cursor.execute("SELECT ... %s", (val,))
            is_parameterized = "%s" in line and ", (" in line

            if (has_fstring_var or has_string_concat or has_percent_format) and not is_parameterized:
                snippet = get_context_snippet(lines, idx)
                findings.append({
                    "id": "",
                    "title": "SQL Injection via Dynamic Query Construction",
                    "severity": "Critical",
                    "category": "A03:2021-Injection",
                    "ruleId": "python.security.sqli.raw-string-interpolation",
                    "file": filename,
                    "startLine": idx,
                    "endLine": idx,
                    "line": idx,
                    "evidence": line.strip(),
                    "reason": "Direct interpolation of variables into an SQL command string allows attackers to manipulate query logic and bypass access controls.",
                    "recommendation": "Use parameterized queries with bind variables: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
                    "confidence": "High",
                    "component": extract_enclosing_component(source_code, idx),
                    "codeSnippet": snippet,
                    "status": "Open"
                })

    # Rule 2: Command Injection (subprocess with shell=True)
    for idx, line in enumerate(lines, 1):
        if ("subprocess." in line or "os.system" in line) and "shell=True" in line:
            # Check if dynamic arguments are present
            has_dynamic = "{" in line or " + " in line or "%" in line or not re.search(r'shell=True\s*,\s*check=', line)
            if has_dynamic:
                snippet = get_context_snippet(lines, idx)
                findings.append({
                    "id": "",
                    "title": "Command Injection via subprocess with shell=True",
                    "severity": "High",
                    "category": "A03:2021-Injection",
                    "ruleId": "python.security.rce.subprocess-shell-true",
                    "file": filename,
                    "startLine": idx,
                    "endLine": idx,
                    "line": idx,
                    "evidence": line.strip(),
                    "reason": "Invoking the system shell with untrusted arguments enables arbitrary shell command execution via command separators (; , &&, |).",
                    "recommendation": "Set shell=False and pass arguments as an explicit sequence: subprocess.run(['command', arg], shell=False, check=True)",
                    "confidence": "High",
                    "component": extract_enclosing_component(source_code, idx),
                    "codeSnippet": snippet,
                    "status": "Open"
                })

    # Rule 3: Hardcoded Secrets
    secret_regex = re.compile(
        r'(SECRET_KEY|API_KEY|PASSWORD|TOKEN|JWT_SECRET|PRIVATE_KEY)\s*=\s*["\']([^"\']{8,})["\']',
        re.IGNORECASE
    )
    for idx, line in enumerate(lines, 1):
        match = secret_regex.search(line)
        if match:
            # Check if it's not an env var getter like os.getenv("SECRET_KEY")
            if "os.environ" not in line and "os.getenv" not in line:
                snippet = get_context_snippet(lines, idx)
                redacted_line = redact_sensitive_evidence(line.strip())
                findings.append({
                    "id": "",
                    "title": "Hardcoded Secret / Token in Source Code",
                    "severity": "Critical",
                    "category": "A07:2021-Identification and Authentication Failures",
                    "ruleId": "generic.secrets.hardcoded-credentials",
                    "file": filename,
                    "startLine": idx,
                    "endLine": idx,
                    "line": idx,
                    "evidence": redacted_line,
                    "reason": "Hardcoded credentials in code will be committed into version control, granting anyone with repository access unauthorized privileges.",
                    "recommendation": "Load credentials from environment variables: os.environ.get('SECRET_KEY') or a dedicated secrets manager.",
                    "confidence": "High",
                    "component": extract_enclosing_component(source_code, idx) or "ModuleConfig",
                    "codeSnippet": redact_sensitive_evidence(snippet),
                    "status": "Open"
                })

    # Rule 4: Insecure Deserialization (pickle)
    for idx, line in enumerate(lines, 1):
        if "pickle.loads(" in line or "pickle.load(" in line or "_pickle.loads(" in line:
            snippet = get_context_snippet(lines, idx)
            findings.append({
                "id": "",
                "title": "Insecure Deserialization via pickle",
                "severity": "High",
                "category": "A08:2021-Software and Data Integrity Failures",
                "ruleId": "python.security.deserialization.pickle-loads",
                "file": filename,
                "startLine": idx,
                "endLine": idx,
                "line": idx,
                "evidence": line.strip(),
                "reason": "Python's pickle module can execute arbitrary Python bytecode during deserialization through __reduce__ hooks, leading to remote code execution.",
                "recommendation": "Use safe data serialization formats like JSON, MessagePack, or itsdangerous signed serializers.",
                "confidence": "High",
                "component": extract_enclosing_component(source_code, idx),
                "codeSnippet": snippet,
                "status": "Open"
            })

    # Rule 5: Weak Cryptography (MD5 / SHA1 for sensitive data)
    for idx, line in enumerate(lines, 1):
        if "hashlib.md5(" in line or "hashlib.sha1(" in line:
            snippet = get_context_snippet(lines, idx)
            findings.append({
                "id": "",
                "title": "Broken / Weak Cryptographic Hash (MD5/SHA1)",
                "severity": "High",
                "category": "A02:2021-Cryptographic Failures",
                "ruleId": "python.crypto.broken-hash-algorithm",
                "file": filename,
                "startLine": idx,
                "endLine": idx,
                "line": idx,
                "evidence": line.strip(),
                "reason": "MD5 and SHA-1 suffer from collision vulnerabilities and are unsuitable for password hashing or cryptographic signatures.",
                "recommendation": "Use bcrypt, Argon2id, or PBKDF2 for password storage, and SHA-256 for file checksums.",
                "confidence": "High",
                "component": extract_enclosing_component(source_code, idx),
                "codeSnippet": snippet,
                "status": "Open"
            })

    # Rule 6: Path Traversal
    for idx, line in enumerate(lines, 1):
        if "open(" in line and ("os.path.join" in line or "Path(" in line) and ".." not in line:
            if any(var in line for var in ["filename", "file_name", "user_file", "path", "req"]):
                snippet = get_context_snippet(lines, idx)
                findings.append({
                    "id": "",
                    "title": "Path Traversal in File Access",
                    "severity": "Medium",
                    "category": "A01:2021-Broken Access Control",
                    "ruleId": "python.security.file.path-traversal",
                    "file": filename,
                    "startLine": idx,
                    "endLine": idx,
                    "line": idx,
                    "evidence": line.strip(),
                    "reason": "Opening paths constructed from user parameters without canonical boundary validation allows reading or writing arbitrary files outside intended directories.",
                    "recommendation": "Validate that the canonical resolved path starts with the allowed root directory: os.path.commonpath([resolved, base]) == base",
                    "confidence": "Medium",
                    "component": extract_enclosing_component(source_code, idx),
                    "codeSnippet": snippet,
                    "status": "Open"
                })

    # Rule 7: Debug Mode Enabled
    for idx, line in enumerate(lines, 1):
        if ("app.run(" in line or ".run(" in line) and "debug=True" in line:
            snippet = get_context_snippet(lines, idx)
            findings.append({
                "id": "",
                "title": "Debug Mode Enabled in Web Application",
                "severity": "Low",
                "category": "A05:2021-Security Misconfiguration",
                "ruleId": "python.web.misconfiguration.debug-mode",
                "file": filename,
                "startLine": idx,
                "endLine": idx,
                "line": idx,
                "evidence": line.strip(),
                "reason": "Interactive debuggers (like Werkzeug) display full stack traces and an interactive in-browser Python terminal permitting arbitrary code execution.",
                "recommendation": "Set debug=False in production configurations: app.run(debug=False)",
                "confidence": "High",
                "component": extract_enclosing_component(source_code, idx) or "ApplicationEntry",
                "codeSnippet": snippet,
                "status": "Open"
            })

    return findings


def get_context_snippet(lines: List[str], target_line: int, context: int = 2) -> str:
    start = max(0, target_line - 1 - context)
    end = min(len(lines), target_line + context)
    return "\n".join(lines[start:end])


def extract_enclosing_component(source: str, line_no: int) -> Optional[str]:
    """Finds enclosing function or class via AST"""
    try:
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                if getattr(node, "lineno", 0) <= line_no <= getattr(node, "end_lineno", line_no):
                    return f"{node.name}()" if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) else f"class {node.name}"
    except Exception:
        pass
    return None
