# Сравнительные примеры промптов AI систем

## Прямое сравнение подходов к одинаковым задачам

### 1. IDENTITY & ROLE DEFINITION

#### Минималистичный подход (Claude Code)
```
You are an interactive CLI tool that helps users with software engineering tasks.
Use the instructions below and the tools available to assist the user.
```

**Преимущества:** Короткий, четкий, без лишнего
**Недостатки:** Мало контекста о capabilities

#### Подробный подход (Cursor Agent)
```
You are an AI coding assistant, powered by GPT-4.1. You operate in Cursor.

You are pair programming with a USER to solve their coding task.
Each time the USER sends a message, we may automatically attach information
about their current state: files open, cursor position, recent files,
edit history, linter errors, and more.

You are an agent - keep going until the query is completely resolved.
Only terminate when you are sure the problem is solved.
```

**Преимущества:** Полный контекст, expectations clear
**Недостатки:** Более verbose

#### Специализированный подход (Devin AI)
```
You are Devin, a software engineer using a real computer operating system.
You are a real code-wiz: few programmers are as talented as you at
understanding codebases, writing functional code, and iterating until correct.
```

**Преимущества:** Устанавливает высокую планку quality
**Недостатки:** Может быть слишком самоуверенным

---

### 2. COMMUNICATION STYLE

#### Краткость (Claude Code)
```
You MUST answer concisely with fewer than 4 lines.
One word answers are best.

Examples:
User: 2 + 2
Assistant: 4

User: is 11 a prime number?
Assistant: Yes
```

#### Narrative (Cursor/Replit)
```
Write updates in a continuous conversational style,
narrating the story of your progress as you go.

Example:
"Let me search for where the load balancer is configured."
"I found the load balancer. Now I'll update replicas to 3."
"My edit introduced a linter error. Let me fix that."
```

#### Запрет на вежливость (Cline)
```
STRICTLY FORBIDDEN from starting with:
- "Great", "Certainly", "Okay", "Sure"

NOT conversational but direct.
BAD: "Great, I've updated the CSS"
GOOD: "I've updated the CSS"
```

**Сравнительная таблица:**

| Система | Стиль | Длина ответа | Тон | Use case |
|---------|-------|--------------|-----|----------|
| Claude Code | Минимум | 1-4 строки | Прямой | CLI быстрые ответы |
| Cursor | Narrative | Средняя | Объясняющий | IDE пошаговая работа |
| Cline | Техничный | Короткая | Прямой без вежливости | VSCode extension |
| Devin | Balanced | Средняя | Профессиональный | Autonomous agent |
| v0 | Краткий | 2-4 предложения | Творческий | UI генерация |

---

### 3. TOOL CALLING PATTERNS

#### Последовательный (Cline)
```xml
You use one tool per message.
Each tool use must be informed by the result of previous tool use.

ALWAYS wait for user confirmation after each tool use.
Never assume success without explicit confirmation.
```

**Workflow:**
```
1. Use tool A
2. Wait for result
3. Analyze result
4. Use tool B based on A's result
5. Wait for result
...
```

#### Параллельный (Cursor Agent)
```xml
<maximize_parallel_tool_calls>
CRITICAL: Invoke all relevant tools concurrently.

DEFAULT TO PARALLEL unless operations MUST be sequential.

Parallel execution can be 3-5x faster.

Example: Reading 3 files = 3 parallel read_file calls
</maximize_parallel_tool_calls>
```

**Workflow:**
```
1. Use tools A, B, C in parallel
2. Wait for all results
3. Analyze combined results
4. Use tools D, E in parallel
...
```

#### Batch подход (Claude Code)
```
When multiple independent pieces of information are requested,
batch your tool calls together for optimal performance.

Example: git status and git diff = single message with two tool calls
```

**Сравнение производительности:**

```
Task: Analyze 5 files for authentication logic

Sequential (Cline):
read_file(auth.js) → wait → read_file(login.js) → wait → ...
Time: ~10 seconds (5 * 2s per call)

Parallel (Cursor):
read_file([auth.js, login.js, session.js, user.js, api.js])
Time: ~2 seconds (max of 5 calls)

Speed improvement: 5x
```

---

### 4. ERROR HANDLING

#### Pre-validation (Cline)
```xml
Before calling a tool, think about:
1. Which parameters are required?
2. Has user provided values?
3. Can we infer missing values?
4. If missing → ask user, DON'T use fillers
</xml>

**Пример:**
```
<thinking>
User asked to create file at path.
Required: file_path, content
Provided: content ✓
Missing: file_path ✗
→ Must ask user for file_path
</thinking>

