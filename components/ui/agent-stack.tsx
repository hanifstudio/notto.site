import Image from "next/image";

const agents = [
  { name: "Claude", logo: "/images/agents/claude.png", rotate: -10, lift: 0 },
  { name: "OpenAI", logo: "/images/agents/openai.png", rotate: 6, lift: 6 },
  { name: "Cursor", logo: "/images/agents/cursor.png", rotate: -6, lift: -4 },
  { name: "Lovable", logo: "/images/agents/lovable.png", rotate: 9, lift: 4 },
  { name: "Emergent", logo: "/images/agents/emergent.png", rotate: -13, lift: -2 },
  { name: "Antigravity", logo: "/images/agents/antigravity.png", rotate: 8, lift: 2 },
];

export function AgentStack() {
  return (
    <div className="agent-stack" aria-label={`Works with ${agents.map((a) => a.name).join(", ")}, and more`}>
      {agents.map((agent, i) => (
        <Image
          key={agent.name}
          src={agent.logo}
          alt={agent.name}
          title={agent.name}
          width={36}
          height={36}
          className="agent-stack-icon"
          style={{
            zIndex: i + 1,
            transform: `translateY(${agent.lift}px) rotate(${agent.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
