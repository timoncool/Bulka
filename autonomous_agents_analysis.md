# Детальный анализ системных промптов автономных AI-агентов

## Источник исследования
Репозиторий: https://github.com/asgeirtj/system_prompts_leaks

Проанализированные агенты:
- **Claude Code** (Anthropic) - автономный агент для разработки
- **Claude Code Plan Mode** - режим планирования
- **Warp 2.0 Agent** - терминальный AI-агент
- **OpenAI Canvas/Canmore** - инструмент для итеративной работы с кодом
- **OpenAI Deep Research** - автономный исследовательский агент
- **Claude Opus Thinking** - режим многоступенчатого рассуждения

---

## 1. ПАТТЕРНЫ АВТОНОМНОГО ВЫПОЛНЕНИЯ ЗАДАЧ

### 1.1 Принцип "Спроси-Спланируй-Выполни"

**Claude Code Plan Mode** использует строгое разделение фаз:
```
КРИТИЧЕСКОЕ ОГРАНИЧЕНИЕ:
"The user indicated that they do not want you to execute yet --
you MUST NOT make any edits, run any non-readonly tools"

ОБЯЗАТЕЛЬНЫЕ ДЕЙСТВИЯ:
"MUST use a single Task tool call with Plan subagent type to
gather information"

ВЫХОД ИЗ ПЛАНИРОВАНИЯ:
"Do NOT make any file changes or run any tools that modify
the system state in any way until the user has confirmed the plan"
```

**Ключевой инсайт:** Полное разделение планирования и выполнения. Инструкция "supersedes any other instructions" — предотвращает преждевременные изменения независимо от других директив.

### 1.2 Параллельное выполнение независимых операций

**Claude Code CLI Tools** - паттерн параллельных вызовов:
```
ПАТТЕРН: "When multiple independent pieces of information are
requested and all commands are likely to succeed, run multiple
tool calls in parallel for optimal performance"

ПРИМЕРЫ:
- git status + git diff + git log (одновременно)
- Множественные Glob/Grep вызовы для параллельного поиска
- Несколько Task агентов запускаются конкурентно
```

**Реализация:**
```python
# ПРАВИЛЬНО - параллельные независимые вызовы
<invoke Bash>git status</invoke>
<invoke Bash>git diff</invoke>
<invoke Bash>git log</invoke>

# НЕПРАВИЛЬНО - последовательно когда можно параллельно
<invoke Bash>git status && git diff && git log</invoke>
```

### 1.3 Последовательное выполнение зависимых операций

**Паттерн цепочки команд:**
```bash
# Зависимые команды - используй &&
git add . && git commit -m "message" && git push

# Независимые, но последовательные - используй ;
mkdir dir ; cd dir ; ls
```

### 1.4 Автономное принятие решений с ограничениями

**Claude Code - проактивность с границами:**
```
"Be proactive only when asked; balance action with user expectations"

АВТОМАТИЧЕСКИЕ ДЕЙСТВИЯ (без запроса):
- Lint и typecheck после изменений кода (обязательно)
- Минимизация output tokens (1-3 предложения когда возможно)

ТРЕБУЮТ ПОДТВЕРЖДЕНИЯ:
- Создание git коммитов (NEVER commit unless explicitly asked)
- Push в репозиторий
- Добавление команд в CLAUDE.md
```

### 1.5 Делегирование задач суб-агентам

**Task Tool - типы автономных агентов:**
```
ТИПЫ АГЕНТОВ:
1. general-purpose - полный доступ ко всем инструментам
2. Explore - исследование кодовой базы (Glob, Grep, Read, Bash)
3. statusline-setup - конфигурация (Read, Edit)
4. output-style-setup - стили (Read, Write, Edit, Glob, Grep)

ПАТТЕРН ЗАПУСКА:
"Launch multiple agents concurrently in single message"

ВОЗВРАТ РЕЗУЛЬТАТОВ:
"Agents return single final report (stateless)"

УРОВНИ ТЩАТЕЛЬНОСТИ:
"quick", "medium", "very thorough"
```

