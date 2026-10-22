import os
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Store temporary workspaces and uploads in the OS temporary directory so uvicorn's
# file watcher (--reload) does not detect workspace file changes and restart mid-request.
WORKSPACE_DIR = Path(tempfile.gettempdir()) / "codeshield_workspaces"
UPLOADS_DIR = Path(tempfile.gettempdir()) / "codeshield_uploads"

# Ensure directories exist
WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

