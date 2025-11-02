"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Atom,
  Bolt,
  Brain,
  CircuitBoard,
  CornerDownLeft,
  Fingerprint,
  MessageCircle,
  Orbit,
  Sparkles,
  Workflow as WorkflowIcon
} from "lucide-react";
import clsx from "clsx";

import { formatDistanceToNow } from "date-fns";

type AgentId = "claude" | "gemini" | "chatgpt";
type Participant = AgentId | "user" | "orchestrator";

type Message = {
  id: string;
  from: Participant;
  content: string;
  timestamp: string;
};

type AgentProfile = {
  id: AgentId;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  tone: string;
};

type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: "idle" | "running" | "done";
  eta: string;
};

type InsightPulse = {
  id: string;
  title: string;
  signal: string;
  trend: "up" | "down" | "steady";
  delta: string;
  source: string;
};

const AGENT_PROFILES: AgentProfile[] = [
  {
    id: "claude",
    name: "Claude",
    tagline: "Constitutional reasoning & thoughtful synthesis",
    description:
      "Anthropic-inspired assistant specialising in ethical guardrails, analytical summarisation, and systemic thinking.",
    gradient: "from-indigo-500 via-purple-500 to-cyan-400",
    tone: "reflective"
  },
  {
    id: "gemini",
    name: "Gemini",
    tagline: "Multimodal insights & knowledge retrieval",
    description:
      "Google Gemini-style explorer blending real-time search, document cognition, and synthesis of structured data.",
    gradient: "from-amber-500 via-rose-500 to-sky-500",
    tone: "exploratory"
  },
  {
    id: "chatgpt",
    name: "OpenAI GPT",
    tagline: "Rapid ideation & autonomous tool use",
    description:
      "OpenAI-tuned operator optimised for fast prototyping, API reasoning, and autonomous tool orchestration.",
    gradient: "from-emerald-500 via-blue-500 to-fuchsia-500",
    tone: "decisive"
  }
];

const INITIAL_MESSAGES: Record<Participant, Message[]> = {
  user: [],
  orchestrator: [
    {
      id: crypto.randomUUID(),
      from: "orchestrator",
      content:
        "🧠 Tri-agent fusion online. Claude handles reflective reasoning, Gemini pulls knowledge graphs, GPT orchestrates tool execution.",
      timestamp: new Date().toISOString()
    }
  ],
  claude: [
    {
      id: crypto.randomUUID(),
      from: "claude",
      content:
        "Hello! I focus on layered reasoning and safety. Provide context and constraints, I'll surface structured insights and ethical considerations.",
      timestamp: new Date().toISOString()
    }
  ],
  gemini: [
    {
      id: crypto.randomUUID(),
      from: "gemini",
      content:
        "Gemini node connected. I can traverse knowledge bases, recognise patterns, and return evidence-packed reports.",
      timestamp: new Date().toISOString()
    }
  ],
  chatgpt: [
    {
      id: crypto.randomUUID(),
      from: "chatgpt",
      content:
        "Ready to spin up workflows, generate code, and route tool calls. Ask for automation and I'll blueprint the execution graph instantly.",
      timestamp: new Date().toISOString()
    }
  ]
};

const INITIAL_WORKFLOW: WorkflowStep[] = [
  {
    id: "ingest",
    title: "Context Intake",
    description: "Claude parses objectives, risk surface, and constraints.",
    owner: "Claude",
    status: "idle",
    eta: "12s"
  },
  {
    id: "research",
    title: "Signal Expansion",
    description: "Gemini scans live data sources, embeddings, and vector memory.",
    owner: "Gemini",
    status: "idle",
    eta: "21s"
  },
  {
    id: "plan",
    title: "Plan Synthesis",
    description: "GPT fuses agent output into executable plans & tool calls.",
    owner: "GPT",
    status: "idle",
    eta: "9s"
  },
  {
    id: "execute",
    title: "Autonomous Execution",
    description: "Orchestrator dispatches automations & monitors telemetry.",
    owner: "Orchestrator",
    status: "idle",
    eta: "42s"
  }
];

