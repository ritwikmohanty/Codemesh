/**
 * Topic Mapper - Maps topics across different platforms to unified topics
 * Handles variations in topic naming between LeetCode, Codeforces, etc.
 */

/**
 * Mapping of LeetCode topics to unified topics
 * Maps LeetCode topic names to a normalized form
 */
const leetcodeTopicMap = {
  // Arrays & Strings
  'Array': 'Array',
  'String': 'String',
  'Hash Table': 'Hash Table',
  'Matrix': 'Matrix',
  
  // Math & Numbers
  'Math': 'Math',
  'Number Theory': 'Number Theory',
  'Bit Manipulation': 'Bit Manipulation',
  'Geometry': 'Geometry',
  'Combinatorics': 'Combinatorics',
  
  // Algorithms
  'Dynamic Programming': 'Dynamic Programming',
  'Sorting': 'Sorting',
  'Greedy': 'Greedy',
  'Depth-First Search': 'Depth-First Search',
  'Binary Search': 'Binary Search',
  'Breadth-First Search': 'Breadth-First Search',
  'Two Pointers': 'Two Pointers',
  'Prefix Sum': 'Prefix Sum',
  'Simulation': 'Simulation',
  'Counting': 'Counting',
  'Enumeration': 'Enumeration',
  'Backtracking': 'Backtracking',
  'Divide and Conquer': 'Divide and Conquer',
  'Recursion': 'Recursion',
  'Memoization': 'Memoization',
  'Sliding Window': 'Sliding Window',
  'Topological Sort': 'Topological Sort',
  'Quickselect': 'Quickselect',
  
  // Data Structures
  'Tree': 'Tree',
  'Binary Tree': 'Binary Tree',
  'Binary Search Tree': 'Binary Search Tree',
  'Stack': 'Stack',
  'Queue': 'Queue',
  'Heap (Priority Queue)': 'Heap',
  'Linked List': 'Linked List',
  'Doubly-Linked List': 'Doubly-Linked List',
  'Ordered Set': 'Ordered Set',
  'Monotonic Stack': 'Monotonic Stack',
  'Monotonic Queue': 'Monotonic Queue',
  'Segment Tree': 'Segment Tree',
  'Binary Indexed Tree': 'Binary Indexed Tree',
  'Trie': 'Trie',
  'Union Find': 'Disjoint Set Union',
  
  // Graphs
  'Graph': 'Graph',
  'Shortest Path': 'Shortest Path',
  'Minimum Spanning Tree': 'Minimum Spanning Tree',
  'Strongly Connected Component': 'Strongly Connected Component',
  'Biconnected Component': 'Biconnected Component',
  'Eulerian Circuit': 'Eulerian Circuit',
  
  // Strings
  'String Matching': 'String Matching',
  'Rolling Hash': 'Rolling Hash',
  'Hash Function': 'Hash Function',
  'Suffix Array': 'Suffix Array',
  
  // Special Topics
  'Game Theory': 'Game Theory',
  'Interactive': 'Interactive',
  'Data Stream': 'Data Stream',
  'Design': 'Design',
  'Brainteaser': 'Brainteaser',
  'Concurrency': 'Concurrency',
  'Database': 'Database',
  'Shell': 'Shell',
  'Iterator': 'Iterator',
  
  // Probability & Randomization
  'Probability and Statistics': 'Probability and Statistics',
  'Randomized': 'Randomized',
  'Reservoir Sampling': 'Reservoir Sampling',
  'Rejection Sampling': 'Rejection Sampling',
  
  // Sorting Algorithms
  'Merge Sort': 'Merge Sort',
  'Counting Sort': 'Counting Sort',
  'Bucket Sort': 'Bucket Sort',
  'Radix Sort': 'Radix Sort',
  
  // Others
  'Line Sweep': 'Line Sweep',
  'Bitmask': 'Bitmask',
};

/**
 * Mapping of Codeforces tags to unified topics
 * Maps Codeforces tag names to the same normalized form as LeetCode
 */
const codeforcesTopicMap = {
  // Algorithms
  'dp': 'Dynamic Programming',
  'greedy': 'Greedy',
  'binary search': 'Binary Search',
  'two pointers': 'Two Pointers',
  'sortings': 'Sorting',
  'dfs and similar': 'Depth-First Search',
  'bfs': 'Breadth-First Search',
  'brute force': 'Brute Force',
  'ternary search': 'Ternary Search',
  'divide and conquer': 'Divide and Conquer',
  'meet-in-the-middle': 'Meet-in-the-Middle',
  
  // Data Structures
  'data structures': 'Data Structures',
  'trees': 'Tree',
  'dsu': 'Disjoint Set Union',
  'graphs': 'Graph',
  'matrices': 'Matrix',
  'string suffix structures': 'Suffix Array',
  
  // Math
  'math': 'Math',
  'number theory': 'Number Theory',
  'combinatorics': 'Combinatorics',
  'geometry': 'Geometry',
  'bitmasks': 'Bitmask',
  'probabilities': 'Probability and Statistics',
  
  // Strings
  'strings': 'String',
  'hashing': 'Hash Function',
  
  // Graph Algorithms
  'shortest paths': 'Shortest Path',
  'flows': 'Network Flow',
  'graph matchings': 'Graph Matching',
  
  // Special
  'games': 'Game Theory',
  'interactive': 'Interactive',
  'implementation': 'Implementation',
  'constructive algorithms': 'Constructive Algorithms',
  '*special': 'Special',
  
  // Advanced
  'fft': 'Fast Fourier Transform',
  '2-sat': '2-SAT',
  'chinese remainder theorem': 'Chinese Remainder Theorem',
  'schedules': 'Scheduling',
  'expression parsing': 'Expression Parsing',
};

