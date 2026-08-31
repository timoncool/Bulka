# Quick Reference: AI Prompts Best Practices

## Проанализированные системы (78 промптов)

### Tier 1: Production-grade AI Assistants

| Система | Компания | Специализация | Размер промпта | Ключевая фича |
|---------|----------|---------------|----------------|---------------|
| **Claude Code** | Anthropic | CLI tool | ~200 lines | Extreme conciseness |
| **Cursor Agent 2.0** | Anysphere | IDE integration | ~800 lines | Parallel tools |
| **Devin AI** | Cognition | Autonomous agent | ~400 lines | XML commands |
| **v0** | Vercel | UI generation | ~1200 lines | Design-first |
| **Perplexity** | Perplexity AI | Search assistant | ~200 lines | Citation format |
| **Bolt** | StackBlitz | WebContainer | ~500 lines | Browser-based dev |
| **Cline** | VSCode extension | VSCode agent | ~600 lines | MCP integration |
| **Replit Assistant** | Replit | Online IDE | ~150 lines | Simple & focused |

### Tier 2: Specialized Assistants

| Система | Фокус | Интересная техника |
|---------|-------|-------------------|
| **Windsurf** | AI editor | Context-aware editing |
| **GitHub Copilot** | Code completion | Inline suggestions |
| **Qoder** | Quest-based dev | Gamification |
| **Lovable** | No-code UI | Visual programming |
| **Trae** | Chat + Builder | Dual-mode interface |

### Tier 3: Open Source & Community

- **Bolt** (open source fork)
- **Cline** (ex-Roo-Cline)
- **Codex CLI**
- **Gemini CLI**
- **RooCode**
- **Lumo**

---

## Чек-лист лучших практик

### ✓ Структура промпта

```
□ Четкая identity (2-3 предложения)
□ XML/structured organization
□ Приоритизация (CRITICAL > IMPORTANT > Note)
□ Разделение на логические секции
□ Не более 15% CRITICAL инструкций
```

### ✓ Инструкции для инструментов

```
□ When to use
□ When NOT to use
□ Required parameters
□ Optional parameters
□ 2-3 примера (good + bad)
□ Common mistakes
□ Performance tips
```

### ✓ Communication style

```
□ Определен tone (formal/casual/technical)
□ Определена length (brief/detailed)
□ Markdown formatting rules
□ Status update format
□ Запреты на unnecessary verbosity
```

### ✓ Task management

```
□ Todo system встроен
□ State transitions defined
□ Update frequency specified
□ Priority levels
□ Completion criteria
```

### ✓ Safety & Security

```
□ Refusal policy
□ Destructive operations protection
□ Secrets handling
□ Prompt leak prevention
□ Data privacy rules
```

### ✓ Examples

```
□ Минимум 10 примеров
□ Good + bad pairs
□ Edge cases covered
□ Full workflows shown
□ Reasoning included
```

### ✓ Error handling

```
□ Pre-validation rules
□ Retry strategy (max attempts)
□ Graceful degradation
□ User communication for errors
```

### ✓ Performance

```
□ Parallel execution guidelines
□ Caching strategy
□ Context optimization
□ Tool prioritization
```

---

## Шаблоны промптов

### Identity Template

```xml
<identity>
You are [Name], [role] with expertise in [domain].

Your primary function is to [main task].

Key characteristics:
- [Trait 1]
- [Trait 2]
- [Trait 3]
</identity>
```

### Tool Specification Template

```xml
<tool name="tool_name">
  <description>
    Brief description of what this tool does
  </description>

  <when_to_use>
    • Use case 1
    • Use case 2
    • Use case 3
  </when_to_use>

  <when_not_to_use>
    • Anti-pattern 1 → use [alternative] instead
    • Anti-pattern 2 → use [alternative] instead
  </when_not_to_use>

  <parameters>
    <required>
      - param1: description
      - param2: description
    </required>
    <optional>
      - param3: description (default: value)
    </optional>
  </parameters>

  <examples>
    <good_example>
      [Example with reasoning]
    </good_example>

    <bad_example>
      [Anti-pattern with explanation]
    </bad_example>
  </examples>

  <common_mistakes>
    • Mistake 1: why it's wrong
    • Mistake 2: how to avoid
  </common_mistakes>
</tool>
```