const INITIAL_PULSES: InsightPulse[] = [
  {
    id: "market",
    title: "Go-to-market narrative ready",
    signal: "Claude structured a 6-part thesis emphasising ethical deployment.",
    trend: "up",
    delta: "+12% clarity",
    source: "Claude reflective lens"
  },
  {
    id: "research",
    title: "11 new citations attached",
    signal: "Gemini fetched cross-domain references and knowledge graph evidence.",
    trend: "up",
    delta: "2.4x evidence",
    source: "Gemini knowledge fabric"
  },
  {
    id: "automation",
    title: "Workflow draft deployed",
    signal: "GPT orchestrated 3 tool invocations and staged deployment scripts.",
    trend: "steady",
    delta: "ready to execute",
    source: "GPT toolchain"
  }
];

const agentTheme = (agent: Participant) => {
  switch (agent) {
    case "claude":
      return "from-indigo-500/40 to-purple-500/30";
    case "gemini":
      return "from-amber-500/40 to-rose-500/30";
    case "chatgpt":
      return "from-emerald-500/40 to-blue-500/30";
    case "orchestrator":
      return "from-cyan-500/40 to-purple-400/30";
    default:
      return "from-slate-500/20 to-slate-700/10";
  }
};

const agentAccent = (agent: Participant) => {
  switch (agent) {
    case "claude":
      return "text-indigo-200 border-indigo-400/40";
    case "gemini":
      return "text-amber-200 border-amber-400/40";
    case "chatgpt":
      return "text-emerald-200 border-emerald-400/40";
    case "orchestrator":
      return "text-cyan-200 border-cyan-400/40";
    default:
      return "text-slate-200 border-slate-600/40";
  }
};

const AGENT_SIGNATURES: Record<AgentId, string[]> = {
  claude: [
    "Synthesising moral guardrails",
    "Highlighting second-order effects",
    "Layered reasoning with transparent logic",
    "Stress-testing assumptions thoughtfully"
  ],
  gemini: [
    "Surfacing multimodal evidence",
    "Cross-referencing live knowledge graphs",
    "Fusing structured & unstructured data",
    "Detecting patterns across domains"
  ],
  chatgpt: [
    "Drafting execution-ready plans",
    "Routing tool calls autonomously",
    "Prototyping code & integrations",
    "Scoping KPI impact rapidly"
  ]
};

const randomFrom = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const synthesiseAgentReply = (
  agent: AgentId,
  prompt: string,
  history: Message[]
): string => {
  const lastTwo = history
    .filter((m) => m.from === "user")
    .slice(-2)
    .map((m) => m.content.trim())
    .join(" • ");

  const signature = randomFrom(AGENT_SIGNATURES[agent]);
  const contextualFragment =
    lastTwo.length > 0
      ? `Context I am carrying forward: ${lastTwo}.`
      : "Awaiting deeper context signals.";

  const agentVoice: Record<AgentId, string> = {
    claude:
      "I'll articulate the layered reasoning path, ensuring the steps remain grounded, transparent, and ethically scoped.",
    gemini:
      "I'll weave in structured findings, live telemetry, and highlight where supplementary evidence boosts confidence.",
    chatgpt:
      "I'll anchor the response to executable workstreams, pointing to APIs, SDKs, or automations you can trigger instantly."
  };

  return `${signature}. ${contextualFragment} You asked: “${prompt.trim()}”. ${agentVoice[agent]}`;
};

const synthesiseOrchestrator = (
  prompt: string,
  agentReplies: { agent: AgentId; content: string }[]
): string => {
  const fusion = agentReplies
    .map(({ agent, content }) => {
      const label = AGENT_PROFILES.find((profile) => profile.id === agent)?.name ?? agent;
      const distilled = content.replace(/^[^\.]+\.\s?/, "");
      return `• ${label}: ${distilled}`;
    })
    .join("\n");

  return [
    "Tri-agent synthesis generated.",
    "Signal map:",
    fusion,
    "Next: choose an automation, or ask the orchestrator to deploy the plan."
  ].join("\n");
};