**Когда НЕ использовать Task агенты:**
```
ИСПОЛЬЗУЙ ПРЯМЫЕ ИНСТРУМЕНТЫ если:
- Чтение конкретного файла (используй Read)
- Поиск конкретного класса (используй Glob)
- Поиск в 2-3 файлах (используй Read)
```

---

## 2. ОРГАНИЗАЦИЯ РАБОТЫ С ИНСТРУМЕНТАМИ (TOOLS)

### 2.1 Иерархия инструментов и предпочтения

**Warp Agent - строгие правила предпочтений:**
```
ЗАПРЕЩЕНО: cat, grep, find через Bash
ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ:
- read_files вместо cat
- grep tool вместо grep command
- file_glob вместо find
- edit_files для изменения кода
```

**Claude Code - специализированные инструменты > bash:**
```
"Prefer specialized tools over bash commands"

ПРИОРИТЕТ:
Read > cat
Grep > grep/rg command
Glob > find command
Edit > sed/awk
```

### 2.2 Паттерны рабочих процессов

**Паттерн 1: Модификация файлов**
```
Glob (найти файлы) →
Read (изучить содержимое) →
Edit (изменить) →
Bash (протестировать/проверить)
```

**Паттерн 2: Исследование кода**
```
Grep (поиск паттернов) →
Read (просмотр совпадений) →
Glob (найти похожие файлы) →
Execute или Edit
```

**Паттерн 3: Управление сложными задачами**
```
TodoWrite (создать план) →
Task (делегировать исследование) →
AskUserQuestion (уточнить решения) →
Execute changes
```

**Паттерн 4: Фоновое выполнение**
```
Bash с run_in_background=true →
BashOutput (проверить прогресс) →
KillShell (если нужно)
```

### 2.3 Критические ограничения инструментов

**Обязательные правила (system enforced):**
```
| Инструмент | Критическое ограничение |
|-----------|------------------------|
| Write/Edit | MUST read file first (принудительно системой) |
| Edit | old_string должен быть уникален (или replace_all) |
| TodoWrite | Ровно ОДИН task in_progress |
| Bash | Never skip git hooks; never force push main |
| NotebookEdit | Индексация с 0 |
| BashOutput | Возвращает только НОВЫЙ output |
| Grep | По умолчанию "files_with_matches" |
```

### 2.4 Специализация инструментов по домену

**Canvas/Canmore - стратегия обновления кода:**
```
КРИТИЧЕСКАЯ ДИРЕКТИВА:
"ALWAYS REWRITE CODE TEXTDOCS (type='code/*') USING A SINGLE
UPDATE WITH '.*' FOR THE PATTERN"

ФИЛОСОФИЯ:
Полная перезапись кода вместо изолированных правок
для сохранения согласованности
```

**Edit Tool - хирургическая точность:**
```
ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- Требует предварительного read в текущей сессии
- Использует exact string matching (не regex)
- Fail если old_string встречается несколько раз
- Сохраняет точные whitespace из источника

КРИТИЧЕСКОЕ ПРАВИЛО:
"Replace all occurrences" режим для batch операций
типа переименования переменных
```

### 2.5 Условное использование инструментов

**OpenAI Deep Research - когда использовать web:**
```
ИСПОЛЬЗУЙ web tool для:
- Location-dependent queries
- Time-sensitive information
- Niche details
- Accuracy-critical responses

НЕ ИСПОЛЬЗУЙ:
- Deprecated browser tool
```

**GPT-4.5 - ограничения на создание canvas:**
```
СТРОГОЕ ПРАВИЛО:
"canmore.create_textdoc should NEVER be used except when
users EXPLICITLY asks for canvas"

АВТОМАТИЧЕСКИЕ ИНКЛЮДЫ:
"Relevant document sections are automatically included
but additional searches need justification"
```

---

## 3. МЕТОДЫ ПЛАНИРОВАНИЯ

### 3.1 Многоступенчатое исследовательское планирование

**Claude Opus Thinking - структурированный процесс:**
```
1. INITIAL ASSESSMENT
   "Determines query complexity and which tools are needed"

2. PLANNING PHASE
   "Develops a research strategy identifying specific
   information gaps"

3. ITERATIVE EXECUTION
   "Runs multiple tool calls (2-20 depending on complexity),
   refining queries based on results"

4. SYNTHESIS
   "Constructs comprehensive answers from gathered information"
```