/**
 * Cross-platform topic equivalence mapping
 * Maps similar topics that have different names across platforms
 */
const topicEquivalenceMap = {
  // DSU variations
  'Union Find': 'Disjoint Set Union',
  'dsu': 'Disjoint Set Union',
  
  // Heap variations
  'Heap (Priority Queue)': 'Heap',
  'Priority Queue': 'Heap',
  'heap': 'Heap',
  
  // Tree variations
  'trees': 'Tree',
  'Binary Tree': 'Tree',
  
  // Graph variations
  'graphs': 'Graph',
  
  // String variations
  'strings': 'String',
  
  // Array variations
  'matrices': 'Matrix',
  
  // Sorting variations
  'sortings': 'Sorting',
  
  // DFS variations
  'dfs and similar': 'Depth-First Search',
  'Depth-First Search': 'Depth-First Search',
  
  // BFS variations
  'bfs': 'Breadth-First Search',
  'Breadth-First Search': 'Breadth-First Search',
  
  // DP variations
  'dp': 'Dynamic Programming',
  'Dynamic Programming': 'Dynamic Programming',
  
  // Binary Search variations
  'binary search': 'Binary Search',
  'Binary Search': 'Binary Search',
  
  // Two Pointers variations
  'two pointers': 'Two Pointers',
  'Two Pointers': 'Two Pointers',
  
  // Greedy variations
  'greedy': 'Greedy',
  'Greedy': 'Greedy',
  
  // Hash variations
  'Hash Table': 'Hash Table',
  'hashing': 'Hash Function',
  
  // Shortest Path variations
  'shortest paths': 'Shortest Path',
  'Shortest Path': 'Shortest Path',
  
  // Math variations
  'math': 'Math',
  'Math': 'Math',
  
  // Game Theory variations
  'games': 'Game Theory',
  'Game Theory': 'Game Theory',
  
  // Interactive variations
  'interactive': 'Interactive',
  'Interactive': 'Interactive',
  
  // Bit Manipulation variations
  'bitmasks': 'Bitmask',
  'Bit Manipulation': 'Bitmask',
  'Bitmask': 'Bitmask',
};

/**
 * Normalize a topic name to its unified form
 * @param {string} topic - Topic name from any platform
 * @param {string} platform - Platform name (leetcode, codeforces, etc.)
 * @returns {string} Unified topic name
 */
export function normalizeTopicName(topic, platform = 'unknown') {
  if (!topic) return null;
  
  // First, check platform-specific mapping
  if (platform === 'leetcode' && leetcodeTopicMap[topic]) {
    return leetcodeTopicMap[topic];
  }
  
  if (platform === 'codeforces' && codeforcesTopicMap[topic.toLowerCase()]) {
    return codeforcesTopicMap[topic.toLowerCase()];
  }
  
  // Then check equivalence mapping
  if (topicEquivalenceMap[topic]) {
    return topicEquivalenceMap[topic];
  }
  
  // Check case-insensitive equivalence
  const lowerTopic = topic.toLowerCase();
  for (const [key, value] of Object.entries(topicEquivalenceMap)) {
    if (key.toLowerCase() === lowerTopic) {
      return value;
    }
  }
  
  // Return original if no mapping found
  return topic;
}

/**
 * Normalize an array of topics
 * @param {Array<string>} topics - Array of topic names
 * @param {string} platform - Platform name
 * @returns {Array<string>} Array of unified topic names
 */
export function normalizeTopics(topics, platform = 'unknown') {
  if (!Array.isArray(topics)) return [];
  
  return topics
    .map(topic => normalizeTopicName(topic, platform))
    .filter(Boolean) // Remove nulls
    .filter((topic, index, self) => self.indexOf(topic) === index); // Remove duplicates
}

/**
 * Merge topic distributions from multiple platforms
 * Combines topics that are equivalent across platforms
 * @param {Object} distribution1 - First topic distribution
 * @param {Object} distribution2 - Second topic distribution
 * @returns {Object} Merged topic distribution
 */
export function mergeTopicDistributions(distribution1, distribution2) {
  const merged = { ...distribution1 };
  
  for (const [topic, count] of Object.entries(distribution2)) {
    const normalizedTopic = normalizeTopicName(topic);
    merged[normalizedTopic] = (merged[normalizedTopic] || 0) + count;
  }
  
  return merged;
}

/**
 * Get all LeetCode topics (for reference)
 */
export const allLeetCodeTopics = Object.keys(leetcodeTopicMap);

/**
 * Get all Codeforces topics (for reference)
 */
export const allCodeforcesTopics = Object.keys(codeforcesTopicMap);

export default {
  normalizeTopicName,
  normalizeTopics,
  mergeTopicDistributions,
  leetcodeTopicMap,
  codeforcesTopicMap,
  topicEquivalenceMap,
  allLeetCodeTopics,
  allCodeforcesTopics
};