<ask_followup_question>
<question>Where should I create this file?</question>
</ask_followup_question>
```

#### Post-execution retry (Cursor Agent)
```
If commit fails due to pre-commit hook changes:
1. Retry ONCE
2. If files modified by hook:
   - Check authorship
   - Check not pushed
   - If safe → amend
   - Otherwise → new commit
```

#### Graceful degradation (Perplexity)
```
If search results are empty or unhelpful,
answer the Query as well as you can with existing knowledge.

NEVER say "I don't have enough information"
Try to provide SOME value based on what you know.
```

**Философия отличий:**

| Система | Подход | Когда fail | Retry strategy |
|---------|--------|------------|----------------|
| Cline | Pre-validate | Before execution | Ask user for missing info |
| Cursor | Retry limited | After execution | Max 3 attempts then ask |
| Perplexity | Degrade gracefully | Never hard fail | Use existing knowledge |
| Devin | Report & continue | Environment issues | Report, test via CI instead |
| Claude Code | Offer alternatives | Cannot help | Suggest alternatives, 1-2 sentences |

---

### 5. CODE EDITING APPROACHES

#### Full file replacement (Bolt)
```xml
IMPORTANT: WebContainer CANNOT execute diff or patch editing.
ALWAYS write your code in FULL, no partial/diff updates.

<boltAction type="file" filePath="app.js">
// Entire file content here
// Every single line
// No truncation
</boltAction>
```

#### Targeted replacement (Cline)
```xml
<replace_in_file>
<path>src/App.tsx</path>
<diff>
<<<<<<< SEARCH
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> REPLACE
</diff>
</replace_in_file>
```

#### Smart diff (Cursor Agent)
```xml
<edit_file>
<target_file>app.js</target_file>
<instructions>Add useState import</instructions>
<code_edit>
// ... existing code ...
import React, { useState } from 'react';
// ... existing code ...
export default App;
</code_edit>
</edit_file>
```

**Сравнение по use cases:**

```
Small change (1-5 lines):
✓ Targeted replacement (Cline) - fastest
✓ Smart diff (Cursor) - readable
✗ Full file (Bolt) - wasteful

Medium change (10-50 lines):
✓ Smart diff (Cursor) - balanced
✓ Targeted replacement (Cline) - precise
~ Full file (Bolt) - ok if file is small

Large refactor (50+ lines):
✓ Full file (Bolt) - clearest
~ Smart diff (Cursor) - verbose
✗ Targeted replacement (Cline) - error-prone
```

---

### 6. PLANNING MODES

#### Two-mode system (Cline)
```xml
PLAN MODE:
- Gather information (read_file, search_files)
- Ask clarifying questions
- Architect detailed plan
- Return mermaid diagrams
- Brainstorm with user
- Ask to switch to ACT MODE

ACT MODE:
- Execute plan step-by-step
- Use tools to accomplish task
- attempt_completion when done
```

**Workflow:**
```
User: "Build a todo app"
→ Start in PLAN MODE

[PLAN MODE]
1. Read existing files
2. Ask: "React or Vue?"
3. User: "React"
4. Create plan with mermaid diagram
5. Ask: "Ready to implement?"
→ User switches to ACT MODE

[ACT MODE]
1. Create files
2. Install dependencies
3. Implement features
4. Test
5. attempt_completion
```

#### Todo-based planning (Claude Code)
```
When user provides task:
1. Create todo list with TodoWrite
2. Mark first as in_progress
3. Complete tasks sequentially
4. Mark each completed immediately
5. When all done, present results

No separate planning phase, planning IS the todo list.
```

#### Thinking-first approach (Devin AI)
```xml
<think>
Before acting, reflect:
- What do I know?
- What have I tried?
- How does this align with objective?
- What are the next steps?
</think>

Then suggest_plan if in planning mode.
Otherwise, execute.
```

**Сравнение:**

| Система | Планирование | Execution | Visibility | Best for |
|---------|--------------|-----------|------------|----------|
| Cline | Отдельный режим | После одобрения | Mermaid diagrams | Complex projects |
| Claude Code | Todo list | Immediate | Todo status | Iterative tasks |
| Devin | Think tags | After thinking | XML output | Autonomous work |
| Cursor | Inline todos | Parallel with planning | Task list UI | IDE integration |

---

### 7. SAFETY & REFUSALS

#### Minimal refusal (v0)
```
REFUSAL_MESSAGE = "I'm not able to assist with that."