**Директива:**
```
"Develop a research plan and identify which available tools
should be used to answer the query optimally"
```

### 3.2 Todo-driven планирование

**TodoWrite Tool - обязательная структура задач:**
```
КОГДА ИСПОЛЬЗОВАТЬ:
- Сложные многоступенчатые задачи (3+ шагов)
- Пользователь предоставляет списки задач
- После получения новых инструкций
- При начале работы над задачей

КРИТИЧЕСКИЕ ПРАВИЛА:
- Ровно ОДИН task со статусом in_progress
- Отмечать completed НЕМЕДЛЕННО, никогда не батчить
- Требуются оба: content (imperative) и activeForm (continuous)
- Отмечать complete только при полном выполнении
```

**Формат задач:**
```json
{
  "content": "Fix authentication bug",
  "activeForm": "Fixing authentication bug",
  "status": "in_progress"
}
```

**Когда НЕ использовать:**
```
ПРОПУСТИ TodoWrite если:
- Одна простая задача
- Тривиальная задача <3 шагов
- Чисто разговорная работа
```

### 3.3 Планирование с уточнением требований

**OpenAI Deep Research - clarification-first approach:**
```
"Users should be asked for additional details when needed
using the clarify_with_text method before initiating
research tasks"

ПРИНЦИП:
Ensure requirements are properly understood upfront
```

**AskUserQuestion - структурированное уточнение:**
```
СПЕЦИФИКАЦИИ:
- 1-4 вопроса за вызов
- 2-4 опции на вопрос
- Заголовок максимум 12 символов
- Метки опций 1-5 слов
- Опция "Other" добавляется автоматически
- multiSelect параметр для множественных ответов

ПАТТЕРН:
Ask clarifying questions →
Collect user choices →
Proceed with informed decisions
```

### 3.4 Декомпозиция задач на управляемые шаги

**Claude Code - разбивка сложных задач:**
```
ДИРЕКТИВА:
"Planning larger tasks into smaller steps and marking
items complete immediately upon finishing"

ПРИМЕР - коммит в git:
1. Run git status, git diff, git log (параллельно)
2. Stage только релевантные файлы
3. Draft commit message с анализом изменений
4. Use HEREDOC для мульти-строчных сообщений
5. Retry один раз если pre-commit hooks изменили файлы
6. Verify с финальным git status
```

**Пример - создание PR:**
```
1. Check branch status, diffs, full commit history (параллельно)
2. Create/push branch если нужно
3. Draft PR summary анализируя ВСЕ коммиты с момента divergence
4. Use gh pr create с HEREDOC форматированием
5. Include test plan checklist
6. Return empty response (пользователь видит output напрямую)
```

### 3.5 Адаптивное планирование на основе контекста

**Warp Agent - классификация запросов:**
```
QUERY CLASSIFICATION:
- Questions (предоставить инструкции)
- Tasks (выполнить действия)

ADJUSTING RESPONSE DETAIL:
"Based on complexity"

UNDERSTANDING BEFORE MODIFICATION:
"Emphasizes understanding existing codebases before modification"
```

---

## 4. ОБРАБОТКА ОШИБОК

### 4.1 Предварительная валидация

**Claude Opus - проверка предпосылок:**
```
"Claude checks for false presuppositions in user messages
before responding, considering that 'the person's message
may contain a false statement or presupposition'"

ПАТТЕРН:
Validate assumptions →
Execute only if valid →
Challenge if invalid
```

### 4.2 Пост-коррекция и самопроверка

**Claude Opus - анализ пользовательских исправлений:**
```
"When users correct Claude, the system requires careful
reconsideration: 'Claude first thinks through the issue
carefully before acknowledging the user, since users
sometimes make errors themselves'"

СТРАТЕГИЯ:
Don't blindly accept corrections →
Analyze correction validity →
Verify with tools if needed
```

### 4.3 Верификация через инструменты

**Claude Opus - tool-based verification:**
```
"For time-sensitive claims or disputed facts, Claude uses
web search to verify information rather than relying on
knowledge cutoff data"

КРИТЕРИИ КАЧЕСТВА:
"Evaluates source credibility and avoids low-quality sources,
prioritizing 'original sources (e.g. company blogs,
peer-reviewed papers, gov sites)'"
```

