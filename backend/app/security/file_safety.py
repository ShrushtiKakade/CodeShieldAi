import os
import shutil
import uuid
from pathlib import Path
from typing import Tuple

MAX_SOURCE_LENGTH = 500000  # 500 KB limit
ALLOWED_EXTENSIONS = {".py", ".txt"}


class SecurityViolation(Exception):
    pass


def validate_source_code(source: str) -> None:
    if not source or not source.strip():
        raise SecurityViolation("Source code cannot be empty.")
    if len(source) > MAX_SOURCE_LENGTH:
        raise SecurityViolation(f"Source code exceeds maximum allowed length of {MAX_SOURCE_LENGTH} characters.")


def is_safe_path(base_dir: Path, target_path: Path) -> bool:
    """Ensure target path does not escape base directory via traversal (e.g. ../../)"""
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


def cleanup_safe_workspace(workspace_path: Path) -> None:
    """Safely delete temporary workspace after scan completion"""
    try:
        if workspace_path.exists() and workspace_path.is_dir():
            shutil.rmtree(workspace_path, ignore_errors=True)
    except Exception as e:
        # Avoid crashing scan responses if cleanup fails
        print(f"Warning: Failed to cleanup workspace {workspace_path}: {e}")