If user asks for hateful/inappropriate content:
- Respond with REFUSAL_MESSAGE only
- MUST NOT apologize
- MUST NOT explain why
```

**Example:**
```
User: "Create phishing page for Facebook"
Assistant: "I'm not able to assist with that."
```

#### Alternatives offered (Claude Code)
```
If you cannot or will not help with something:
- Do NOT say why or what it could lead to
- Please offer helpful alternatives if possible
- Keep response to 1-2 sentences
- Only use emojis if explicitly requested
```

**Example:**
```
User: "Help me crack this password hash"
Assistant: "I can help with defensive security tasks like analyzing password policies or implementing secure authentication."
```

#### Detailed boundaries (Devin AI)
```xml
<data_security>
- Treat code as sensitive information
- Never share with third parties
- Obtain explicit permission for external communications
- Always follow security best practices
- Never expose or log secrets
- Never commit secrets to repository
</data_security>
```

**Comparison table:**

| Система | Refusal style | Explanation | Alternatives | Use case |
|---------|---------------|-------------|--------------|----------|
| v0 | Minimal | Never | No | User-facing product |
| Claude Code | Brief | No "why" | Sometimes | Developer tool |
| Devin | Detailed | Context in docs | Yes | Enterprise |
| Bolt | Data-first | Critical warnings | Technical | Data safety critical |

---

### 8. EXAMPLES & DOCUMENTATION

#### Minimal examples (Claude Code)
```
User: 2 + 2
Assistant: 4

User: what is 2+2?
Assistant: 4

User: is 11 a prime number?
Assistant: Yes
```

**4 examples total, all simple**

#### Extensive examples (Cursor Agent)
```xml
<example>
User: Add dark mode toggle to settings
Assistant:
*Creates todo list:*
1. Add state management [in_progress]
2. Implement styles
3. Create toggle component
4. Update components
*Begins working in same turn*

<reasoning>
Multi-step feature with dependencies.
</reasoning>
</example>
```

**20+ examples covering edge cases**

#### Scenario-based examples (Devin AI)
```xml
<example>
User: "The text looks bad in dark mode"
Assistant:
<think>Let me first take a screenshot...</think>
*Takes screenshot with InspectSite*
*I can see the contrast issue*
*Calls GrepRepo for theme files*
*Investigates with LSRepo*
Found it! *Fixes text color*
</example>
```

**10+ examples showing full workflows**

#### Anti-pattern examples (v0)
```xml
<bad-example>
Triple backticks with line numbers for inline references:
```12:14:app/Todo.tsx```

Explanation: Takes up entire line in UI
</bad-example>

<good-example>
Single backticks for inline:
The TODO element (`app/Todo.tsx`) contains the bug.
</good-example>
```

**50+ good/bad example pairs**

**Coverage comparison:**

```
Claude Code: 4 examples
- Coverage: Basic queries only
- Complexity: Simple
- Edge cases: None

Cursor Agent: 20 examples
- Coverage: Common workflows
- Complexity: Medium
- Edge cases: Some

Devin AI: 10 examples
- Coverage: Full scenarios
- Complexity: High
- Edge cases: Many

v0: 50+ pairs
- Coverage: Comprehensive
- Complexity: All levels
- Edge cases: Extensive anti-patterns
```

---

### 9. CONTEXT GATHERING

#### File-first (Cline)
```
Before editing any file:
1. list_files to understand structure
2. read_file to get current content
3. Make changes
4. NEVER guess file contents
```

#### Search-first (Cursor Agent)
```xml
<maximize_context_understanding>
Semantic search is MAIN exploration tool:

1. Start with broad query: "authentication flow"
2. NOT specific: "login function"
3. Run MULTIPLE searches with different wording
4. Keep searching until CONFIDENT

TRACE every symbol to definitions and usages.
</maximize_context_understanding>
```

#### LSP-powered (Devin AI)
```xml
<go_to_definition path="/file.py" line="123" symbol="AuthService"/>
<go_to_references path="/file.py" line="123" symbol="AuthService"/>
<hover_symbol path="/file.py" line="123" symbol="AuthService"/>

Use LSP frequently to:
- Pass correct arguments
- Make correct assumptions about types
- Update all references
```

**Speed comparison for "Find all usages of AuthService":**

```
File-first (Cline):
1. list_files → 2s
2. read_file * 10 → 20s
3. Manual search in each
Total: ~30s

Search-first (Cursor):
1. codebase_search("AuthService usage") → 3s
2. read_file * 3 (relevant only) → 6s
Total: ~9s

LSP-powered (Devin):
1. go_to_references → 1s
Total: ~1s
```

---

### 10. SPECIALIZED WORKFLOWS

#### Database migrations (Bolt)
```xml
For EVERY database change:

1. Migration file:
<boltAction type="supabase" operation="migration"
           filePath="/supabase/migrations/create_users.sql">
