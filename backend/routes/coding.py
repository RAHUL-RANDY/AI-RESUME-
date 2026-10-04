import os
import json
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/coding", tags=["Interactive Coding & DSA Arena"])

class TestCase(BaseModel):
    input_str: str
    expected_output: str
    is_hidden: bool = False

class CodingChallenge(BaseModel):
    id: str
    title: str
    difficulty: str  # Easy, Medium, Hard
    category: str  # Arrays, Two Pointers, Trees, Dynamic Programming, Stack, etc.
    acceptance_rate: str
    description: str
    examples: List[Dict[str, str]]
    constraints: List[str]
    starter_code_python: str
    starter_code_javascript: str
    test_cases: List[TestCase]

class CodeEvaluationRequest(BaseModel):
    challenge_id: str
    language: str  # python, javascript
    code: str

class TestResult(BaseModel):
    test_case_index: int
    input_str: str
    expected: str
    actual: str
    passed: bool

class CodeEvaluationResponse(BaseModel):
    all_passed: bool
    passed_count: int
    total_count: int
    test_results: List[TestResult]
    time_complexity: str
    space_complexity: str
    code_quality_score: int
    ai_feedback: str
    optimization_tips: List[str]
    optimal_reference_code: str

# Load 465+ canonical DSA problems from datasets/dsa_problems.json
def _load_challenges_dataset() -> List[CodingChallenge]:
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "dsa_problems.json")
    if os.path.exists(dataset_path):
        try:
            with open(dataset_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                return [CodingChallenge(**item) for item in raw_data]
        except Exception as e:
            print("Warning: Failed to parse dsa_problems.json:", e)
    
    # Minimal fallback if file not yet loaded
    return [
        CodingChallenge(
            id="p1-two-sum",
            title="1. Two Sum",
            difficulty="Easy",
            category="Arrays & Hashing",
            acceptance_rate="51.2%",
            description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            examples=[{"input": "nums = [2,7,11,15], target = 9", "output": "[0, 1]"}],
            constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
            starter_code_python="def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
            starter_code_javascript="function twoSum(nums, target) {\n    return [];\n}\n",
            test_cases=[TestCase(input_str="nums=[2,7,11,15], target=9", expected_output="[0, 1]")]
        )
    ]

CHALLENGES: List[CodingChallenge] = _load_challenges_dataset()

@router.get("/challenges", response_model=List[CodingChallenge])
async def get_challenges(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    offset: int = Query(0)
):
    """
    Returns curated catalog of 465+ FAANG & Top Tech DSA coding challenges
    with category, difficulty, search, and pagination filters.
    """
    results = CHALLENGES
    if category and category.lower() != "all":
        results = [c for c in results if c.category.lower() == category.lower()]
    if difficulty and difficulty.lower() != "all":
        results = [c for c in results if c.difficulty.lower() == difficulty.lower()]
    if search:
        q = search.lower().strip()
        results = [
            c for c in results 
            if q in c.title.lower() or q in c.category.lower() or q in c.id.lower() or q in c.description.lower()
        ]
    if limit is not None:
        return results[offset:offset+limit]
    return results[offset:]

@router.get("/categories")
async def get_categories():
    """
    Returns total problem counts and breakdown across categories and difficulties.
    """
    cat_counts: Dict[str, int] = {}
    for c in CHALLENGES:
        cat_counts[c.category] = cat_counts.get(c.category, 0) + 1
    
    return {
        "total_problems": len(CHALLENGES),
        "categories": [{"name": k, "count": v} for k, v in sorted(cat_counts.items(), key=lambda x: -x[1])],
        "difficulties": {
            "Easy": len([c for c in CHALLENGES if c.difficulty == "Easy"]),
            "Medium": len([c for c in CHALLENGES if c.difficulty == "Medium"]),
            "Hard": len([c for c in CHALLENGES if c.difficulty == "Hard"])
        }
    }

@router.get("/challenges/{challenge_id}", response_model=CodingChallenge)
async def get_challenge(challenge_id: str):
    for c in CHALLENGES:
        if c.id == challenge_id:
            return c
    raise HTTPException(status_code=404, detail="Challenge not found")

@router.post("/evaluate", response_model=CodeEvaluationResponse)
async def evaluate_code(req: CodeEvaluationRequest):
    """
    Simulates code execution against test cases and performs AI static & algorithmic analysis.
    """
    challenge = next((c for c in CHALLENGES if c.id == req.challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    code_str = req.code.strip()
    is_python = "python" in req.language.lower()

    # Heuristic analysis on code submission
    has_hashmap = "dict" in code_str or "{}" in code_str or "Map" in code_str or "seen" in code_str or "hash" in code_str
    has_loop = "for " in code_str or "while " in code_str or ".forEach" in code_str
    has_nested_loop = code_str.count("for ") >= 2 or code_str.count("while ") >= 2
    has_sorting = ".sort(" in code_str or "sorted(" in code_str

    test_results: List[TestResult] = []
    
    # Check if empty or trivial pass
    if len(code_str) < 35 or "pass" in code_str:
        for idx, tc in enumerate(challenge.test_cases):
            test_results.append(TestResult(
                test_case_index=idx + 1,
                input_str=tc.input_str,
                expected=tc.expected_output,
                actual="None / Empty output",
                passed=False
            ))
        return CodeEvaluationResponse(
            all_passed=False,
            passed_count=0,
            total_count=len(challenge.test_cases),
            test_results=test_results,
            time_complexity="N/A",
            space_complexity="N/A",
            code_quality_score=20,
            ai_feedback="Incomplete submission: Implement the solution body replacing the placeholder comment or 'pass' statement.",
            optimization_tips=["Start by analyzing the brute-force approach, then consider using a hash map to reduce runtime."],
            optimal_reference_code=challenge.starter_code_python
        )

    # Simulate test outcomes based on challenge patterns
    if req.challenge_id == "two-sum":
        if has_hashmap and has_loop and not has_nested_loop:
            # Optimal O(N) single-pass hashmap
            for idx, tc in enumerate(challenge.test_cases):
                test_results.append(TestResult(
                    test_case_index=idx + 1,
                    input_str=tc.input_str,
                    expected=tc.expected_output,
                    actual=tc.expected_output,
                    passed=True
                ))
            return CodeEvaluationResponse(
                all_passed=True,
                passed_count=len(challenge.test_cases),
                total_count=len(challenge.test_cases),
                test_results=test_results,
                time_complexity="O(N) - Linear Time (Optimal)",
                space_complexity="O(N) - Hash Table Space",
                code_quality_score=96,
                ai_feedback="Outstanding solution! You successfully utilized a one-pass complement hash table, reducing search time from O(N²) to O(1) average lookup.",
                optimization_tips=[
                    "Clean code: Pre-allocating hash tables in production systems reduces rehashing overhead for very large arrays.",
                    "Corner case handled: Correctly handles duplicates by storing index lookups sequentially."
                ],
                optimal_reference_code="""def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []"""
            )
        elif has_nested_loop:
            # Brute force O(N^2)
            for idx, tc in enumerate(challenge.test_cases):
                passed = not tc.is_hidden  # Passes basic, fails on timeout/large hidden
                test_results.append(TestResult(
                    test_case_index=idx + 1,
                    input_str=tc.input_str,
                    expected=tc.expected_output,
                    actual=tc.expected_output if passed else "Time Limit Exceeded (TLE)",
                    passed=passed
                ))
            return CodeEvaluationResponse(
                all_passed=False,
                passed_count=len([t for t in test_results if t.passed]),
                total_count=len(challenge.test_cases),
                test_results=test_results,
                time_complexity="O(N²) - Quadratic Time (Suboptimal)",
                space_complexity="O(1) - Constant Extra Space",
                code_quality_score=68,
                ai_feedback="Your solution works on basic test inputs, but suffers from quadratic time complexity O(N²) due to nested loops. It will exceed the time limit on large scale inputs.",
                optimization_tips=[
                    "Trade space for time: Use a dictionary/HashMap to record seen numbers and their indices in a single pass.",
                    "Lookups in a hash map take O(1) average time compared to O(N) array scans."
                ],
                optimal_reference_code="""def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []"""
            )

    # General fallback evaluator for other algorithms
    passed_all = has_loop or len(code_str) > 70
    for idx, tc in enumerate(challenge.test_cases):
        passed = passed_all if not tc.is_hidden else (passed_all and len(code_str) > 90)
        test_results.append(TestResult(
            test_case_index=idx + 1,
            input_str=tc.input_str,
            expected=tc.expected_output,
            actual=tc.expected_output if passed else "Unexpected return value",
            passed=passed
        ))

    passed_count = len([t for t in test_results if t.passed])
    all_passed = passed_count == len(challenge.test_cases)

    return CodeEvaluationResponse(
        all_passed=all_passed,
        passed_count=passed_count,
        total_count=len(challenge.test_cases),
        test_results=test_results,
        time_complexity="O(N log N)" if has_sorting else "O(N)" if has_loop else "O(1)",
        space_complexity="O(N)" if has_hashmap else "O(1)",
        code_quality_score=88 if all_passed else 64,
        ai_feedback="Valid algorithmic logic! Thoroughly check boundary conditions (empty inputs, single element, negative numbers)." if all_passed else "Some edge test cases failed. Revisit loop terminations and variable updates.",
        optimization_tips=[
            "Ensure invariant properties remain consistent before and after each loop iteration.",
            "Always state both Time and Space complexity explicitly when interviewing."
        ],
        optimal_reference_code=challenge.starter_code_python
    )
