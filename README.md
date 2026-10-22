# CodeShield AI 🛡️⚡
> **Developer Security & Change-Impact Console**  
> Powered by Syntax-Aware AST Scanning, Graphify Knowledge Graphs, and Kimi AI Reasoning.

---

## 🌟 Executive Overview

**CodeShield AI** bridges the gap between static vulnerability detection and actionable architectural remediation. Rather than overwhelming developers with isolated lists of file warnings, CodeShield AI:
1. **Detects High-Risk Flaws**: Identifies SQL injections, command execution sinks, hardcoded credentials, and insecure deserialization using syntax-aware AST pattern matching and rule validation.
2. **Maps Downstream Blast Radius via Graphify**: Traces calling controllers, middleware filters, and database dependencies so you immediately see which routes expose the vulnerability.
3. **Explains & Proposes Fixes with Kimi AI**: Grounds remediation in scanner evidence using Kimi AI (via DigitalOcean Serverless Inference with `kimi-k3` or Direct Kimi API `moonshot-v1-8k`).
4. **Security Fix Impact Advisor**: Inspects the proposed code fix against the Graphify call graph to suggest which connected components, routes, and tests need verification before merging.
5. **Persistent Scan History**: Automatically stores scan records, findings, and graph topologies in a local SQLite database (`backend/data/codeshield.db`).
6. **Protects Limited Cloud Credits**: Enforces strict on-demand inference, SHA-256 deduplication caching, and session token budgeting.
7. **Visual Security Explainer (Beginner-Friendly)**: Interactive 4-step graphical flow breaking down how vulnerabilities occur, who is affected, worst-case consequences, everyday analogies, and interactive before/after shielded simulations for non-security users.

---

## 🎨 Visual Security Explainer

For developers or stakeholders without a cybersecurity background, reading technical scanner outputs can be daunting. CodeShield AI introduces the **Visual Security Explainer**:

- **Dual-Mode Interactive Simulation**:
  - 🔓 **"How It Breaks" (Attack Flow)**: Step-by-step interactive pipeline tracing from the attacker's input origin, to the unshielded code flaw, to execution, and final data compromise.
  - 🛡️ **"How We Shield It" (Defense Flow)**: Shows how parameterization and defense-in-depth neutralizes the threat, safely quarantining input data.
- **Everyday Analogies**: Translates abstract vulnerabilities into relatable concepts (e.g., SQLi as *an altered bank check*, Command Injection as *handing a cashier a note with extra demands*, Hardcoded Secrets as *taping house keys to the doorknob*).
- **Interactive Step Simulator**: Click through each step to inspect simulated data payloads, affected components, worst-case consequences, and the golden remediation rule.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User["👨‍💻 Developer / Judge"] -->|Upload .py or .zip Archive| Frontend["React + Vite UI (Tailwind CSS)"]
    Frontend -->|POST /api/scans or /upload| FastAPI["FastAPI Backend (Python 3.11)"]
    
    subgraph AnalysisEngine["Dual-Stage Analysis Engine"]
        FastAPI -->|1. Sandboxed Extraction| Sandbox["Isolated Temp Workspace"]
        Sandbox -->|2. Detect Vulnerabilities| Scanner["Syntax-Aware AST Security Scanner"]
        Sandbox -->|3. Map Code Relationships| Graphify["Graphify Adapter & Call-Tree Engine"]
    end
    
    subgraph ImpactLayer["Impact & AI Advisor Layer"]
        Scanner & Graphify -->|Correlate Findings to Sinks & Callers| Impact["Impact Analysis Service"]
        Impact -->|User clicks 'Explain with Kimi'| Cache{"SHA-256 Cache?"}
        Cache -->|Hit| CachedFix["Cached Zero-Token Response"]
        Cache -->|Miss & Live Key Present| KimiAI["Kimi AI (DigitalOcean or Direct API)"]
        Cache -->|Key Missing / Offline| Fallback["Simulated Development Engine"]
        Impact -->|POST /findings/id/impact| Advisor["Security Fix Impact Advisor"]
    end
    
    FastAPI -->|Persist Scan Record| SQLite[("SQLite Database: codeshield.db")]
    FastAPI -->|Structured JSON Report| Frontend
    Frontend -->|Render Interactive Blast Radius| ReactFlow["React Flow Graph Visualization"]