### Example Template

```xml
<example>
  <user_query>
    Specific user request
  </user_query>

  <thinking>
    Internal reasoning process:
    - What do I need to do?
    - What information do I have?
    - What's the best approach?
    - What could go wrong?
  </thinking>

  <assistant_response>
    Step-by-step execution with commentary
  </assistant_response>

  <reasoning>
    Why this approach is correct:
    - Reason 1
    - Reason 2
  </reasoning>

  <outcome>
    Expected result or verification
  </outcome>
</example>
```

### Safety Guard Template

```xml
<safety_guards>
  <refusal_policy>
    REFUSAL_MESSAGE = "[Your refusal message]"

    Refuse when:
    - [Scenario 1]
    - [Scenario 2]

    Response format:
    1. State refusal message
    2. [Optional: Offer alternative]
    3. Do NOT explain why
  </refusal_policy>

  <destructive_operations>
    Require confirmation for:
    - [Operation 1]
    - [Operation 2]

    Confirmation process:
    1. Describe consequences
    2. Request explicit approval
    3. Execute only after "yes"
  </destructive_operations>

  <data_protection>
    NEVER:
    - [Action 1]
    - [Action 2]

    ALWAYS:
    - [Action 1]
    - [Action 2]
  </data_protection>
</safety_guards>
```

---

## Anti-patterns чек-лист

### ❌ Структурные anti-patterns

```
□ Wall of text без структуры
□ Все инструкции одинакового приоритета
□ Противоречивые инструкции
□ Циклические зависимости
□ Отсутствие примеров
```

### ❌ Communication anti-patterns

```
□ Избыточная вежливость
□ Объяснение очевидного
□ Повторение информации
□ Использование только positive examples
□ Длинные отказы с объяснениями
```

### ❌ Technical anti-patterns

```
□ Отсутствие error handling
□ Нет retry strategy
□ Синхронное выполнение параллельных задач
□ Отсутствие validation
□ Нет graceful degradation
```

### ❌ Safety anti-patterns

```
□ Выполнение деструктивных операций без подтверждения
□ Подробные объяснения при отказах
□ Отсутствие secrets protection
□ Нет prompt leak prevention
```

---

## Метрики качества

### Scoring rubric (0-100)

```
Structure (20 points):
□ Clear sections (5)
□ XML organization (5)
□ Prioritization (5)
□ Logical flow (5)

Tools (20 points):
□ Complete specifications (10)
□ Good/bad examples (5)
□ Common mistakes (5)

Communication (15 points):
□ Tone defined (5)
□ Length guidelines (5)
□ Format rules (5)

Safety (20 points):
□ Refusal policy (5)
□ Destructive ops (5)
□ Secrets handling (5)
□ Leak prevention (5)

Examples (15 points):
□ Quantity (≥10) (5)
□ Quality (5)
□ Coverage (5)

Performance (10 points):
□ Parallel execution (5)
□ Optimization (5)

Total: ___ / 100

Grade:
90-100: Excellent
80-89: Good
70-79: Acceptable
<70: Needs improvement
```

---

## Quick wins по системам

### От Claude Code

```
✓ Extreme conciseness
✓ One-word answers when possible
✓ No preamble/postamble
✓ Markdown rendering awareness
✓ Tool batching
```

**Применение:** CLI tools, chat interfaces

### От Cursor Agent

```
✓ Parallel tool execution (3-5x speedup)
✓ Maximize context understanding
✓ Semantic search first
✓ Extensive todos
✓ Code citations with line numbers
```

**Применение:** IDE integrations, code editors

### От Devin AI

```
✓ Thinking tags (mandatory)
✓ XML command structure
✓ Holistic planning
✓ LSP integration
✓ Environment issue reporting
```