const MainApp = () => {
  const [messages, setMessages] = useState<Record<Participant, Message[]>>(INITIAL_MESSAGES);
  const [activeAgent, setActiveAgent] = useState<Participant>("orchestrator");
  const [input, setInput] = useState("");
  const [isRunningWorkflow, startTransition] = useTransition();
  const [workflow, setWorkflow] = useState<WorkflowStep[]>(INITIAL_WORKFLOW);
  const [pulses, setPulses] = useState<InsightPulse[]>(INITIAL_PULSES);

  const orderedAgents: Participant[] = ["orchestrator", ...AGENT_PROFILES.map((a) => a.id)];

  const conversation = useMemo(() => messages[activeAgent] ?? [], [messages, activeAgent]);

  const intelligenceScore = useMemo(() => {
    const totalSignals = pulses.length + workflow.filter((step) => step.status === "done").length;
    const progress = workflow.filter((step) => step.status !== "idle").length;
    return Math.min(100, 42 + totalSignals * 9 + progress * 7);
  }, [pulses, workflow]);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const timestamp = new Date().toISOString();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      from: "user",
      content: trimmed,
      timestamp
    };

    setInput("");

    setMessages((prev) => {
      const next: Record<Participant, Message[]> = { ...prev };

      // push to agent timelines
      for (const agent of AGENT_PROFILES.map((profile) => profile.id)) {
        const history = next[agent] ?? [];
        const agentReply: Message = {
          id: crypto.randomUUID(),
          from: agent,
          content: synthesiseAgentReply(agent, trimmed, history),
          timestamp
        };
        next[agent] = [...history, userMessage, agentReply];
      }

      // orchestrator summary
      const orchestratorReply: Message = {
        id: crypto.randomUUID(),
        from: "orchestrator",
        content: synthesiseOrchestrator(trimmed, AGENT_PROFILES.map((agent) => ({
          agent: agent.id,
          content: synthesiseAgentReply(agent.id, trimmed, next[agent.id])
        }))),
        timestamp
      };

      next.orchestrator = [...(next.orchestrator ?? []), userMessage, orchestratorReply];
      return next;
    });

    // refresh pulses with lightweight update
    setPulses((prev) => {
      const newPulse: InsightPulse = {
        id: crypto.randomUUID(),
        title: `Signal unlocked by “${trimmed.slice(0, 24)}${trimmed.length > 24 ? "…" : ""}`,
        signal: "Agents aligned on actionable path, orchestrator ready to deploy.",
        trend: Math.random() > 0.4 ? "up" : "steady",
        delta: Math.random() > 0.6 ? "+18% readiness" : "+9% readiness",
        source: "Fusion engine"
      };

      return [newPulse, ...prev].slice(0, 6);
    });
  };

  const runWorkflow = () => {
    startTransition(() => {
      setWorkflow((prev) => prev.map((step) => ({ ...step, status: "idle" })));

      (async () => {
        for (const step of INITIAL_WORKFLOW) {
          setWorkflow((prev) =>
            prev.map((item) =>
              item.id === step.id ? { ...item, status: "running" } : item
            )
          );

          await new Promise((resolve) => setTimeout(resolve, 800));

          setWorkflow((prev) =>
            prev.map((item) =>
              item.id === step.id ? { ...item, status: "done" } : item
            )
          );
        }
      })();
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPulses((prev) => {
        if (prev.length === 0) return prev;
        const [first, ...rest] = prev;
        const updated: InsightPulse = {
          ...first,
          delta: first.delta.includes("+") ? first.delta : "+5% momentum",
          trend: first.trend === "down" ? "steady" : "up",
          signal: `${first.signal.split(".")[0]}. Fusion loop recalibrated ${new Date().toLocaleTimeString()}.`
        };
        return [updated, ...rest.slice(0, 5)];
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <HeroHeader intelligenceScore={intelligenceScore} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1fr_0.9fr]">
        <ConversationPanel
          orderedAgents={orderedAgents}
          activeAgent={activeAgent}
          onAgentChange={setActiveAgent}
          conversation={conversation}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
        />

        <WorkflowPanel workflow={workflow} onRun={runWorkflow} running={isRunningWorkflow} />

        <InsightPanel pulses={pulses} intelligenceScore={intelligenceScore} />
      </section>
    </main>
  );
};

const HeroHeader = ({ intelligenceScore }: { intelligenceScore: number }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/80 p-[1px] shadow-panel"
    >
      <div className="grid-bg relative flex flex-col gap-6 overflow-hidden rounded-[calc(1.5rem-2px)] bg-gradient-to-r from-surface via-surface/90 to-surface">
        <div className="relative z-10 flex flex-col gap-6 px-10 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-white/70">
              <Sparkles className="h-4 w-4 text-highlight" />
              Agentic Fusion Fabric
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-[2.8rem]">
              One orchestrator, three elite agents — coordinate Claude, Gemini, and GPT inside a single control plane.
            </h1>
            <p className="text-white/70">
              Converse, construct automations, and deploy AI-native workflows with zero context switching. The orchestrator fuses reasoning, search, and execution into a cohesive intelligence stack.
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-center">
            <div className="text-xs uppercase tracking-widest text-white/60">Fusion IQ</div>
            <div className="text-5xl font-bold text-white">{intelligenceScore}</div>
            <div className="text-xs text-white/60">dynamic alignment score</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-highlight">
              <Bolt className="h-4 w-4" /> 3 agents synchronised
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const ConversationPanel = ({
  orderedAgents,
  activeAgent,
  onAgentChange,
  conversation,
  input,
  onInputChange,
  onSend
}: {
  orderedAgents: Participant[];
  activeAgent: Participant;
  onAgentChange: (agent: Participant) => void;
  conversation: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: (event: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5 }}
      className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/80 shadow-panel"
    >
      <header className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
        <div>
          <div className="text-sm font-medium text-white">Conversational Control</div>
          <p className="text-xs text-white/60">Broadcast prompts and watch the triad respond in parallel.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <MessageCircle className="h-4 w-4 text-highlight" /> Live sync
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-white/5 px-6 py-4">
        {orderedAgents.map((agent) => (
          <button
            key={agent}
            onClick={() => onAgentChange(agent)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm transition",
              activeAgent === agent
                ? "border-white/50 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            {agent === "orchestrator"
              ? "Orchestrator"
              : AGENT_PROFILES.find((profile) => profile.id === agent)?.name}
          </button>
        ))}
      </nav>

      <div className="scrollbar-thin relative flex-1 overflow-y-auto px-6 py-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/5" />
        <div className="relative z-10 flex flex-col gap-4">
          {conversation.map((message) => (
            <article key={message.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span
                  className={clsx(
                    "rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest",
                    agentAccent(message.from)
                  )}
                >
                  {message.from === "user"
                    ? "You"
                    : message.from === "orchestrator"
                      ? "Orchestrator"
                      : AGENT_PROFILES.find((profile) => profile.id === message.from)?.name}
                </span>
                <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
              </div>
              <div
                className={clsx(
                  "w-fit max-w-full rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3 text-sm leading-relaxed text-white",
                  agentTheme(message.from)
                )}
              >
                {message.content}
              </div>
            </article>
          ))}

          {conversation.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/50">
              Select an agent to inspect the thread.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSend} className="border-t border-white/5 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3">
          <textarea
            rows={2}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Broadcast a command, ask for analysis, or trigger a workflow…"
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accentMuted text-white shadow-glow transition hover:scale-105"
          >
            <CornerDownLeft className="h-5 w-5" />
          </button>
        </div>
      </form>
    </motion.section>
  );
};

const WorkflowPanel = ({
  workflow,
  onRun,
  running
}: {
  workflow: WorkflowStep[];
  onRun: () => void;
  running: boolean;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/80 shadow-panel"
    >
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h2 className="text-sm font-medium text-white">Automation Canvas</h2>
          <p className="text-xs text-white/60">Blueprints for multi-agent execution. Tap run to simulate orchestration.</p>
        </div>
        <button
          onClick={onRun}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-highlight/80 to-accent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-background shadow-glow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <WorkflowIcon className="h-4 w-4" /> Run Fusion Flow
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <ol className="flex flex-col gap-4">
          {workflow.map((step, index) => (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                "relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4",
                step.status === "done" && "border-green-400/40 bg-green-500/10",
                step.status === "running" && "border-highlight/40 bg-highlight/10"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                      <Fingerprint className="h-3.5 w-3.5 text-highlight" />
                      Step {index + 1}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/50">
                      {step.owner}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-white">{step.title}</h3>
                  <p className="text-sm text-white/60">{step.description}</p>
                </div>
                <StatusBadge status={step.status} />
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <CircuitBoard className="h-4 w-4 text-white/50" />
                ETA {step.eta} • Fusion checkpoint ready
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <footer className="border-t border-white/5 bg-white/5 px-6 py-4 text-xs text-white/60">
        Tip: Ask the orchestrator to &quot;deploy flow&quot; after running to publish an automation into the live stack.
      </footer>
    </motion.section>
  );
};

const StatusBadge = ({ status }: { status: WorkflowStep["status"] }) => {
  const mapper: Record<WorkflowStep["status"], { label: string; dot: string }> = {
    idle: { label: "Idle", dot: "bg-white/30" },
    running: { label: "Executing", dot: "bg-highlight" },
    done: { label: "Complete", dot: "bg-success" }
  };

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
      <span className={clsx("h-1.5 w-1.5 rounded-full", mapper[status].dot)} />
      {mapper[status].label}
    </span>
  );
};

const InsightPanel = ({ pulses, intelligenceScore }: { pulses: InsightPulse[]; intelligenceScore: number }) => {
  const metrics = useMemo(
    () => [
      {
        icon: Brain,
        label: "Reasoning depth",
        value: `${Math.min(100, Math.round(intelligenceScore * 0.88))}p`
      },
      {
        icon: Atom,
        label: "Knowledge coverage",
        value: `${Math.min(100, Math.round(intelligenceScore * 0.74))}%`
      },
      {
        icon: Orbit,
        label: "Automation readiness",
        value: `${Math.min(100, Math.round(intelligenceScore * 0.67))}%`
      }
    ],
    [intelligenceScore]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.45 }}
      className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/80 shadow-panel"
    >
      <header className="border-b border-white/5 bg-white/5 px-6 py-4">
        <h2 className="text-sm font-medium text-white">Fusion Telemetry</h2>
        <p className="text-xs text-white/60">Live signal pulses generated by the autonomous reasoning fabric.</p>
      </header>

      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Icon className="h-4 w-4 text-highlight" />
                {label}
              </div>
              <div className="mt-2 text-xl font-semibold text-white">{value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                recalculates every cycle
              </div>
            </div>
          ))}
        </div>

        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-2">
          {pulses.map((pulse) => (
            <div
              key={pulse.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between text-xs text-white/50">
                <span className="inline-flex items-center gap-2">
                  <Bolt className="h-4 w-4 text-highlight" />
                  {pulse.source}
                </span>
                <span
                  className={clsx(
                    "flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest",
                    pulse.trend === "up" && "text-success border-success/40",
                    pulse.trend === "down" && "text-danger border-danger/40",
                    pulse.trend === "steady" && "text-white/50"
                  )}
                >
                  {pulse.delta}
                </span>
              </div>
              <h3 className="mt-3 text-base font-medium text-white">{pulse.title}</h3>
              <p className="text-sm text-white/60">{pulse.signal}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default MainApp;
