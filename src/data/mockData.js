// Mock data simulating what the AI agent would return
// Subject is auto-detected from syllabus keywords

// ── Subject detector ──────────────────────────────────────────────────────────
const SUBJECT_KEYWORDS = {
  ml: ['machine learning', 'neural network', 'regression', 'classification', 'clustering',
       'gradient descent', 'overfitting', 'supervised', 'unsupervised', 'random forest',
       'svm', 'deep learning', 'cnn', 'rnn', 'backpropagation', 'feature', 'training'],
  dsa: ['data structure', 'algorithm', 'stack', 'queue', 'linked list', 'tree', 'graph',
        'sorting', 'searching', 'hashing', 'array', 'recursion', 'dynamic programming',
        'bfs', 'dfs', 'binary search'],
  dbms: ['database', 'sql', 'normalization', 'transaction', 'acid', 'er diagram',
         'relational', 'primary key', 'foreign key', 'join', 'index', 'query'],
  os: ['operating system', 'process', 'thread', 'deadlock', 'scheduling', 'memory management',
       'paging', 'semaphore', 'mutex', 'virtual memory', 'file system'],
};

export function detectSubject(syllabusText) {
  const lower = syllabusText.toLowerCase();
  const scores = Object.entries(SUBJECT_KEYWORDS).map(([subject, keywords]) => ({
    subject,
    score: keywords.filter(kw => lower.includes(kw)).length,
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].subject : 'dsa'; // fallback to dsa
}

// ── Audit builders ────────────────────────────────────────────────────────────
const AUDITS = {
  ml: {
    topicsCovered: 9, topicsTotal: 10,
    missedTopics: ['Chapter 8: Reinforcement Learning'],
    bloomsMatch: true, originality: 100, difficulty: 'Medium-Hard',
    totalQuestions: 20, totalMarks: 50,
    distribution: [
      { level: 'Remember', count: 4, marks: 8, percent: 20 },
      { level: 'Understand', count: 4, marks: 8, percent: 20 },
      { level: 'Apply', count: 5, marks: 15, percent: 25 },
      { level: 'Analyse', count: 4, marks: 12, percent: 20 },
      { level: 'Evaluate', count: 2, marks: 6, percent: 10 },
      { level: 'Create', count: 1, marks: 4, percent: 5 },
    ],
  },
  dsa: {
    topicsCovered: 9, topicsTotal: 10,
    missedTopics: ['Chapter 7: Graph Algorithms'],
    bloomsMatch: true, originality: 100, difficulty: 'Medium-Hard',
    totalQuestions: 20, totalMarks: 50,
    distribution: [
      { level: 'Remember', count: 4, marks: 8, percent: 20 },
      { level: 'Understand', count: 4, marks: 8, percent: 20 },
      { level: 'Apply', count: 5, marks: 15, percent: 25 },
      { level: 'Analyse', count: 4, marks: 12, percent: 20 },
      { level: 'Evaluate', count: 2, marks: 6, percent: 10 },
      { level: 'Create', count: 1, marks: 4, percent: 5 },
    ],
  },
};
AUDITS.dbms = { ...AUDITS.ml, missedTopics: ['Chapter 6: Distributed Databases'] };
AUDITS.os   = { ...AUDITS.ml, missedTopics: ['Chapter 9: File Systems'] };

export function getMockAudit(subject) { return AUDITS[subject] || AUDITS.dsa; }

// ── Question sets ─────────────────────────────────────────────────────────────
const ML_QUESTIONS = [
  { id:'q1', level:'Remember', marks:2, topic:'Supervised Learning',
    question:'Define supervised learning and give two real-world examples.',
    answer:'Supervised learning trains a model on labelled data (input–output pairs) to predict outputs for unseen inputs. Examples: (1) Email spam detection — labelled emails (spam/not spam) train a classifier. (2) House price prediction — features (size, location) mapped to known prices train a regression model.' },
  { id:'q2', level:'Remember', marks:2, topic:'Model Evaluation',
    question:'State the formulae for Precision, Recall, and F1-Score.',
    answer:'Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1-Score = 2 × (Precision × Recall) / (Precision + Recall). These metrics are used when class imbalance exists and accuracy alone is misleading.' },
  { id:'q3', level:'Remember', marks:2, topic:'Regression',
    question:'What is the cost function used in Linear Regression? Write its formula.',
    answer:'Mean Squared Error (MSE): J(θ) = (1/2m) Σ(hθ(xⁱ) − yⁱ)². Where m = number of training examples, hθ(x) = predicted value, y = actual value. The factor 1/2 simplifies the gradient derivative.' },
  { id:'q4', level:'Remember', marks:2, topic:'Neural Networks',
    question:'Name and briefly describe three common activation functions used in neural networks.',
    answer:'(1) Sigmoid: σ(x) = 1/(1+e⁻ˣ) — maps to (0,1), used in binary classification output layers. (2) ReLU: f(x) = max(0,x) — computationally efficient, avoids vanishing gradient in hidden layers. (3) Softmax: converts logits to probability distribution, used in multi-class output layers.' },
  { id:'q5', level:'Understand', marks:2, topic:'Bias-Variance',
    question:'Explain the bias-variance tradeoff. How does it relate to overfitting and underfitting?',
    answer:'Bias = error from wrong model assumptions (underfitting — model too simple). Variance = error from sensitivity to training data fluctuations (overfitting — model too complex). High bias → underfitting; high variance → overfitting. The goal is to find the sweet spot with low bias and low variance, typically via regularisation and cross-validation.' },
  { id:'q6', level:'Understand', marks:2, topic:'Unsupervised Learning',
    question:'Explain how the K-Means clustering algorithm works step by step.',
    answer:'(1) Choose K cluster centroids randomly. (2) Assign each data point to the nearest centroid (Euclidean distance). (3) Recompute centroids as the mean of assigned points. (4) Repeat steps 2–3 until centroids no longer move (convergence). K-Means minimises within-cluster sum of squares (WCSS).' },
  { id:'q7', level:'Understand', marks:2, topic:'Decision Trees',
    question:'Describe how a Decision Tree selects the best feature to split on. What is Information Gain?',
    answer:'A Decision Tree selects the feature that maximises Information Gain (IG). IG = Entropy(parent) − Σ(weighted Entropy of children). Entropy H(S) = −Σ pᵢ log₂(pᵢ). The feature with highest IG is chosen at each node, as it reduces uncertainty the most after the split.' },
  { id:'q8', level:'Understand', marks:2, topic:'Gradient Descent',
    question:'Explain the difference between Batch, Stochastic, and Mini-Batch Gradient Descent.',
    answer:'Batch GD: Uses entire dataset per update — stable but slow for large data. Stochastic GD (SGD): Uses one sample per update — fast but noisy convergence. Mini-Batch GD: Uses a small batch (e.g. 32–256 samples) — balances speed and stability, most widely used in deep learning.' },
  { id:'q9', level:'Apply', marks:3, topic:'Regression',
    question:'Given training data: x = [1,2,3,4,5], y = [2,4,5,4,5], compute the best-fit line using Ordinary Least Squares. Show your working.',
    answer:'x̄ = 3, ȳ = 4. Σ(xᵢ−x̄)(yᵢ−ȳ) = (−2)(−2)+(−1)(0)+(0)(1)+(1)(0)+(2)(1) = 6. Σ(xᵢ−x̄)² = 4+1+0+1+4 = 10. Slope β₁ = 6/10 = 0.6. Intercept β₀ = 4 − 0.6×3 = 2.2. Best-fit line: y = 0.6x + 2.2.' },
  { id:'q10', level:'Apply', marks:3, topic:'Classification',
    question:'Apply the Naïve Bayes classifier to predict the class (Yes/No) for the instance (Outlook=Sunny, Wind=Strong) given the training distribution. Show all probability calculations.',
    answer:'P(Yes)=9/14, P(No)=5/14. P(Sunny|Yes)=2/9, P(Strong|Yes)=3/9. P(Sunny|No)=3/5, P(Strong|No)=3/5. P(Yes|x) ∝ (9/14)×(2/9)×(3/9) = 0.0476. P(No|x) ∝ (5/14)×(3/5)×(3/5) = 0.1286. Prediction: No (higher posterior).' },
  { id:'q11', level:'Apply', marks:3, topic:'Model Evaluation',
    question:'A classifier produces: TP=50, FP=10, FN=5, TN=35. Calculate Accuracy, Precision, Recall, and F1-Score.',
    answer:'Accuracy = (50+35)/(50+10+5+35) = 85/100 = 85%. Precision = 50/(50+10) = 83.3%. Recall = 50/(50+5) = 90.9%. F1 = 2×(0.833×0.909)/(0.833+0.909) = 86.9%.' },
  { id:'q12', level:'Apply', marks:3, topic:'Neural Networks',
    question:'Perform one forward pass through a neural network with: input x=0.5, weight w=0.8, bias b=0.1, activation=sigmoid. Then compute the loss using MSE against target y=1.',
    answer:'Linear output: z = w×x + b = 0.8×0.5 + 0.1 = 0.5. Sigmoid: a = 1/(1+e⁻⁰·⁵) ≈ 0.6225. MSE Loss = (1/2)(y−a)² = (1/2)(1−0.6225)² = (1/2)(0.1425) ≈ 0.0713.' },
  { id:'q13', level:'Apply', marks:3, topic:'SVM',
    question:'Given support vectors at (1,1) and (−1,−1) with labels +1 and −1, determine the decision boundary and margin of a linear SVM.',
    answer:'The decision boundary passes midway: w·x + b = 0. With w = [1,1] (direction of separation), boundary is x₁ + x₂ = 0. Margin = 2/||w|| = 2/√2 = √2 ≈ 1.414. The SVM maximises this margin.' },
  { id:'q14', level:'Analyse', marks:3, topic:'Feature Engineering',
    question:'Analyse the impact of highly correlated features on a Linear Regression model. What is multicollinearity and how is it detected and resolved?',
    answer:'Multicollinearity: two or more features highly correlated, making it hard to isolate individual effects. Impact: inflated standard errors, unstable coefficient estimates. Detection: Variance Inflation Factor (VIF > 10 = problem), correlation heatmap. Resolution: remove one of the correlated features, use PCA for dimensionality reduction, or apply Ridge Regression (L2 regularisation).' },
  { id:'q15', level:'Analyse', marks:3, topic:'Ensemble Methods',
    question:'Analyse the difference between Bagging and Boosting. Why does Boosting often outperform Bagging but risk overfitting?',
    answer:'Bagging (e.g. Random Forest): trains multiple models on random subsets in parallel, aggregates by voting/averaging — reduces variance. Boosting (e.g. XGBoost): trains models sequentially, each correcting previous errors by weighting misclassified samples — reduces bias. Boosting outperforms by focusing on hard examples, but sequential error weighting can amplify noise, causing overfitting on noisy datasets.' },
  { id:'q16', level:'Analyse', marks:3, topic:'Deep Learning',
    question:'Analyse why the vanishing gradient problem occurs in deep networks and how ReLU and Batch Normalisation address it.',
    answer:'Vanishing gradient: sigmoid/tanh derivatives are < 1; multiplied across many layers during backpropagation, gradients approach zero — early layers learn nothing. ReLU fix: derivative is 1 for positive inputs, preventing gradient shrinkage. Batch Normalisation fix: normalises layer inputs to zero mean/unit variance, stabilising gradient magnitudes and allowing higher learning rates.' },
  { id:'q17', level:'Analyse', marks:3, topic:'Clustering',
    question:'Analyse the limitations of K-Means clustering when applied to non-spherical or unequal-density clusters.',
    answer:'K-Means assumes clusters are spherical (uses Euclidean distance) and equal in size/density. Limitations: fails on elongated or crescent-shaped clusters; sensitive to outliers (centroid pulled by noise); requires K to be specified; produces hard assignments. Alternatives: DBSCAN (density-based, finds arbitrary shapes), Gaussian Mixture Models (soft assignments, handles ellipsoidal clusters).' },
  { id:'q18', level:'Evaluate', marks:3, topic:'Model Selection',
    question:'Evaluate the use of accuracy as a metric for a fraud detection system where 99% of transactions are legitimate. Justify your recommendation for a better metric.',
    answer:'Accuracy is misleading: a model predicting "not fraud" always achieves 99% accuracy but detects zero fraud. For imbalanced classes, use: Precision (avoid false alarms), Recall (catch all fraud — typically prioritised), F1-Score (balance), or AUC-ROC (overall discriminative power). Recommendation: Recall is most critical in fraud detection, as missing a fraudulent transaction (False Negative) is far more costly than a false alarm.' },
  { id:'q19', level:'Evaluate', marks:3, topic:'Regularisation',
    question:'Evaluate L1 (Lasso) vs L2 (Ridge) regularisation. In what scenarios would you prefer each?',
    answer:'L1 (Lasso): adds |w| penalty — drives some weights to exactly zero, performing automatic feature selection. Prefer when you suspect only a few features are relevant (sparse model). L2 (Ridge): adds w² penalty — shrinks weights towards zero but never exactly. Prefer when all features contribute and you want to control magnitude without eliminating features. Elastic Net combines both for complex datasets.' },
  { id:'q20', level:'Create', marks:4, topic:'ML Pipeline',
    question:'Design a complete end-to-end ML pipeline for a student dropout prediction system. Describe each stage, the algorithms you would choose, and how you would evaluate and deploy the model.',
    answer:'(1) Data Collection: gather student records (attendance, grades, demographics). (2) Preprocessing: handle missing values (median imputation), encode categoricals (one-hot), scale numerics (StandardScaler). (3) EDA: correlation analysis, class imbalance check (use SMOTE if needed). (4) Model: XGBoost (handles tabular data well, interpretable via SHAP). (5) Evaluation: Stratified K-Fold CV, prioritise Recall (catching at-risk students). (6) Deployment: FastAPI endpoint, retrain monthly with new data, monitor data drift via distribution shift alerts.' },
];

const DSA_QUESTIONS = [
  { id:'q1', level:'Remember', marks:2, topic:'Data Structures', question:'Define a stack and list its fundamental operations.', answer:'A stack follows LIFO. Operations: Push, Pop, Peek, isEmpty, isFull.' },
  { id:'q2', level:'Remember', marks:2, topic:'Sorting', question:'State the time complexity of Bubble Sort in the worst case.', answer:'O(n²) — occurs when the array is sorted in reverse order.' },
  { id:'q3', level:'Remember', marks:2, topic:'Trees', question:'What is a binary search tree? State the BST property.', answer:'A BST is a rooted binary tree where left subtree values < node value < right subtree values.' },
  { id:'q4', level:'Remember', marks:2, topic:'Arrays', question:'Define an array and explain how elements are accessed in memory.', answer:'Contiguous block of same-type elements. Address of index i = Base + i × element_size. O(1) access.' },
  { id:'q5', level:'Understand', marks:2, topic:'Linked Lists', question:'Explain the difference between singly and doubly linked lists.', answer:'Singly: one next pointer, forward traversal only. Doubly: next + prev pointers, bidirectional traversal.' },
  { id:'q6', level:'Understand', marks:2, topic:'Hashing', question:'Describe what a hash collision is and two strategies to resolve it.', answer:'Collision: two keys map to same index. Resolved by Chaining (linked list per bucket) or Open Addressing (linear/quadratic probing).' },
  { id:'q7', level:'Understand', marks:2, topic:'Queues', question:'Explain the concept of a circular queue and why it is preferred.', answer:'Circular queue treats the array as circular — (rear+1)%size — avoiding false overflow of a simple queue.' },
  { id:'q8', level:'Understand', marks:2, topic:'Recursion', question:'Explain base case and recursive case using factorial.', answer:'Base case: factorial(0)=1. Recursive case: factorial(n) = n × factorial(n−1). Missing base case → stack overflow.' },
  { id:'q9', level:'Apply', marks:3, topic:'Stacks', question:'Convert "A + B * C - D" from infix to postfix using a stack. Show each step.', answer:'Process: A→output, +→push, B→output, *→push(*>+), C→output, -→pop*,pop+,push-, D→output, pop-. Result: ABC*+D-' },
  { id:'q10', level:'Apply', marks:3, topic:'Sorting', question:'Apply merge sort on [38,27,43,3,9,82,10]. Show all steps.', answer:'Split→merge pairs→merge halves. Final: [3,9,10,27,38,43,82]' },
  { id:'q11', level:'Apply', marks:3, topic:'Trees', question:'Insert 50,30,70,20,40,60,80 into a BST. Draw the tree.', answer:'Root 50; left subtree {20,30,40}; right subtree {60,70,80}.' },
  { id:'q12', level:'Apply', marks:3, topic:'Hashing', question:'Insert {14,17,6,3,10,22} using h(k)=k mod 7 with linear probing.', answer:'Table: [0→14, 1→22, 2→empty, 3→17, 4→3, 5→10, 6→6]' },
  { id:'q13', level:'Apply', marks:3, topic:'Linked Lists', question:'Write an algorithm to reverse a singly linked list. Trace [1→2→3→4→5].', answer:'prev=NULL,curr=head loop reversing .next. Result: [5→4→3→2→1]' },
  { id:'q14', level:'Analyse', marks:3, topic:'Sorting', question:'Compare Quick Sort vs Merge Sort on complexity, space, stability. Which for large linked lists?', answer:'Quick: avg O(n log n), worst O(n²), in-place, unstable. Merge: always O(n log n), O(n) space, stable. Merge Sort preferred for linked lists.' },
  { id:'q15', level:'Analyse', marks:3, topic:'Trees', question:'Analyse BST with sorted insertions. How does AVL fix it?', answer:'Sorted insertions → skewed tree, O(n) ops. AVL maintains balance factor ≤1 via rotations → O(log n) guaranteed.' },
  { id:'q16', level:'Analyse', marks:3, topic:'Arrays', question:'Analyse trade-offs of arrays vs linked lists for implementing a stack.', answer:'Array: O(1) amortised, cache-friendly, fixed size. Linked list: O(1) always, dynamic, poor cache. Choose based on size predictability.' },
  { id:'q17', level:'Analyse', marks:3, topic:'Hashing', question:'A hash table has load factor α=0.9. Analyse impact and recommend action.', answer:'Average probes ≈ 5.5. Rehash to double size, target α < 0.7.' },
  { id:'q18', level:'Evaluate', marks:3, topic:'Sorting', question:'Evaluate Heap Sort vs Introsort for production use.', answer:'Heap Sort: O(n log n) worst, O(1) space, poor cache. Introsort: hybrid QS+Heap+Insertion, better cache — preferred in practice.' },
  { id:'q19', level:'Evaluate', marks:3, topic:'Trees', question:'Evaluate B-Tree vs BST for database indexing.', answer:'BST degenerates; poor disk I/O. B-Tree: multi-key nodes, minimises disk reads, auto-balanced. B-Tree clearly superior for databases.' },
  { id:'q20', level:'Create', marks:4, topic:'Data Structures', question:'Design a MinMaxStack supporting push/pop/getMin/getMax in O(1).', answer:'Use main stack + min-tracking stack + max-tracking stack. Push auxiliary stacks only when new extremes found. All ops O(1).' },
];

const QUESTION_SETS = { ml: ML_QUESTIONS, dsa: DSA_QUESTIONS };
// Reuse DSA set for other subjects for now
QUESTION_SETS.dbms = DSA_QUESTIONS;
QUESTION_SETS.os   = DSA_QUESTIONS;

export function getMockQuestions(subject) {
  return (QUESTION_SETS[subject] || DSA_QUESTIONS).map(q => ({ ...q, rejected: false, rejectionReason: null }));
}
