import os
import re
import shutil
import uuid
import zipfile
from pathlib import Path
from typing import Tuple, List

MAX_SOURCE_LENGTH = 500000        # 500 KB limit for single snippets
MAX_UPLOAD_SIZE = 10 * 1024 * 1024 # 10 MB limit for archives
MAX_EXTRACTED_FILES = 50
ALLOWED_EXTENSIONS = {".py", ".txt"}


class SecurityViolation(Exception):
    pass


def validate_source_code(source: str) -> None:
    if not source or not source.strip():
        raise SecurityViolation("Source code cannot be empty.")
    if len(source) > MAX_SOURCE_LENGTH:
        raise SecurityViolation(f"Source code exceeds maximum allowed length of {MAX_SOURCE_LENGTH} characters.")


def is_safe_path(base_dir: Path, target_path: Path) -> bool:
    """Ensure target path does not escape base directory via traversal (Zip Slip protection)"""
    try:
        resolved_base = base_dir.resolve()
        resolved_target = target_path.resolve()
        return str(resolved_target).startswith(str(resolved_base))
    except Exception:
        return False


def create_safe_workspace(base_workspace_dir: Path) -> Tuple[Path, str]:
    """Create an isolated, temporary unique directory for scan execution"""
    scan_id = f"scan-{uuid.uuid4().hex[:8]}"
    workspace_path = base_workspace_dir / scan_id
    workspace_path.mkdir(parents=True, exist_ok=True)
    return workspace_path, scan_id


def extract_safe_archive(zip_file_path: Path, target_dir: Path) -> List[Path]:
    """
    Safely extract a zip archive with strict security checks:
    - Zip Slip path traversal rejection
    - Rejection of symlinks and special files
    - Extraction file count limit (prevents zip bomb)
    - Uncompressed size limit (prevents zip bomb)
    - Extension filtering (only supported files extracted)
    """
    extracted_files = []
    total_uncompressed_size = 0

    if not zipfile.is_zipfile(zip_file_path):
        raise SecurityViolation("Uploaded file is not a valid zip archive.")

    with zipfile.ZipFile(zip_file_path, 'r') as zf:
        infolist = zf.infolist()
        if len(infolist) > MAX_EXTRACTED_FILES:
            raise SecurityViolation(f"Archive contains {len(infolist)} files, exceeding limit of {MAX_EXTRACTED_FILES}.")

        for member in infolist:
            # Check for symlinks in external attributes
            is_symlink = (member.external_attr >> 16) & 0o120000 == 0o120000
            if is_symlink:
                continue

            # Prevent directory traversal
            dest_path = (target_dir / member.filename).resolve()
            if not is_safe_path(target_dir, dest_path):
                raise SecurityViolation(f"Dangerous archive entry detected (Path Traversal): {member.filename}")

            if member.is_dir():
                dest_path.mkdir(parents=True, exist_ok=True)
                continue

            # Check uncompressed size
            total_uncompressed_size += member.file_size
            if total_uncompressed_size > MAX_UPLOAD_SIZE:
                raise SecurityViolation("Archive uncompressed size exceeds maximum allowed limit (10MB).")

            # Check allowed extensions
            suffix = dest_path.suffix.lower()
            if suffix in ALLOWED_EXTENSIONS or dest_path.name in {"Dockerfile", "requirements.txt"}:
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member) as source, open(dest_path, "wb") as target:
                    shutil.copyfileobj(source, target)
                extracted_files.append(dest_path)

    return extracted_files


def cleanup_safe_workspace(workspace_path: Path) -> None:
    """Safely delete temporary workspace after scan completion"""
    try:
        if workspace_path.exists() and workspace_path.is_dir():
            shutil.rmtree(workspace_path, ignore_errors=True)
    except Exception as e:
        print(f"Warning: Failed to cleanup workspace {workspace_path}: {e}")


def redact_sensitive_evidence(evidence: str) -> str:
    """
    Redact secrets and sensitive tokens from evidence strings
    to prevent credential exposure in logs or UI displays.
    """
    if not evidence:
        return ""
    
    # Redact secret assignments like JWT_SECRET_KEY = "..."
    redacted = re.sub(
        r'((?:SECRET|API_KEY|PASSWORD|TOKEN|JWT_SECRET)\w*\s*=\s*["\'])([^"\']{4})([^"\']+)(["\'])',
        r'\1\2********[REDACTED]\4',
        evidence,
        flags=re.IGNORECASE
    )
    return redacted
