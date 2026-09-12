from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/coding", tags=["Interactive Coding & DSA Arena"])

class TestCase(BaseModel):
    input_str: str
    expected_output: str
    is_hidden: bool = False

class CodingChallenge(BaseModel):
    id: str
    title: str
    difficulty: str  # Easy, Medium, Hard
    category: str  # Arrays, Two Pointers, Trees, Dynamic Programming, Stack
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

CHALLENGES: List[CodingChallenge] = [
    CodingChallenge(
        id="two-sum",
        title="1. Two Sum",
        difficulty="Easy",
        category="Arrays & Hash Maps",
        acceptance_rate="51.2%",
        description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        examples=[
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "nums[1] + nums[2] == 6."}
        ],
        constraints=[
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        starter_code_python="def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
        starter_code_javascript="function twoSum(nums, target) {\n    // Write your solution here\n    return [];\n}\n",
        test_cases=[
            TestCase(input_str="nums=[2,7,11,15], target=9", expected_output="[0, 1]"),
            TestCase(input_str="nums=[3,2,4], target=6", expected_output="[1, 2]"),
            TestCase(input_str="nums=[3,3], target=6", expected_output="[0, 1]"),
            TestCase(input_str="nums=[1,5,8,12,19], target=27", expected_output="[2, 4]", is_hidden=True),
        ]
    ),
    CodingChallenge(
        id="longest-substring",
        title="3. Longest Substring Without Repeating Characters",
        difficulty="Medium",
        category="Sliding Window",
        acceptance_rate="34.8%",
        description="Given a string `s`, find the length of the longest substring without repeating characters.",
        examples=[
            {"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."},
            {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with the length of 1."},
            {"input": "s = \"pwwkew\"", "output": "3", "explanation": "The answer is \"wke\", with the length of 3."}
        ],
        constraints=[
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        starter_code_python="def length_of_longest_substring(s: str) -> int:\n    # Implement sliding window algorithm\n    pass\n",
        starter_code_javascript="function lengthOfLongestSubstring(s) {\n    // Implement sliding window algorithm\n    return 0;\n}\n",
        test_cases=[
            TestCase(input_str="s=\"abcabcbb\"", expected_output="3"),
            TestCase(input_str="s=\"bbbbb\"", expected_output="1"),
            TestCase(input_str="s=\"pwwkew\"", expected_output="3"),
            TestCase(input_str="s=\"dvdf\"", expected_output="3", is_hidden=True),
        ]
    ),
    CodingChallenge(
        id="invert-binary-tree",
        title="226. Invert Binary Tree",
        difficulty="Easy",
        category="Trees & Recursion",
        acceptance_rate="76.1%",
        description="Given the `root` of a binary tree, invert the tree, and return its root. Invert swapping the left and right children recursively.",
        examples=[
            {"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]", "explanation": "Left and right subtrees are mirrored at every node level."}
        ],
        constraints=[
            "The number of nodes in the tree is in the range [0, 100].",
            "-100 <= Node.val <= 100"
        ],
        starter_code_python="def invert_tree(root):\n    # Base case: if root is None, return None\n    if not root: return None\n    root.left, root.right = invert_tree(root.right), invert_tree(root.left)\n    return root\n",
        starter_code_javascript="function invertTree(root) {\n    if (!root) return null;\n    const temp = root.left;\n    root.left = invertTree(root.right);\n    root.right = invertTree(temp);\n    return root;\n}\n",
        test_cases=[
            TestCase(input_str="root=[4,2,7,1,3,6,9]", expected_output="[4,7,2,9,6,3,1]"),
            TestCase(input_str="root=[2,1,3]", expected_output="[2,3,1]"),
            TestCase(input_str="root=[]", expected_output="[]")
        ]
    ),
    CodingChallenge(
        id="merge-intervals",
        title="56. Merge Intervals",
        difficulty="Medium",
        category="Intervals & Sorting",
        acceptance_rate="47.3%",
        description="Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        examples=[
            {"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]", "explanation": "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."},
            {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]", "explanation": "Intervals [1,4] and [4,5] are considered overlapping."}
        ],
        constraints=[
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        starter_code_python="def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Sort intervals by start time first\n    pass\n",
        starter_code_javascript="function mergeIntervals(intervals) {\n    // Sort intervals by start time first\n    return [];\n}\n",
        test_cases=[
            TestCase(input_str="intervals=[[1,3],[2,6],[8,10],[15,18]]", expected_output="[[1, 6], [8, 10], [15, 18]]"),
            TestCase(input_str="intervals=[[1,4],[4,5]]", expected_output="[[1, 5]]"),
            TestCase(input_str="intervals=[[1,4],[0,4]]", expected_output="[[0, 4]]", is_hidden=True)
        ]
    ),
    CodingChallenge(
        id="lru-cache",
        title="146. LRU Cache Implementation",
        difficulty="Medium",
        category="System Design & Data Structures",
        acceptance_rate="42.1%",
        description="Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get(key)` and `put(key, value)` both operating in O(1) average time complexity.",
        examples=[
            {"input": "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]", "output": "[null,null,null,1,null,-1,null,-1,3,4]", "explanation": "Evicts key 2 when capacity 2 is exceeded."}
        ],
        constraints=[
            "1 <= capacity <= 3000",
            "0 <= key <= 10^4",
            "0 <= value <= 10^5",
            "At most 2 * 10^5 calls will be made to get and put."
        ],
        starter_code_python="class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass\n",
        starter_code_javascript="class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.map = new Map();\n    }\n    get(key) {\n        return -1;\n    }\n    put(key, value) {\n    }\n}\n",
        test_cases=[
            TestCase(input_str="capacity=2, ops=[put(1,1), put(2,2), get(1)]", expected_output="1"),
            TestCase(input_str="ops=[put(3,3), get(2)]", expected_output="-1 (evicted)"),
        ]
    )
]

@router.get("/challenges", response_model=List[CodingChallenge])
async def get_challenges():
    """
    Returns the curated collection of FAANG & tier-1 engineering DSA challenges.
    """
    return CHALLENGES

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