### 4.4 Обработка ошибок инструментов

**Warp Agent - отказ от небезопасных команд:**
```
"NEVER assist with tasks that express malicious or
harmful intent"

"Refuses to suggest unsafe commands"
```

**Claude Code - объяснение ошибок:**
```
"Explain any command errors to the user"

"Report issues at https://github.com/anthropics/claude-code/issues"
```

### 4.5 Graceful degradation и признание ограничений

**OpenAI Deep Research - прозрачность ограничений:**
```
ERROR HANDLING PRINCIPLES:

1. CAPABILITY ACKNOWLEDGMENT
   "States upfront what it cannot accomplish (charting,
   image saving, authentication-protected sites)"

2. GRACEFUL DEGRADATION
   "When uncertain about concepts, assumes browsing
   requests are appropriate"

3. FORMAT CONSTRAINTS
   "Specific output instructions take precedence over
   default guidelines"

4. TECHNICAL AWARENESS
   "Recognition that certain operations (plotting,
   package installation) will fail"
```

### 4.6 Retry логика с умным восстановлением

**Claude Code - git pre-commit hook recovery:**
```
RETRY LOGIC:
"Retry once if pre-commit hooks modify files, then amend"

SAFETY CHECK перед amend:
- Check authorship: git log -1 --format='%an %ae'
- Check not pushed: git status shows "Your branch is ahead"
- If both true: amend commit
- Otherwise: create NEW commit (never amend others' commits)
```

**Паттерн:**
```python
try:
    git commit -m "message"
except PreCommitHookModifiedFiles:
    if is_safe_to_amend():
        git commit --amend --no-edit
    else:
        git add .
        git commit -m "Fix: Apply pre-commit hook changes"
```

### 4.7 Таймауты и ограничения ресурсов

**Технические спецификации:**
```
BASH EXECUTION:
- Default timeout: 120 seconds
- Max timeout: 600 seconds (10 minutes)
- Output truncated: 30,000 characters

PYTHON EXECUTION:
- Timeout: 60 seconds
- State: Persistent Jupyter environment
- Internet: Disabled

READ OPERATIONS:
- Default: 2000 lines
- Max per line: 2000 characters
- Supports: Images, PDFs, Jupyter notebooks

WEBFETCH:
- Cache: 15-minute self-cleaning
- Auto-upgrade: HTTP → HTTPS
```

### 4.8 Обработка состояния и персистентность

**Stateful vs Stateless:**
```
STATEFUL (persist across calls):
- Bash shell sessions
- Python Jupyter kernel
- File system state

STATELESS (single report):
- Task sub-agents
- WebFetch cache (15 min)

ПАТТЕРН УПРАВЛЕНИЯ СОСТОЯНИЕМ:
"State persists across calls" (Python)
"Agents return single final report (stateless)" (Task)
```

### 4.9 Безопасность и защитные меры

**Claude Code - security boundaries:**
```
REFUSE TO:
- Write malicious code (even if "educational")
- Work on malware files
- Improve malicious code

NEVER:
- Update git config
- Skip git hooks (--no-verify, --no-gpg-sign)
- Force push to main/master
- Amend others' commits
- Use interactive git flags (-i)
```

**Warp Agent - secret handling:**
```
"Handling secrets securely through environment variables"

PATTERN:
Never hardcode credentials →
Always use env vars →
Document env var requirements
```

---

## 5. ПРОДВИНУТЫЕ ПАТТЕРНЫ

### 5.1 Контекстно-зависимое поведение

**GPT-4.5 - адаптация к контексту:**
```
"Ask clarifying questions to deeply understand
the user's intent"

"Tailor responses to specific user needs rather
than generic answers"

"Prioritize being truthful, nuanced, insightful,
and efficient"
```

### 5.2 Минимизация токенов

**Claude Code - эффективность коммуникации:**
```
"Minimize output tokens; answer in 1-3 sentences
when possible"

"Avoid preamble/postamble unless requested"

"Responses should be short and concise for CLI display"
```