**Применение:** Autonomous agents

### От v0

```
✓ Design-first approach
✓ Extensive good/bad examples (50+)
✓ Artifact system
✓ Integration management
✓ Design guidelines
```

**Применение:** UI generation, creative tools

### От Perplexity

```
✓ Citation format
✓ Structured responses
✓ No references section
✓ Query type specialization
✓ Graceful degradation
```

**Применение:** Search, research assistants

### От Bolt

```
✓ WebContainer constraints
✓ Database migration dual-action
✓ Full file writes (no diff)
✓ Chain of thought (2-4 lines)
✓ Critical data preservation
```

**Применение:** Browser-based dev environments

### От Cline

```
✓ Step-by-step with confirmation
✓ File editing strategy
✓ Auto-formatting awareness
✓ MCP integration
✓ Plan vs Act modes
```

**Применение:** VSCode extensions, iterative work

---

## Pattern matching guide

### Ваш use case → Лучшие паттерны

```
CLI Tool:
  └─ Claude Code patterns
     • Extreme conciseness
     • Tool batching
     • Minimal examples

IDE Integration:
  └─ Cursor + Cline patterns
     • Parallel execution
     • Code citations
     • LSP integration

Autonomous Agent:
  └─ Devin patterns
     • Thinking tags
     • Holistic planning
     • Environment handling

UI Generator:
  └─ v0 patterns
     • Design-first
     • Extensive examples
     • Artifact system

Search/Research:
  └─ Perplexity patterns
     • Citation format
     • Structured responses
     • Query specialization

Chat Assistant:
  └─ Mix of Claude Code + Cursor
     • Brief responses
     • Helpful context
     • Progressive disclosure

Web Development:
  └─ Bolt + v0 patterns
     • WebContainer awareness
     • Full file writes
     • Design system
```

---

## Быстрая диагностика

### Симптом → Решение

```
Медленные ответы:
  → Добавить parallel tool execution
  → Оптимизировать context gathering
  → Кэширование частых запросов

Неполные решения:
  → Добавить todo system
  → Thinking tags перед критическими решениями
  → Более детальные примеры

Inconsistent quality:
  → Больше examples (good + bad)
  → Clearer guidelines
  → Priority levels

Ошибки безопасности:
  → Safety guards
  → Destructive ops confirmation
  → Secrets detection

Путаница с инструментами:
  → When to use / not to use
  → More examples
  → Common mistakes section

Длинные, многословные ответы:
  → Conciseness guidelines
  → Example brevity
  → Length limits

Пропущенные edge cases:
  → Pre-validation
  → Retry strategy
  → Graceful degradation
```

---

## Версионирование промптов

### Recommended versioning scheme

```
v[MAJOR].[MINOR].[PATCH]

MAJOR: Breaking changes (structure, critical rules)
MINOR: New features (tools, capabilities)
PATCH: Bug fixes (examples, clarifications)

Example:
v1.0.0 → Initial release
v1.1.0 → Added thinking tags
v1.1.1 → Fixed examples
v2.0.0 → Restructured with XML
```

### Change tracking

```typescript
interface PromptVersion {
  version: string;
  date: string;
  changes: string[];
  metrics: {
    before: PromptMetrics;
    after: PromptMetrics;
    improvement: number;
  };
  rollback?: string; // Previous stable version
}
```

---

## Дальнейшее чтение

### Полные документы

1. **ai-prompts-analysis.md** - Детальный анализ всех паттернов
2. **prompts-comparison-examples.md** - Прямые сравнения
3. **prompts-implementation-guide.md** - Пошаговое внедрение

### Внешние ресурсы

- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Cursor Documentation](https://docs.cursor.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### Community

- GitHub: Проанализированные промпты в /tmp/system-prompts-repo
- Discord: AI engineering communities
- Twitter: #AIprompting #LLMengineering

---

**Last updated:** 2025-12-10
**Based on:** 78 system prompts from leading AI systems
**Maintained by:** Bulka AI Development Team
