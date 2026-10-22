import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "codeshield.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize SQLite tables for persistent scan history and findings"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                scan_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                target_name TEXT NOT NULL,
                language TEXT NOT NULL,
                status TEXT NOT NULL,
                duration_ms INTEGER DEFAULT 0,
                total_findings INTEGER DEFAULT 0,
                critical_count INTEGER DEFAULT 0,
                high_count INTEGER DEFAULT 0,
                medium_count INTEGER DEFAULT 0,
                low_count INTEGER DEFAULT 0,
                files_scanned INTEGER DEFAULT 1,
                is_demo INTEGER DEFAULT 0,
                raw_data_json TEXT NOT NULL
            )
        """)
        conn.commit()


def save_scan(scan_data: Dict[str, Any]) -> None:
    """Persist a complete scan record and its findings"""
    init_db()
    summary = scan_data.get("summary", {})
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO scans (
                scan_id, timestamp, target_name, language, status,
                duration_ms, total_findings, critical_count, high_count,
                medium_count, low_count, files_scanned, is_demo, raw_data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scan_data.get("scan_id"),
            scan_data.get("timestamp"),
            scan_data.get("target_name", "target_source.py"),
            scan_data.get("language", "python"),
            scan_data.get("status", "completed"),
            scan_data.get("duration_ms", 0),
            summary.get("total_findings", 0),
            summary.get("critical", 0),
            summary.get("high", 0),
            summary.get("medium", 0),
            summary.get("low", 0),
            scan_data.get("files_scanned", 1),
            1 if scan_data.get("isDemo", False) else 0,
            json.dumps(scan_data)
        ))
        conn.commit()


def get_scan(scan_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single scan by scan_id"""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT raw_data_json FROM scans WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row["raw_data_json"])
    return None


def get_all_scans() -> List[Dict[str, Any]]:
    """Retrieve all historical scans metadata, sorted latest first"""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT scan_id, timestamp, target_name, language, status,
                   duration_ms, total_findings, critical_count, high_count,
                   medium_count, low_count, files_scanned, is_demo
            FROM scans ORDER BY timestamp DESC
        """)
        rows = cursor.fetchall()
        results = []
        for r in rows:
            results.append({
                "id": r["scan_id"],
                "scan_id": r["scan_id"],
                "timestamp": r["timestamp"],
                "target": r["target_name"],
                "language": r["language"],
                "status": r["status"],
                "durationMs": r["duration_ms"],
                "totalFindings": r["total_findings"],
                "critical": r["critical_count"],
                "high": r["high_count"],
                "medium": r["medium_count"],
                "low": r["low_count"],
                "filesScanned": r["files_scanned"],
                "isDemo": bool(r["is_demo"])
            })
        return results


def delete_scan(scan_id: str) -> bool:
    """Delete a scan from persistent storage"""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
        conn.commit()
        return cursor.rowcount > 0