### 5.3 Следование существующим паттернам

**Claude Code - code style consistency:**
```
"Follow existing project conventions before writing code"

"Examine neighboring files for patterns"

"Verify library availability; never assume imports exist"

"No comments unless requested or code is complex"
```

**Warp Agent:**
```
"Adhering to established patterns and idioms
in existing projects"
```

### 5.4 Iterative refinement

**Canvas/Canmore - философия итераций:**
```
"Enabling iterative work on documents and code"

CREATION CRITERIA:
"Only when users explicitly request canvas functionality
or intend substantial iteration"

UPDATE STRATEGY:
"Comprehensive rewrites replace isolated edits for
code files to maintain coherence"
```

---

## КЛЮЧЕВЫЕ ВЫВОДЫ

### 1. Архитектурные принципы автономных агентов

**Модульность:**
- Специализированные инструменты для каждой операции
- Четкая иерархия: специализированные > универсальные
- Суб-агенты для делегирования сложных задач

**Безопасность через ограничения:**
- Явные запреты на опасные операции
- Обязательные проверки перед критическими действиями
- Принудительные системные ограничения (не полагаемся только на промпт)

**Прозрачность:**
- Четкое разделение планирования и выполнения
- Явное подтверждение для критических операций
- Признание ограничений и ошибок

### 2. Паттерны управления сложностью

**Декомпозиция:**
- TodoWrite для трекинга multi-step задач
- Task агенты для параллельного исследования
- Явные уровни тщательности (quick/medium/thorough)

**Параллелизация:**
- Независимые операции выполняются параллельно
- Явные указания когда использовать параллельные vs последовательные вызовы
- Множественные суб-агенты конкурентно

**Адаптация:**
- Классификация задач (questions vs tasks)
- Контекстно-зависимое поведение
- Следование существующим паттернам проекта

### 3. Стратегии обработки ошибок

**Превентивные меры:**
- Валидация предпосылок до выполнения
- Явные ограничения на опасные операции
- Таймауты и resource limits

**Реактивные меры:**
- Retry логика с умным восстановлением
- Graceful degradation при недоступности функций
- Прозрачное признание ограничений

**Верификация:**
- Tool-based проверка фактов
- Анализ пользовательских исправлений
- Оценка качества источников

### 4. Коммуникационные стратегии

**Эффективность:**
- Минимизация токенов (1-3 предложения)
- Избегание preamble/postamble
- Структурированные вопросы для уточнения

**Точность:**
- Техническая аккуратность превыше всего
- Цитирование источников
- Честность о неуверенности

**Адаптивность:**
- Соответствие тону пользователя
- Tailored responses vs generic
- Context-aware personalization

---

## ПРАКТИЧЕСКИЕ РЕКОМЕНДАЦИИ ДЛЯ РАЗРАБОТКИ АВТОНОМНЫХ АГЕНТОВ

### 1. Дизайн системы инструментов

✅ **DO:**
- Создавай специализированные инструменты для каждой операции
- Обеспечивай четкую документацию ограничений каждого инструмента
- Реализуй system-enforced constraints для критических операций
- Поддерживай параллельное выполнение независимых операций

❌ **DON'T:**
- Не полагайся только на промпт для критических ограничений
- Не смешивай планирование и выполнение в одном инструменте
- Не делай инструменты слишком универсальными (лучше специализация)

### 2. Планирование и выполнение

✅ **DO:**
- Раздели режимы планирования и выполнения явно
- Требуй подтверждения для критических операций
- Поддерживай итеративное уточнение через structured questions
- Декомпозируй задачи с явным трекингом прогресса

❌ **DON'T:**
- Не начинай выполнение без ясного понимания задачи
- Не делай batch операций для независимых задач (параллель!)
- Не создавай слишком гранулярные или слишком абстрактные планы

### 3. Обработка ошибок

✅ **DO:**
- Валидируй входные данные и предпосылки до выполнения
- Реализуй умную retry логику с проверками безопасности
- Признавай ограничения прозрачно и заранее
- Используй инструменты для верификации фактов

❌ **DON'T:**
- Не игнорируй пользовательские исправления
- Не делай бесконечные retry без escalation
- Не скрывай неудачи в фоновых операциях

