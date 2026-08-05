# Master Orchestrator

All AI agents will communicate ONLY through this Master Orchestrator.
Agents must NEVER call each other directly.

Responsibilities:
- Route requests to appropriate agents.
- Manage workflow pipelines.
- Handle agent communication and context passing.