```

---

## 🔬 Core Technology Roles & Honest Attribution

| Technology | Implementation Status | Exact Role in CodeShield AI |
| :--- | :--- | :--- |
| **Console UI** | ✅ Fully Working | React 19 + Vite + Tailwind CSS developer console with dark navy security styling, code editor, severity filters, and React Flow visual graph. |
| **AST Security Scanner** | ✅ Fully Working | Python AST analyzer detecting SQLi, shell command injection, hardcoded credentials (with automated redaction), insecure pickle deserialization, and weak MD5 hashing. Tested with positive & negative test cases. |
| **Graphify** | ✅ Fully Working | Structural code relationship adapter. Uses Graphify CLI if installed; seamlessly falls back to our multi-file AST call-tree & import graph engine to map controllers, services, database sinks, and callers. |
| **Kimi AI Inference** | ✅ Fully Working | Configurable via DigitalOcean Serverless Inference (`kimi-k3`) OR direct Moonshot API (`moonshot-v1-8k`). Provides evidence-grounded risk reasoning and secure code fixes. |
| **Simulated Dev Mode** | ✅ Fully Working | When no API key is configured or offline, deterministic heuristics generate structured responses explicitly labeled `[SIMULATED - DEV MODE]`. Never fabricates live API calls. |
| **Persistent Storage** | ✅ Fully Working | Built-in SQLite database (`backend/data/codeshield.db`) persists scan history, durations, finding counts, and graph data across backend restarts. |

---

## 💰 AI Usage Safeguards & Credit Optimization

AI explanations are user-triggered and protected with rigorous safeguards:

| Safeguard | How It Works | Credit Impact |
| :--- | :--- | :--- |
| **On-Demand Triggering** | Bulk scans do not invoke AI automatically. Users click **Explain with Kimi** only on findings needing reasoning. | Saves **~85-90%** of calls |
| **SHA-256 Response Cache** | Queries are hashed by finding rule, file, line, code context, and model. | Re-running scans consumes **0 tokens** |
| **Concise Grounded Prompts** | Prompts send only affected code context and scanner evidence with strict output limits (max 600 tokens). | Limits prompt and response size |
| **Token Budget Slider** | Users set a session token limit (e.g. 5,000 tokens) in the Credit Optimizer modal. | Prevents runaway usage |
| **Deterministic Fallback** | If credits deplete or no API key is provided, the simulated engine provides guidance with zero crashes. | **100% uptime** |

---

## 🚀 Quick Start Guide (Windows PowerShell)

### Prerequisites
- Node.js 20.19+ or 22.12+ (required by the installed Vite version)
- Python 3.10+ (Tested on Python 3.11.4)

---

### Step 1 — Run the React Frontend
Open Windows PowerShell:
```powershell
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.  
The UI loads immediately with rich mock findings and an interactive React Flow impact graph.

---

### Step 2 — Run the Python FastAPI Backend
Open a second Windows PowerShell terminal:
```powershell
cd backend

# Create virtual environment (optional but recommended)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
- Health Check: **[http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)**

---

### Step 3 — Configure Kimi AI (Optional)
Configure credentials locally in `backend/.env` (never commit this file to Git):

**Option A — DigitalOcean Serverless Inference (kimi-k3):**
```env
AI_PROVIDER=digitalocean
DIGITALOCEAN_INFERENCE_KEY=your_do_model_access_key
DIGITALOCEAN_MODEL=kimi-k3
DIGITALOCEAN_INFERENCE_URL=https://inference.do-ai.run/v1/chat/completions
```

**Option B — Direct Kimi / Moonshot API (moonshot-v1-8k):**
```env
AI_PROVIDER=kimi_direct
KIMI_API_KEY=your_moonshot_api_key
KIMI_BASE_URL=https://api.moonshot.cn/v1/chat/completions
KIMI_MODEL=moonshot-v1-8k
```

*(If no key is configured, CodeShield AI automatically operates in explicit Simulated Development Mode with full functionality).*

---

### Step 4 — Run Automated Test Suite
```powershell
cd backend
python -m pytest tests/ -v
```
*(All 15 automated test cases pass: positive detections, false positive negative checks, zip-slip protection, simulated Kimi AI, Fix Impact advisor, and database persistence).*

---

## 🎯 Concise Judge Demonstration Walkthrough

Follow this step-by-step sequence to demo CodeShield AI:

1. **Open the Dashboard**:
   - Navigate to `http://localhost:5173`.
   - Point out the dark navy developer security console, total findings, critical vulnerability breakdown, and persistent scan history.
2. **Launch a New Scan**:
   - Click **New Scan** in the sidebar.
   - Select the **SQL Injection** preset (or upload `sample-projects/vulnerable_app.py`).
   - Click **Scan Target**. Show the live analysis progress indicator.
3. **Inspect Real Findings & Line Numbers**:
   - The findings table lists detected issues sorted by severity.
   - Point out exact line numbers, OWASP categories (e.g. `A03:2021-Injection`), and rule IDs.
   - Highlight the **redacted secrets** in `sample-projects/vulnerable_app.py` preventing credential exposure.
4. **Explore the Visual Security Explainer (Beginner-Friendly)**:
   - Click any finding and view the **Visual Explainer** tab.
   - Show the interactive 4-stage pipeline: Input Origin ➡️ Code Flaw ➡️ Database Execution ➡️ Data Leak.
   - Toggle **"How We Shield It"** to show the defense flow and read the real-world analogy.
5. **Inspect the Graphify Blast Radius**:
   - Click **Impact Graph** in the sidebar.
   - Demonstrate the interactive React Flow graph showing how public HTTP routes (`POST /api/users/profile`) call the vulnerable sink (`execute_user_query()`).
   - Note the clear distinction between **Verified Relationships** (direct AST calls) and **Inferred Relationships**.
6. **Request On-Demand Kimi AI Reasoning**:
   - In Finding Details, switch to **Remediation & Evidence** and click **Explain with Kimi**.
   - Show the evidence summary, risk explanation, and proposed remediation code.
   - Point out the SHA-256 cache badge: clicking it again costs **0 tokens**.
7. **Demonstrate Security Fix Impact Advisor**:
   - Inside Finding Details, click the **Security Fix Impact Advisor** tab.
   - Click **Run Security Fix Impact Advisor**.
   - Review the breaking change risk tier, connected callers requiring review, and recommended verification tests.
8. **Verify Persistent Scan History**:
   - Click **Scan History** to view the audit record persisted in SQLite (`backend/data/codeshield.db`). Reopen or delete historical scan records.
   - Review the breaking change risk tier, connected callers requiring review, and recommended verification tests.
7. **Verify Persistent Scan History**:
   - Click **Scan History** in the sidebar.
   - Notice the scan record persisted in the local SQLite database with duration, target name, and finding counts.
   - Reopen or delete historical scan records.
8. **Show Safe Execution Safeguards**:
   - Mention the strict security safeguards: no submitted code is ever executed, and zip extraction enforces strict Zip Slip path traversal rejection.

---

## 🛡️ License
MIT License. Built for GDG Hacktober.
