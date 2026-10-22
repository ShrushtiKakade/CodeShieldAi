import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  Terminal, 
  Database, 
  Key, 
  FileCode, 
  HelpCircle, 
  CheckCircle2, 
  Unlock, 
  Lock, 
  User, 
  Zap, 
  Eye, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function VisualSecurityExplainer({ finding }) {
  const [activeMode, setActiveMode] = useState('attack'); // 'attack' | 'defense'
  const [activeStep, setActiveStep] = useState(0);

  if (!finding) return null;

  const explainerData = getExplainerData(finding);

  const currentSteps = activeMode === 'attack' ? explainerData.attackFlow : explainerData.defenseFlow;
  const currentStep = currentSteps[activeStep] || currentSteps[0];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium mb-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Security Explainer (Beginner-Friendly)</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{explainerData.simpleName}</span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {explainerData.summary}
          </p>
        </div>

        {/* Attack vs Defense Mode Switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveMode('attack');
              setActiveStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'attack'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>How It Breaks</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('defense');
              setActiveStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'defense'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>How We Shield It</span>
          </button>
        </div>
      </div>

      {/* Real-World Analogy Card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-0.5">
            Everyday Analogy
          </span>
          <p className="text-slate-200 text-xs leading-relaxed italic">
            "{explainerData.analogy}"
          </p>
        </div>
      </div>

      {/* Interactive Step-by-Step Flow Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Security Journey (Click a step to inspect)</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Step {activeStep + 1} of {currentSteps.length}
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {currentSteps.map((step, idx) => {
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isCurrent
                    ? activeMode === 'attack'
                      ? 'bg-red-950/30 border-red-500 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10'
                      : 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isCurrent
                      ? activeMode === 'attack' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'
                      : isCompleted
                      ? 'bg-slate-800 text-cyan-400'
                      : 'bg-slate-950 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-base">{step.emoji}</span>
                </div>
                <div className="font-bold text-slate-200 text-xs truncate">
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {step.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Deep-Dive Card */}
      <div className={`p-5 rounded-xl border transition-all ${
        activeMode === 'attack'
          ? 'bg-gradient-to-br from-red-950/20 via-slate-900 to-slate-950 border-red-500/30'
          : 'bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/30'
      }`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentStep.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  Step {activeStep + 1}: {currentStep.phase}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  activeMode === 'attack' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {activeMode === 'attack' ? 'Vulnerable Path' : 'Protected Defense'}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm mt-1">{currentStep.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep(prev => Math.min(currentSteps.length - 1, prev + 1))}
              disabled={activeStep === currentSteps.length - 1}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-slate-300 text-xs leading-relaxed mb-4 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          {currentStep.description}
        </p>

        {/* Visual Simulated Data Box */}
        {currentStep.sampleData && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Simulated Data Payload</span>
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
              {currentStep.sampleData}
            </pre>
          </div>
        )}
      </div>

      {/* Visual Risk & Impact Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Who is Affected?</span>
          <p className="text-white font-medium text-xs flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{explainerData.whoIsAffected}</span>
          </p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Worst-Case Consequence</span>
          <p className="text-red-300 font-medium text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{explainerData.consequence}</span>
          </p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Golden Fix Rule</span>
          <p className="text-emerald-300 font-medium text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{explainerData.goldenRule}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Knowledge mapping for vulnerabilities into accessible visual flows
function getExplainerData(finding) {
  const rule = (finding.ruleId || '').toLowerCase();
  const title = (finding.title || '').toLowerCase();

  // 1. SQL Injection
  if (rule.includes('sqli') || title.includes('sql')) {
    return {
      simpleName: "SQL Injection (Database Command Confusion)",
      summary: "When untrusted text entered by a user is mistakenly treated as programming instructions by the database.",
      analogy: "Like writing a bank check where someone adds extra zeros because the amount wasn't locked in an official security box.",
      whoIsAffected: "All database users & stored records",
      consequence: "Attacker steals passwords or deletes customer databases",
      goldenRule: "Always use parameterized queries (%s placeholders)",
      attackFlow: [
        {
          phase: "Input Origin",
          title: "Attacker Enters Crafted Text",
          subtitle: "Sneaky quote characters in login form",
          emoji: "🎭",
          description: "Instead of typing a real username like 'alice', an attacker types special SQL punctuation like 'admin' OR '1'='1'.",
          sampleData: "HTTP GET /users/search?username=admin' OR '1'='1"
        },
        {
          phase: "Code Flaw",
          title: "Raw String Gluing (No Shield)",
          subtitle: "Python pastes text directly into query",
          emoji: "🧩",
          description: "The application concatenates the text directly into the command string. The database cannot distinguish between the developer's instructions and the attacker's text.",
          sampleData: 'query = f"SELECT * FROM users WHERE name = \'{username}\'"\n# Becomes: SELECT * FROM users WHERE name = \'admin\' OR \'1\'=\'1\''
        },
        {
          phase: "Database Execution",
          title: "Database Executes Altered Logic",
          subtitle: "Command structure is hijacked",
          emoji: "⚙️",
          description: "Because '1'='1' is always true, the database ignores the username check completely and returns every single customer record in the database.",
          sampleData: "DATABASE STATUS: '1'='1' Evaluated as TRUE -> Returned all 20,000 rows"
        },
        {
          phase: "Consequence",
          title: "Unauthorized Access & Data Leak",
          subtitle: "Admin privileges unlocked",
          emoji: "🔓",
          description: "The attacker is logged in as the primary administrator without providing a valid password, obtaining full system access.",
          sampleData: "RESPONSE: 200 OK -> Granted session token: admin_role_superuser"
        }
      ],
      defenseFlow: [
        {
          phase: "Input Origin",
          title: "Attacker Enters Crafted Text",
          subtitle: "Same malicious payload received",
          emoji: "🎭",
          description: "The attacker submits the exact same attack string ('admin' OR '1'='1) aiming to trick the application.",
          sampleData: "HTTP GET /users/search?username=admin' OR '1'='1"
        },
        {
          phase: "Shielded Parameter",
          title: "Parameterized Query Applied",
          subtitle: "Input placed in a quarantined parameter",
          emoji: "🛡️",
          description: "Instead of string gluing, the code uses a placeholder (%s). The database is instructed: 'This value is strictly plain text, never instructions'.",
          sampleData: 'cursor.execute("SELECT * FROM users WHERE name = %s", (username,))'
        },
        {
          phase: "Safe Database Check",
          title: "Database Searches for Literal String",
          subtitle: "Quotes treated as characters, not syntax",
          emoji: "🔒",
          description: "The database looks for a user whose literal username is literally \"admin' OR '1'='1\". It finds 0 records safely.",
          sampleData: "DATABASE STATUS: Searched for literal username -> Found 0 rows. 0 Syntax errors."
        },
        {
          phase: "Safe Outcome",
          title: "Attack Defeated",
          subtitle: "Normal 404 / Invalid Credentials response",
          emoji: "✅",
          description: "The attack fails completely with zero data leaked and zero risk of query manipulation.",
          sampleData: "RESPONSE: 401 Unauthorized -> Invalid credentials."
        }
      ]
    };
  }

  // 2. Command Injection
  if (rule.includes('subprocess') || rule.includes('rce') || title.includes('command')) {
    return {
      simpleName: "Command Injection (Operating System Takeover)",
      summary: "When user input is passed directly to the operating system shell, allowing attackers to run terminal commands on the server.",
      analogy: "Like asking someone to sign your guestbook, and they write 'Also give me your car keys' and you follow it automatically.",
      whoIsAffected: "The entire server and cloud infrastructure",
      consequence: "Attacker gains full shell terminal control of your server",
      goldenRule: "Set shell=False and pass arguments as an explicit array",
      attackFlow: [
        {
          phase: "Input Origin",
          title: "Attacker Injects Semicolon (;)",
          subtitle: "Adds extra operating system command",
          emoji: "⌨️",
          description: "The attacker passes a filename containing a command separator: 'report.pdf ; rm -rf / ; cat /etc/passwd'.",
          sampleData: "filename = 'report.pdf; cat /etc/passwd'"
        },
        {
          phase: "Code Flaw",
          title: "Shell Execution Enabled (shell=True)",
          subtitle: "Invokes bash / cmd with full shell parser",
          emoji: "🐚",
          description: "The application passes the raw string to the operating system shell. The shell sees the semicolon and executes the second command.",
          sampleData: "subprocess.Popen(f'generate_pdf {filename}', shell=True)"
        },
        {
          phase: "OS Hijack",
          title: "Terminal Executes Attacker's Script",
          subtitle: "Operating system runs arbitrary shell commands",
          emoji: "💥",
          description: "The server creates the PDF, then immediately reads and prints out all server passwords and system users.",
          sampleData: "$ cat /etc/passwd -> root:x:0:0:root:/root:/bin/bash"
        },
        {
          phase: "Consequence",
          title: "Remote Code Execution (RCE)",
          subtitle: "Attacker owns the server",
          emoji: "🏴‍☠️",
          description: "The attacker installs remote access backdoors, steals environment variables, and pivots across your cloud network.",
          sampleData: "STATUS: Reverse shell established to attacker_ip:4444"
        }
      ],
      defenseFlow: [
        {
          phase: "Input Origin",
          title: "Attacker Injects Semicolon (;)",
          subtitle: "Attempts to chain commands",
          emoji: "⌨️",
          description: "The attacker attempts to send 'report.pdf; cat /etc/passwd' to compromise the process.",
          sampleData: "filename = 'report.pdf; cat /etc/passwd'"
        },
        {
          phase: "Secure Process Spawning",
          title: "Array Passing without Shell (shell=False)",
          subtitle: "No shell interpreter is invoked",
          emoji: "🛡️",
          description: "The code runs the executable directly and passes the filename as a single immutable argument string. Semicolons are not evaluated.",
          sampleData: "subprocess.run(['generate_pdf', filename], shell=False, check=True)"
        },
        {
          phase: "Safe Error",
          title: "Treated as Plain Literal Filename",
          subtitle: "Program looks for file with literal semicolon in name",
          emoji: "📁",
          description: "The PDF generator simply reports 'File not found: report.pdf; cat /etc/passwd'. No shell command ever executes.",
          sampleData: "TOOL LOG: FileNotFoundError: No such file 'report.pdf; cat /etc/passwd'"
        },
        {
          phase: "Safe Outcome",
          title: "Server Protected",
          subtitle: "Process terminates safely with zero privilege escalation",
          emoji: "✅",
          description: "The system remains secure. The attacker's command was never interpreted by the operating system.",
          sampleData: "STATUS: Process exited cleanly without executing injected commands."
        }
      ]
    };
  }

  // 3. Hardcoded Secrets
  if (rule.includes('secret') || title.includes('secret') || title.includes('token')) {
    return {
      simpleName: "Hardcoded Secret (Committed Master Key)",
      summary: "When confidential API tokens, passwords, or encryption keys are written directly into source files rather than loaded securely from environment variables.",
      analogy: "Like writing your bank account PIN in permanent marker on the cover of your public notebook.",
      whoIsAffected: "All authentication sessions and token holders",
      consequence: "Attacker signs fake admin JWTs and impersonates any user",
      goldenRule: "Load keys from os.environ.get('SECRET_KEY') or a secret vault",
      attackFlow: [
        {
          phase: "Developer Error",
          title: "Secret Written in Code File",
          subtitle: "Developer puts token in config.py for testing",
          emoji: "📝",
          description: "A private key or database password is typed directly into a Python file.",
          sampleData: 'JWT_SECRET = "super_production_secret_key_998811"'
        },
        {
          phase: "Version Control Leak",
          title: "Committed to Git Repository",
          subtitle: "Pushed to GitHub / GitLab history",
          emoji: "🐙",
          description: "The developer commits the code. The secret is now permanently embedded in the Git commit tree and accessible to anyone with read access.",
          sampleData: "git commit -m 'add auth token' -> Pushed to public branch"
        },
        {
          phase: "Attacker Discovery",
          title: "Automated Scraping / Scanning",
          subtitle: "Bot finds secret in repo history",
          emoji: "🤖",
          description: "Automated scanners search commit history and find the private JWT key within seconds.",
          sampleData: "Scanner alert: Found HS256 secret in commit 8a4f12"
        },
        {
          phase: "Consequence",
          title: "Master Forgery & Impersonation",
          subtitle: "Attacker signs their own admin tokens",
          emoji: "👑",
          description: "Using the key, the attacker mints valid JWT tokens claiming to be the CEO or Admin, bypassing all login screens.",
          sampleData: "jwt.encode({'user': 'CEO', 'role': 'admin'}, JWT_SECRET)"
        }
      ],
      defenseFlow: [
        {
          phase: "Externalization",
          title: "Secret Stored in Protected Environment",
          subtitle: "Placed in local .env or Cloud Vault",
          emoji: "🔐",
          description: "The secret is placed in a local .env file that is added to .gitignore, so it can never be committed to Git.",
          sampleData: "# In .env file only (gitignored):\nJWT_SECRET=super_secret_998811"
        },
        {
          phase: "Dynamic Loading",
          title: "Loaded Dynamically at Runtime",
          subtitle: "Code reads from os.environ",
          emoji: "🛡️",
          description: "The source code simply asks the operating system environment for the value when running.",
          sampleData: "JWT_SECRET = os.environ.get('JWT_SECRET')"
        },
        {
          phase: "Safe Repository",
          title: "Git Repository Contains Zero Secrets",
          subtitle: "Only placeholder template in .env.example",
          emoji: "📄",
          description: "Anyone inspecting the GitHub repository sees only clean code with no live credentials or passwords.",
          sampleData: "# In .env.example committed to GitHub:\nJWT_SECRET=your_secret_here"
        },
        {
          phase: "Safe Outcome",
          title: "Zero Token Compromise",
          subtitle: "Keys can be rotated instantly in cloud settings without editing code",
          emoji: "✅",
          description: "Even if source code is made completely open-source, your production keys remain private and secure.",
          sampleData: "STATUS: Zero secrets in version control history."
        }
      ]
    };
  }

  // 4. Insecure Deserialization
  if (rule.includes('pickle') || title.includes('deserialization')) {
    return {
      simpleName: "Insecure Deserialization (Trojan Horse Input)",
      summary: "When the application blindly reconstructs complex code objects from untrusted byte streams using tools like Python pickle.",
      analogy: "Like opening a package from an unknown sender that contains a robot programmed to dismantle your house from the inside.",
      whoIsAffected: "The application runtime process",
      consequence: "Attacker triggers automatic command execution upon reading cookie data",
      goldenRule: "Use safe data formats like JSON instead of pickle",
      attackFlow: [
        {
          phase: "Crafted Payload",
          title: "Attacker Crafts Malicious Pickle",
          subtitle: "Embeds __reduce__ hook in byte stream",
          emoji: "📦",
          description: "Python pickle supports instructions that tell Python to execute a function when unpickling.",
          sampleData: "payload = pickle.dumps(MaliciousObjectWithOSCommand)"
        },
        {
          phase: "Submission",
          title: "Sent via Cookie or Session Header",
          subtitle: "Passed to session restore endpoint",
          emoji: "🍪",
          description: "The attacker sends the serialized payload as a session cookie or POST body.",
          sampleData: "Cookie: session=cos%0Asystem%0A(S'id'%0AtR."
        },
        {
          phase: "Unsafe Unpickling",
          title: "pickle.loads() Executes Hook",
          subtitle: "Python runs the embedded instructions",
          emoji: "💣",
          description: "The server calls pickle.loads(payload). Python faithfully executes the attacker's embedded command during object creation.",
          sampleData: "pickle.loads(payload) -> Triggers os.system('malicious_code')"
        },
        {
          phase: "Consequence",
          title: "Full Server Takeover",
          subtitle: "Remote code execution occurs automatically",
          emoji: "☠️",
          description: "The attacker's script runs with the exact same permissions as your web server.",
          sampleData: "STATUS: Arbitrary bytecode execution achieved."
        }
      ],
      defenseFlow: [
        {
          phase: "Safe Format",
          title: "Replace Pickle with JSON",
          subtitle: "Only pure data is allowed",
          emoji: "📋",
          description: "The application switches to JSON serialization. JSON is strictly a data notation format and has zero ability to execute code.",
          sampleData: "raw_data = json.dumps({'user_id': 123, 'role': 'member'})"
        },
        {
          phase: "Parsing",
          title: "json.loads() Restores Safe Data",
          subtitle: "Cannot instantiate arbitrary Python objects",
          emoji: "🛡️",
          description: "When the server reads the payload, json.loads() creates only basic dictionaries, strings, and numbers.",
          sampleData: "session_dict = json.loads(payload.decode('utf-8'))"
        },
        {
          phase: "Neutralized Payload",
          title: "Attack Strings Treated as Inert Text",
          subtitle: "Any embedded code syntax is just a regular string",
          emoji: "🔒",
          description: "Even if an attacker sends code in the JSON, it is parsed as plain harmless text characters.",
          sampleData: "session_dict['note'] = 'cos\nsystem...' (Plain harmless string)"
        },
        {
          phase: "Safe Outcome",
          title: "Zero Execution Risk",
          subtitle: "Clean, reliable state restoration without remote code risk",
          emoji: "✅",
          description: "Your session store is resilient to object injection attacks.",
          sampleData: "STATUS: Safe structured parsing with 0% execution surface."
        }
      ]
    };
  }

  // Generic fallback for any other vulnerability
  return {
    simpleName: finding.title || "Security Vulnerability Flow",
    summary: finding.reason || "Untrusted user input flows into a sensitive operation without proper verification.",
    analogy: "Like passing a letter directly to a vault manager without inspecting whether it contains an authorization seal.",
    whoIsAffected: "Components calling this function",
    consequence: "Potential unauthorized data modification or security bypass",
    goldenRule: "Validate input boundaries and use safe built-in APIs",
    attackFlow: [
      {
        phase: "Input Origin",
        title: "Untrusted Data Arrives",
        subtitle: "External parameter received",
        emoji: "📥",
        description: "An external user or service sends parameters to the application.",
        sampleData: finding.evidence || "User-supplied parameter"
      },
      {
        phase: "Code Flaw",
        title: "Missing Boundary Check",
        subtitle: "Rule violation in source code",
        emoji: "⚠️",
        description: `Triggered rule ${finding.ruleId || 'security check'}. Untrusted input reaches a sensitive function without adequate sanitization.`,
        sampleData: `File: ${finding.file}:${finding.line}`
      },
      {
        phase: "Impact",
        title: "Security Sink Executed",
        subtitle: "Unintended operation takes place",
        emoji: "🔓",
        description: "The component performs the requested action without verifying authorization boundaries.",
        sampleData: "Action executed with unvalidated parameters."
      },
      {
        phase: "Consequence",
        title: "Potential Security Breach",
        subtitle: "Confidentiality or integrity compromised",
        emoji: "🚨",
        description: "Depending on the component role, this could lead to information disclosure or unauthorized access.",
        sampleData: "Finding Status: Open (Action Required)"
      }
    ],
    defenseFlow: [
      {
        phase: "Input Origin",
        title: "Input Arrives",
        subtitle: "Received from external source",
        emoji: "📥",
        description: "The application receives incoming parameters.",
        sampleData: "Input received"
      },
      {
        phase: "Shield Applied",
        title: "Validation / Parameterization Filter",
        subtitle: "Applies recommended remediation",
        emoji: "🛡️",
        description: finding.recommendation || "Applies boundary check or parameterized execution.",
        sampleData: "Sanitization applied"
      },
      {
        phase: "Safe Handling",
        title: "Guarded Sink Execution",
        subtitle: "Sensitive operation verified",
        emoji: "🔒",
        description: "The component performs the action safely, rejecting malformed inputs.",
        sampleData: "Validation passed safely"
      },
      {
        phase: "Safe Outcome",
        title: "System Resilient & Secure",
        subtitle: "Zero unauthorized consequence",
        emoji: "✅",
        description: "The issue is resolved and the code follows security best practices.",
        sampleData: "STATUS: Secure"
      }
    ]
  };
}