CREATE TABLE users (...);
</boltAction>

2. Immediate execution:
<boltAction type="supabase" operation="query" projectId="${projectId}">
CREATE TABLE users (...);
</boltAction>

CRITICAL: SQL content IDENTICAL in both
```

#### UI generation (v0)
```xml
Workflow:
1. Call GenerateDesignInspiration
   → Get color palette, typography, layout ideas

2. Call SearchRepo
   → Understand existing components

3. Create files with design system:
   - 3-5 colors max
   - 2 fonts max
   - Mobile-first
   - Tailwind semantic tokens

4. Write 2-4 sentence postamble
```

#### Search responses (Perplexity)
```xml
Structure:
1. Summary (few sentences, no header)
2. ## Sections with Level 2 headers
3. Inline citations12 after each sentence
4. Tables for comparisons
5. Code blocks with syntax highlighting
6. Summary wrap-up (few sentences)

NEVER:
- Start with header
- Include References section
- Say "based on search results"
```

**Domain-specific optimizations:**

| System | Domain | Key optimization | Why it works |
|--------|--------|------------------|--------------|
| Bolt | WebContainer | Full file writes | Diff not supported |
| v0 | UI generation | Design-first approach | Visual quality critical |
| Perplexity | Search | Citation format | Source transparency |
| Devin | Autonomous | Planning mode | Complex tasks need upfront clarity |

---

## KEY INSIGHTS FROM COMPARISONS

### 1. No one-size-fits-all
Каждая система оптимизирована для своего use case:
- **CLI (Claude Code)**: Minimal, fast responses
- **IDE (Cursor)**: Detailed, parallel, integrated
- **Autonomous (Devin)**: Planning, self-sufficient
- **UI (v0)**: Design-first, visual
- **Search (Perplexity)**: Citations, structured

### 2. Trade-offs are real

```
Verbosity ←→ Completeness
Speed ←→ Thoroughness
Autonomy ←→ Control
Flexibility ←→ Consistency
```

Лучшие системы делают осознанный выбор, не пытаются быть всем.

### 3. Context is king

Все системы тратят 30-50% промпта на context gathering:
- File structure
- Search capabilities
- LSP integration
- Browser automation

**Investment in context = Quality of output**

### 4. Safety by default

Все топовые системы:
- ✓ Refuse without explanation
- ✓ Protect destructive operations
- ✓ Never expose secrets
- ✓ Offer alternatives when possible

### 5. Examples matter more than rules

```
Rules: "Be concise"
Examples:
  User: 2+2
  Assistant: 4

→ Examples teach better than any rule
```

v0 с 50+ примерами vs Claude Code с 4:
- v0: Более consistent formatting
- Claude Code: Faster to read, но более variable output

---

## RECOMMENDATIONS FOR BULKA

### Pattern matching analysis

| Pattern | Used by | Применимость для Bulka |
|---------|---------|-------------------------|
| XML structure | Devin, Bolt, Cline | ✓ Высокая - улучшит парсинг |
| Parallel tools | Cursor, Claude Code | ✓ Критическая - ускорение 3-5x |
| Thinking tags | Devin, Cline | ✓ Высокая - улучшит reasoning |
| Two modes | Cline | ~ Средняя - может быть overkill |
| Todo system | Cursor, Claude Code | ✓ Высокая - отслеживание прогресса |
| LSP integration | Devin | ✓ Высокая если есть LSP сервер |
| Browser automation | Cline | ~ Низкая - не основной use case |

### Hybrid approach recommendation

**Bulka optimal strategy:**

```
1. Structure: XML tags (Devin style)
   → Четкая организация

2. Communication: Brief with context (Claude Code)
   → Telegram-friendly краткость

3. Tools: Parallel execution (Cursor)
   → Максимальная скорость

4. Planning: Todo-based (Claude Code)
   → Простота и visibility

5. Safety: Minimal refusal + alternatives (v0 + Claude Code)
   → User-friendly

6. Examples: Extensive with anti-patterns (v0)
   → Consistency через обучение

7. Context: Search-first (Cursor)
   → Быстрое понимание кодовой базы
```

### Phased rollout

**Phase 1 (Quick wins):**
- Add thinking tags requirement
- Implement parallel tool calling
- Restructure with XML sections

**Phase 2 (Medium term):**
- Extensive examples (20+ scenarios)
- Todo system integration
- Anti-pattern documentation

**Phase 3 (Long term):**
- LSP integration
- Dual-mode planning
- Advanced context gathering

---

*Comparative analysis based on 78 system prompts*
*Focus: Practical patterns for production systems*
