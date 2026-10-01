// ─── Study Plan Mock Data ────────────────────────────────────────────────────
export const mockStudyPlan = {
  subject: 'Computer Science',
  topic: 'Data Structures & Algorithms',
  difficulty: 'Intermediate',
  goal: 'Interview Preparation',
  duration: 7,
  dailyStudyTime: '2 hours',
  estimatedTotalHours: 14,
  learningObjectives: [
    'Understand core data structures: arrays, linked lists, trees, graphs',
    'Implement sorting and searching algorithms from scratch',
    'Analyze time and space complexity using Big-O notation',
    'Solve LeetCode-style problems confidently',
    'Apply dynamic programming to common problem patterns',
  ],
  keyConcepts: [
    'Arrays & Strings',
    'Linked Lists',
    'Stacks & Queues',
    'Binary Trees & BST',
    'Hash Tables',
    'Sorting Algorithms',
    'Graph Traversal (BFS/DFS)',
    'Dynamic Programming',
  ],
  dailySchedule: [
    { day: 1, title: 'Arrays & Strings', duration: '2 hrs', topics: ['Array manipulation', 'Two-pointer technique', 'Sliding window'], status: 'completed' },
    { day: 2, title: 'Linked Lists', duration: '2 hrs', topics: ['Singly & doubly linked lists', 'Reversal', 'Cycle detection'], status: 'completed' },
    { day: 3, title: 'Stacks & Queues', duration: '2 hrs', topics: ['Stack operations', 'Queue operations', 'Monotonic stack'], status: 'in-progress' },
    { day: 4, title: 'Trees & BST', duration: '2 hrs', topics: ['Tree traversals', 'BST insert/delete', 'Balanced trees'], status: 'upcoming' },
    { day: 5, title: 'Hash Tables & Graphs', duration: '2 hrs', topics: ['Hash map design', 'BFS & DFS', 'Topological sort'], status: 'upcoming' },
    { day: 6, title: 'Sorting & Searching', duration: '2 hrs', topics: ['Merge sort', 'Quick sort', 'Binary search'], status: 'upcoming' },
    { day: 7, title: 'Dynamic Programming', duration: '2 hrs', topics: ['Memoization', 'Tabulation', 'Classic DP problems'], status: 'upcoming' },
  ],
};

// ─── AI Notes Mock Data ──────────────────────────────────────────────────────
export const mockNotes = {
  topic: 'Binary Search Trees',
  difficulty: 'Intermediate',
  sections: {
    overview: `A Binary Search Tree (BST) is a node-based binary data structure where each node has a value, a left subtree, and a right subtree. The key property is that for any node, all values in its left subtree are less than the node's value, and all values in the right subtree are greater. This ordering makes BSTs extremely efficient for search, insertion, and deletion operations.`,
    keyConcepts: [
      { title: 'Node Structure', description: 'Each node contains a value (key), a pointer to the left child, and a pointer to the right child.' },
      { title: 'BST Property', description: 'Left subtree values < Root value < Right subtree values. This holds recursively for every subtree.' },
      { title: 'Height & Balance', description: 'A balanced BST has height O(log n). An unbalanced BST can degrade to O(n) in the worst case.' },
      { title: 'Tree Traversals', description: 'In-order traversal of a BST yields a sorted sequence. Pre-order and post-order are used for copying and deletion.' },
    ],
    definitions: [
      { term: 'Root', definition: 'The topmost node of the tree with no parent.' },
      { term: 'Leaf', definition: 'A node with no children.' },
      { term: 'Height', definition: 'The number of edges on the longest path from root to a leaf.' },
      { term: 'In-order Successor', definition: 'The node with the smallest value greater than the current node.' },
      { term: 'AVL Tree', definition: 'A self-balancing BST where the height difference between left and right subtrees is at most 1.' },
    ],
    examples: [
      {
        title: 'BST Search — O(log n)',
        code: `function search(node, target) {\n  if (!node || node.val === target) return node;\n  if (target < node.val) return search(node.left, target);\n  return search(node.right, target);\n}`,
      },
      {
        title: 'BST Insert',
        code: `function insert(node, val) {\n  if (!node) return new TreeNode(val);\n  if (val < node.val) node.left = insert(node.left, val);\n  else node.right = insert(node.right, val);\n  return node;\n}`,
      },
    ],
    commonMistakes: [
      'Forgetting that BST operations degrade to O(n) on a skewed tree — always consider self-balancing variants for production.',
      'Confusing in-order (sorted) with pre-order/post-order traversal in problem solutions.',
      'Not handling duplicate values — define a clear policy (left, right, or discard).',
      'Off-by-one errors when finding in-order successor or predecessor.',
    ],
    quickRevision: [
      'BST search/insert/delete: average O(log n), worst O(n)',
      'In-order traversal → sorted array',
      'Use a stack or recursion for DFS traversal',
      'Self-balancing trees (AVL, Red-Black) guarantee O(log n)',
      'Finding min: go left until null; max: go right until null',
    ],
  },
};

