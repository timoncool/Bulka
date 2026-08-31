/**
 * Bulka Music AI Agent
 *
 * This module provides the AI assistant functionality for the Bulka music live coding platform.
 * It integrates with the Strudel editor to help users write music code through natural language.
 *
 * Features:
 * - Natural language to music code generation
 * - Documentation search (RAG)
 * - Editor integration (read, write, execute code)
 * - Playback control
 *
 * @module ai-agent
 */

export { SYSTEM_PROMPT } from './system-prompt';
export {
  toolSchemas,
  SOUND_CATEGORIES,
  DRUM_MACHINES,
  type ToolName,
} from './tools';
export {
  KNOWLEDGE_BASE,
  searchKnowledge,
  getKnowledgeByCategory,
  formatKnowledgeForContext,
} from './knowledge';
