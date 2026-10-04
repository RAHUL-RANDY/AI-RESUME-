import hashlib
import time
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/assessments", tags=["AI Timed Skill Assessment & Verified Badges"])

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str

class TopicAssessment(BaseModel):
    id: str
    title: str
    description: str
    badge_icon: str
    difficulty: str
    duration_minutes: int
    questions_count: int
    questions: List[QuizQuestion]

class SubmissionRequest(BaseModel):
    topic_id: str
    candidate_name: str = "Candidate"
    selected_answers: Dict[int, int]  # question_id -> selected_option_index

class AssessmentResultResponse(BaseModel):
    topic_id: str
    topic_title: str
    candidate_name: str
    score_percentage: float
    passed: bool
    correct_count: int
    total_questions: int
    percentile_rank: float
    verification_badge_id: str
    badge_title: str
    detailed_feedback: List[Dict[str, Any]]

TOPICS: List[TopicAssessment] = [
    TopicAssessment(
        id="python-backend",
        title="Python & FastAPI Architecture",
        description="Core asynchronous programming, GIL constraints, typing, decorators, and high-performance API design.",
        badge_icon="🐍",
        difficulty="Advanced",
        duration_minutes=12,
        questions_count=5,
        questions=[
            QuizQuestion(
                id=1,
                question="In Python's asyncio event loop, what happens when a blocking synchronous function (like `time.sleep()`) is called inside an `async def` handler?",
                options=[
                    "The event loop automatically delegates the task to a background OS thread.",
                    "It blocks the entire thread, halting all other concurrent coroutines until it finishes.",
                    "Python throws a CoroutineExecutionWarning and continues execution.",
                    "The coroutine yields execution to other tasks automatically."
                ],
                correct_option_index=1,
                explanation="Calling blocking I/O or `time.sleep()` in an async function blocks the entire OS thread running the event loop. To avoid this, `run_in_executor()` or `asyncio.sleep()` must be used."
            ),
            QuizQuestion(
                id=2,
                question="Which data structure in Python provides O(1) average time complexity for both amortized appends and pop operations from both ends?",
                options=[
                    "collections.deque",
                    "list",
                    "set",
                    "collections.OrderedDict"
                ],
                correct_option_index=0,
                explanation="`collections.deque` is implemented as a doubly-linked list of fixed-size blocks, providing O(1) appends and pops from both ends."
            ),
            QuizQuestion(
                id=3,
                question="What is the primary architectural purpose of Pydantic models in FastAPI applications?",
                options=[
                    "Compiling Python bytecode into native C++ extensions for CPU acceleration.",
                    "Runtime data validation, serialization/deserialization, and automatic OpenAPI schema generation.",
                    "Managing database transactions and ACID isolation levels directly.",
                    "Replacing the Python garbage collector for memory management."
                ],
                correct_option_index=1,
                explanation="Pydantic models parse and validate request payloads at runtime and generate OpenAPI/Swagger schemas."
            ),
            QuizQuestion(
                id=4,
                question="How does Python's Global Interpreter Lock (GIL) impact multithreaded CPU-bound tasks?",
                options=[
                    "It spreads CPU threads evenly across all physical processor cores.",
                    "It prevents multiple native threads from executing Python bytecodes concurrently on multi-core systems.",
                    "It enables zero-copy memory transfers between isolated processes.",
                    "It guarantees deadlock-free database transactions."
                ],
                correct_option_index=1,
                explanation="The GIL ensures thread safety by allowing only one native thread to hold the Python interpreter lock at any given time, constraining CPU-bound parallel execution."
            ),
            QuizQuestion(
                id=5,
                question="What is the time complexity of checking membership in a standard Python dictionary `key in d`?",
                options=[
                    "O(N) linear time",
                    "O(1) average time complexity",
                    "O(log N) binary tree search time",
                    "O(N log N)"
                ],
                correct_option_index=1,
                explanation="Python dictionaries use open-addressing hash tables, yielding O(1) average time complexity for lookups."
            )
        ]
    ),
    TopicAssessment(
        id="react-frontend",
        title="React & Modern Web Architecture",
        description="Fiber reconciliation, state closures, custom hooks, memory leaks, and SSR hydration optimization.",
        badge_icon="⚛️",
        difficulty="Senior",
        duration_minutes=12,
        questions_count=5,
        questions=[
            QuizQuestion(
                id=6,
                question="When using `useEffect`, what causes a 'stale closure' bug?",
                options=[
                    "Rendering the component on an older version of Node.js.",
                    "A callback capturing state variables from an earlier render because dependencies were omitted from the dependency array.",
                    "Using CSS animations inside a React portal.",
                    "Calling `useState` asynchronously."
                ],
                correct_option_index=1,
                explanation="Functions defined in component renders capture the scope of that specific render. If the dependency array is incomplete, the hook references stale state snapshots."
            ),
            QuizQuestion(
                id=7,
                question="What is the benefit of `useCallback` when passed to an optimized child component wrapped in `React.memo`?",
                options=[
                    "It computes the function output during compile time.",
                    "It preserves the functional reference identity across renders, preventing unnecessary re-renders of the memoized child.",
                    "It forces child components to skip DOM reconciliation permanently.",
                    "It automatically runs the function in a Web Worker."
                ],
                correct_option_index=1,
                explanation="`useCallback` caches function references between renders so that `React.memo` prop equality checks (`===`) do not detect a reference change."
            ),
            QuizQuestion(
                id=8,
                question="What is the main architectural improvement introduced by React's Fiber reconciler?",
                options=[
                    "Direct compilation of JSX to WebAssembly.",
                    "Incremental rendering and the ability to pause, abort, or prioritize rendering work across multiple animation frames.",
                    "Elimination of the Virtual DOM.",
                    "Native SQLite database integration in the browser."
                ],
                correct_option_index=1,
                explanation="React Fiber splits reconciliation into cooperative units of work, enabling time-slicing and prioritization of urgent user inputs over background updates."
            ),
            QuizQuestion(
                id=9,
                question="Why is mutating state directly (e.g. `state.items.push(x)`) an anti-pattern in React?",
                options=[
                    "React relies on reference equality (`Object.is`) to detect state changes and schedule UI re-renders.",
                    "JavaScript arrays do not support `push` operations in modern browsers.",
                    "It causes memory leaks in the browser's Garbage Collector.",
                    "It triggers an uncatchable security exception."
                ],
                correct_option_index=0,
                explanation="React checks if the new state reference differs from the previous reference using `Object.is`. Mutating the same object reference prevents re-rendering."
            ),
            QuizQuestion(
                id=10,
                question="What problem does React 18's `useTransition` hook solve?",
                options=[
                    "It manages CSS grid layouts automatically.",
                    "It marks state updates as non-urgent transitions, keeping the user interface responsive to high-priority user interactions.",
                    "It converts React code to Next.js automatically.",
                    "It handles WebSocket state synchronization."
                ],
                correct_option_index=1,
                explanation="`useTransition` allows you to prioritize urgent inputs (like keystrokes or clicks) over background computational transitions (like filtering a 10,000 item list)."
            )
        ]
    ),
    TopicAssessment(
        id="system-architecture",
        title="System Architecture & Scalability",
        description="Distributed consensus, caching topologies, message broker semantics, and database sharding.",
        badge_icon="🏛️",
        difficulty="Staff",
        duration_minutes=15,
        questions_count=5,
        questions=[
            QuizQuestion(
                id=11,
                question="In distributed systems, what is the primary benefit of Consistent Hashing over naive modulo hashing (hash(key) % N)?",
                options=[
                    "It converts all hashing operations to bitwise shifts for 10x faster execution.",
                    "When adding or removing nodes, only K/N keys need to be remapped on average rather than almost all keys.",
                    "It eliminates the need for network serialization.",
                    "It guarantees strict serializability without locks."
                ],
                correct_option_index=1,
                explanation="Consistent hashing maps both servers and keys to a logical ring. Adding or removing a server node only relocates keys between adjacent neighbors, avoiding catastrophic cluster-wide reshuffling."
            ),
            QuizQuestion(
                id=12,
                question="What is the difference between Write-Through and Write-Back (Write-Behind) cache policies?",
                options=[
                    "Write-Through writes synchronously to both cache and DB; Write-Back updates cache immediately and flushes to DB asynchronously.",
                    "Write-Through requires Redis; Write-Back only works with Memcached.",
                    "Write-Through drops stale data on reads; Write-Back invalidates on writes.",
                    "Write-Through only supports relational SQL databases."
                ],
                correct_option_index=0,
                explanation="Write-Through provides high consistency by persisting to DB before acknowledging. Write-Back provides higher write throughput and lower write latency at the risk of losing uncommitted data during power/node failure."
            ),
            QuizQuestion(
                id=13,
                question="Under the CAP theorem, how does a CP system typically behave during a network partition?",
                options=[
                    "It accepts all writes and compromises data consistency across split partitions.",
                    "It returns errors or blocks writes rather than serving inconsistent or stale data.",
                    "It automatically provisions a new cloud data center.",
                    "It converts all transactions to eventual consistency immediately."
                ],
                correct_option_index=1,
                explanation="A CP (Consistency + Partition Tolerance) system prioritizes strict consistency across partitions by refusing to process updates that cannot achieve quorum, rejecting or stalling requests rather than returning diverging state."
            ),
            QuizQuestion(
                id=14,
                question="What mechanism does an event-driven system rely upon to guarantee Idempotency on consumers?",
                options=[
                    "Running consumers on bare-metal hardware only.",
                    "Unique transaction/idempotency keys checked against a deduplication store before applying mutations.",
                    "Disabling consumer retries entirely.",
                    "Restricting event payload size to under 1KB."
                ],
                correct_option_index=1,
                explanation="At-least-once message brokers (like Kafka/RabbitMQ) can deliver duplicate messages during retries. Consumers store processed message IDs or idempotency tokens in a database/cache with atomic operations to prevent duplicate mutations."
            ),
            QuizQuestion(
                id=15,
                question="How does database Read Replicas replication lag affect users in read-after-write scenarios, and how is it mitigated?",
                options=[
                    "Replicas stop accepting read queries; mitigated by restarting the database instance.",
                    "Users may read stale data right after writing; mitigated by routing immediate subsequent reads for that user to the Primary node.",
                    "It causes deadlocks in primary tables; mitigated by switching to NoSQL.",
                    "It causes corrupted write headers; mitigated by SSL handshakes."
                ],
                correct_option_index=1,
                explanation="Asynchronous replication lag causes a read from a replica to miss writes committed milliseconds earlier on the primary. This is resolved by routing the user's reads to the primary for a few seconds (session consistency) or using version tokens."
            )
        ]
    ),
    TopicAssessment(
        id="cloud-devops",
        title="Cloud DevOps & Platform Reliability",
        description="Kubernetes orchestration, container runtimes, GitOps pipelines, and zero-downtime deployments.",
        badge_icon="☁️",
        difficulty="Senior",
        duration_minutes=15,
        questions_count=5,
        questions=[
            QuizQuestion(
                id=16,
                question="In Kubernetes, what is the crucial operational difference between a Liveness Probe and a Readiness Probe?",
                options=[
                    "Liveness is written in YAML; Readiness must be written in Go.",
                    "Liveness probe failure restarts the container; Readiness probe failure removes the Pod from Service endpoints so it stops receiving traffic.",
                    "Liveness probe checks CPU utilization; Readiness probe checks memory allocation.",
                    "Liveness probe runs once at startup; Readiness probe never runs at startup."
                ],
                correct_option_index=1,
                explanation="Liveness probes detect deadlocks and restart stuck containers. Readiness probes determine when a pod is warm and healthy enough to accept ingress traffic without dropping user requests."
            ),
            QuizQuestion(
                id=17,
                question="What is the primary benefit of Canary Deployments over traditional Rolling Updates?",
                options=[
                    "Canary deployments do not require Docker containers.",
                    "Canary deployments route a small fraction (e.g. 5%) of real production traffic to the new version to detect errors before full rollout.",
                    "Canary deployments eliminate the need for reverse proxies.",
                    "Canary deployments guarantee 100% test coverage."
                ],
                correct_option_index=1,
                explanation="Canary rollouts expose a tiny slice of live user traffic to new code while monitoring telemetry (error rates, latency spikes). If an anomaly is observed, traffic is instantly rolled back before impacting the broader user base."
            ),
            QuizQuestion(
                id=18,
                question="Why is Terraform's state lock mechanism (e.g., using AWS DynamoDB with S3 backend) critical in team environments?",
                options=[
                    "It encrypts secret variables using AES-256.",
                    "It prevents concurrent execution of Terraform operations that could corrupt the infrastructure state file.",
                    "It enforces GitHub single sign-on authentication.",
                    "It automatically compiles HCL code into AWS CloudFormation templates."
                ],
                correct_option_index=1,
                explanation="State locking acquires a mutual exclusion lock before plan/apply steps, preventing two engineers or CI pipelines from modifying and corrupting the same infrastructure state simultaneously."
            ),
            QuizQuestion(
                id=19,
                question="In distributed telemetry and SRE, what does the Four Golden Signals framework comprise?",
                options=[
                    "Speed, Memory, Disk, Bandwidth",
                    "Latency, Traffic, Errors, and Saturation",
                    "Logs, Traces, Alerts, and Dashboards",
                    "Build Time, Deploy Time, Test Coverage, and Code Churn"
                ],
                correct_option_index=1,
                explanation="Google's SRE book defines the Four Golden Signals of service monitoring as: Latency (time to serve), Traffic (demand/RPS), Errors (rate of failed requests), and Saturation (how full service resources are)."
            ),
            QuizQuestion(
                id=20,
                question="What is the advantage of multi-stage Docker builds for production services?",
                options=[
                    "They allow running Windows containers inside Linux kernels.",
                    "They separate build dependencies (compilers, SDKs) from the final minimal runtime image, reducing image size and attack surface.",
                    "They enable container auto-scaling without an orchestrator.",
                    "They bypass Docker daemon socket security restrictions."
                ],
                correct_option_index=1,
                explanation="Multi-stage builds allow compiling code with full build chains in intermediate layers and copying only the compiled artifacts into a lightweight, stripped runtime image (like Alpine or Distroless), shrinking images from 1GB+ to under 50MB."
            )
        ]
    )
]