// ─── Quiz Mock Data ──────────────────────────────────────────────────────────
export const mockQuizQuestions = [
  {
    id: 1,
    question: 'What is the time complexity of searching in a balanced Binary Search Tree?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correct: 1,
    topic: 'Binary Search Trees',
  },
  {
    id: 2,
    question: 'Which traversal of a BST produces a sorted output?',
    options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
    correct: 2,
    topic: 'Tree Traversals',
  },
  {
    id: 3,
    question: 'What data structure is typically used to implement BFS?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Deque'],
    correct: 1,
    topic: 'Graph Traversal',
  },
  {
    id: 4,
    question: 'What is the worst-case space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 2,
    topic: 'Sorting Algorithms',
  },
  {
    id: 5,
    question: 'Which algorithm is best for finding the shortest path in an unweighted graph?',
    options: ['DFS', 'Dijkstra\'s', 'BFS', 'Bellman-Ford'],
    correct: 2,
    topic: 'Graph Traversal',
  },
  {
    id: 6,
    question: 'What is the average time complexity of insertion in a hash table?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correct: 2,
    topic: 'Hash Tables',
  },
  {
    id: 7,
    question: 'In dynamic programming, what technique stores results of subproblems in a table bottom-up?',
    options: ['Memoization', 'Tabulation', 'Recursion', 'Backtracking'],
    correct: 1,
    topic: 'Dynamic Programming',
  },
  {
    id: 8,
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correct: 2,
    topic: 'Searching Algorithms',
  },
];

// ─── Dashboard Mock Data ─────────────────────────────────────────────────────
export const mockDashboard = {
  studentName: 'Alex',
  currentPlan: {
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms',
    daysLeft: 4,
    totalDays: 7,
    progress: 43,
  },
  overallProgress: {
    topicsStudied: 12,
    quizzesTaken: 5,
    averageScore: 74,
    studyStreak: 3,
  },
  recentQuizzes: [
    { topic: 'Arrays & Strings', score: 87, date: '2 days ago' },
    { topic: 'Linked Lists', score: 75, date: '3 days ago' },
    { topic: 'Binary Trees', score: 62, date: '5 days ago' },
  ],
  topicsStudied: ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Binary Search'],
  weakTopics: [
    { topic: 'Dynamic Programming', score: 45 },
    { topic: 'Graph Algorithms', score: 52 },
    { topic: 'Binary Trees', score: 62 },
  ],
  recommendedActions: [
    { action: 'Review Dynamic Programming concepts', priority: 'high' },
    { action: 'Practice 5 Graph traversal problems', priority: 'high' },
    { action: 'Retake Binary Trees quiz', priority: 'medium' },
    { action: 'Continue Day 3 study plan', priority: 'medium' },
  ],
};