### 4. Безопасность

✅ **DO:**
- Явные запреты на категории опасных операций
- Sandbox критических операций (git, exec, file ops)
- Требуй explicit consent для необратимых действий
- Логируй все критические операции

❌ **DON'T:**
- Не предоставляй способы обхода security ограничений
- Не храни чувствительные данные в plain text
- Не выполняй code/commands без понимания их эффекта

---

## АРХИТЕКТУРНЫЕ СХЕМЫ

### Схема 1: Жизненный цикл автономной задачи

```
User Request
     ↓
[Validate & Classify]
     ↓
Is Complex? ──No──→ [Direct Execution] → Result
     ↓ Yes
[Create Plan (TodoWrite)]
     ↓
[Ask Clarifications (AskUserQuestion)]
     ↓
User Confirms? ──No──→ [Refine Plan] ←┐
     ↓ Yes                              │
[Parallel Task Delegation]              │
     ↓                                  │
[Tool Orchestration]                    │
  - Glob/Grep (research)                │
  - Read/Edit (modify)                  │
  - Bash (execute/verify)               │
     ↓                                  │
[Error?] ──Yes──→ [Retry Logic] ───────┘
     ↓ No
[Mark Complete & Report]
     ↓
Next Task or Final Result
```

### Схема 2: Иерархия принятия решений для инструментов

```
Need Operation?
     ↓
Specialized Tool Exists? ──Yes──→ Use Specialized Tool
     ↓ No                         (Read, Edit, Grep, Glob)
Generic Tool Exists? ──Yes──→ Use Generic Tool
     ↓ No                     (Bash, Python)
Delegate to Sub-agent? ──Yes──→ Use Task Tool
     ↓ No                        (Explore, general-purpose)
Ask User for Clarification
```

### Схема 3: Обработка ошибок и восстановление

```
Execute Operation
     ↓
Success? ──Yes──→ Continue
     ↓ No
[Categorize Error]
     ├── Validation Error ──→ Report & Ask Clarification
     ├── Timeout ──→ Retry with longer timeout (if < max)
     ├── Permission Error ──→ Report limitation
     ├── Pre-commit Hook Modified ──→ Smart Retry:
     │                                 - Check if safe to amend
     │                                 - Amend if safe
     │                                 - New commit if not safe
     └── Unknown Error ──→ Report with error details
                           Ask user how to proceed
```

---

## СРАВНИТЕЛЬНАЯ ТАБЛИЦА АГЕНТОВ

| Характеристика | Claude Code | Warp Agent | OpenAI Canvas | Deep Research |
|---------------|-------------|------------|---------------|---------------|
| **Основная цель** | CLI dev tool | Terminal AI | Iterative editing | Autonomous research |
| **Инструментов** | 20+ | 5 core | 3 (create/update/comment) | Research kickoff + web |
| **Параллелизм** | Явная поддержка | Не указан | Sequential updates | Multi-source parallel |
| **Планирование** | TodoWrite + Plan Mode | Query classification | Iteration-based | Clarify-first |
| **Retry логика** | Smart git recovery | Не детализирована | N/A | Graceful degradation |
| **Безопасность** | Строгие git guards | Malicious intent filter | Creation restrictions | Auth-protected deny |
| **Состояние** | Persistent shell/files | Terminal session | Canvas state | Stateless research |
| **Токен минимизация** | Явная (1-3 sent) | Context-based | Comprehensive rewrites | N/A |

---

## ЗАКЛЮЧЕНИЕ

Анализ системных промптов современных автономных агентов выявляет несколько критических паттернов:

1. **Специализация побеждает универсальность** - каждый инструмент делает одну вещь хорошо
2. **Ограничения обеспечивают безопасность** - system-enforced constraints надежнее промптов
3. **Планирование отделено от выполнения** - явные режимы предотвращают преждевременные действия
4. **Параллелизация критична** - независимые операции должны идти параллельно
5. **Прозрачность строит доверие** - признание ограничений важнее их скрытия
6. **Контекст определяет поведение** - адаптация к проекту/пользователю/задаче

Эти паттерны формируют foundation для создания надежных, безопасных и эффективных автономных AI-агентов.