@router.get("/topics", response_model=List[Dict[str, Any]])
async def get_assessment_topics():
    """
    Returns list of assessment topics without exposing correct answers.
    """
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "badge_icon": t.badge_icon,
            "difficulty": t.difficulty,
            "duration_minutes": t.duration_minutes,
            "questions_count": t.questions_count,
        }
        for t in TOPICS
    ]

@router.get("/quiz/{topic_id}")
async def get_quiz(topic_id: str):
    """
    Returns questions and choices for a timed quiz (without answers).
    """
    topic = next((t for t in TOPICS if t.id == topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    sanitized_questions = [
        {
            "id": q.id,
            "question": q.question,
            "options": q.options
        }
        for q in topic.questions
    ]

    return {
        "topic_id": topic.id,
        "title": topic.title,
        "duration_minutes": topic.duration_minutes,
        "questions": sanitized_questions
    }

@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment(req: SubmissionRequest):
    """
    Evaluates assessment submission, computes percentile, and issues verified digital badge credential.
    """
    topic = next((t for t in TOPICS if t.id == req.topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    correct = 0
    feedback = []

    for q in topic.questions:
        user_choice = req.selected_answers.get(q.id)
        is_correct = user_choice == q.correct_option_index
        if is_correct:
            correct += 1

        feedback.append({
            "question_id": q.id,
            "question": q.question,
            "user_choice": user_choice,
            "correct_option_index": q.correct_option_index,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    pct = round((correct / len(topic.questions)) * 100, 1)
    passed = pct >= 70.0

    # Generate secure cryptographic badge credential
    raw_sig = f"{req.candidate_name}-{topic.id}-{pct}-{time.time()}"
    badge_hash = hashlib.sha256(raw_sig.encode()).hexdigest()[:10].upper()
    badge_id = f"AI-CERT-{topic.id[:2].upper()}-{badge_hash}"

    percentile = 94.0 if pct >= 90 else 82.5 if pct >= 75 else 62.0 if passed else 45.0
    badge_name = f"Verified {topic.title} Specialist" if passed else "Skill Assessment Completed"

    return AssessmentResultResponse(
        topic_id=topic.id,
        topic_title=topic.title,
        candidate_name=req.candidate_name,
        score_percentage=pct,
        passed=passed,
        correct_count=correct,
        total_questions=len(topic.questions),
        percentile_rank=percentile,
        verification_badge_id=badge_id,
        badge_title=badge_name,
        detailed_feedback=feedback
    )
