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
  {
    id:'q1', level:'Remember', marks:2, topic:'Supervised Learning',
    question:'Define supervised learning and give two real-world examples.',
    scaffolded_question:'(a) What does the term "supervised" mean in the context of machine learning?\n(b) What type of data does a supervised learning model require to train?\n(c) Provide one example of a supervised learning task in healthcare and one in finance.',
    advanced_question:'Compare the philosophical assumptions underlying supervised and self-supervised learning. Under what conditions does the availability of labelled data become the primary bottleneck, and how do semi-supervised approaches attempt to bridge this gap?',
    answer:'Supervised learning trains a model on labelled data (input–output pairs) to predict outputs for unseen inputs. Examples: (1) Email spam detection — labelled emails (spam/not spam) train a classifier. (2) House price prediction — features (size, location) mapped to known prices train a regression model.',
  },
  {
    id:'q2', level:'Remember', marks:2, topic:'Model Evaluation',
    question:'State the formulae for Precision, Recall, and F1-Score.',
    scaffolded_question:'(a) Define a True Positive (TP), False Positive (FP), and False Negative (FN).\n(b) Using these definitions, write the formula for Precision.\n(c) Write the formula for Recall.\n(d) How is the F1-Score calculated from Precision and Recall?',
    advanced_question:'Derive the F-beta score generalisation of F1. Under what real-world scenario would you set beta > 1, and when would beta < 1 be preferred? Justify with reference to class imbalance and asymmetric misclassification costs.',
    answer:'Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1-Score = 2 × (Precision × Recall) / (Precision + Recall). These metrics are used when class imbalance exists and accuracy alone is misleading.',
  },
  {
    id:'q3', level:'Remember', marks:2, topic:'Regression',
    question:'What is the cost function used in Linear Regression? Write its formula.',
    scaffolded_question:'(a) What is the purpose of a cost function in machine learning?\n(b) What does MSE stand for, and what does each term in the acronym mean?\n(c) Write the MSE cost function formula used in Linear Regression and explain each symbol.',
    advanced_question:'Derive the closed-form Ordinary Least Squares (OLS) solution for linear regression from first principles by minimising the MSE cost function. Under what conditions does this closed-form solution fail, and what alternative optimisation strategies are used?',
    answer:'Mean Squared Error (MSE): J(θ) = (1/2m) Σ(hθ(xⁱ) − yⁱ)². Where m = number of training examples, hθ(x) = predicted value, y = actual value. The factor 1/2 simplifies the gradient derivative.',
  },
  {
    id:'q4', level:'Remember', marks:2, topic:'Neural Networks',
    question:'Name and briefly describe three common activation functions used in neural networks.',
    scaffolded_question:'(a) What is the role of an activation function in a neural network layer?\n(b) Describe the Sigmoid function: write its formula and state its output range.\n(c) Describe the ReLU function: write its formula and explain why it is widely used.\n(d) Name one more activation function and state where it is typically used.',
    advanced_question:'Critically evaluate the vanishing and exploding gradient problems as they relate to activation function choice. Compare Sigmoid, Tanh, ReLU, Leaky ReLU, and GELU in terms of gradient flow, computational cost, and suitability for deep architectures. Which would you choose for a 100-layer network and why?',
    answer:'(1) Sigmoid: σ(x) = 1/(1+e⁻ˣ) — maps to (0,1), used in binary classification output layers. (2) ReLU: f(x) = max(0,x) — computationally efficient, avoids vanishing gradient in hidden layers. (3) Softmax: converts logits to probability distribution, used in multi-class output layers.',
  },
  {
    id:'q5', level:'Understand', marks:2, topic:'Bias-Variance',
    question:'Explain the bias-variance tradeoff. How does it relate to overfitting and underfitting?',
    scaffolded_question:'(a) Define "bias" in the context of a machine learning model.\n(b) Define "variance" in the context of a machine learning model.\n(c) What happens to bias and variance as model complexity increases?\n(d) Link high bias to underfitting and high variance to overfitting with a brief explanation each.',
    advanced_question:'The bias-variance decomposition applies to squared error loss. Extend this analysis: how does the decomposition change for 0-1 loss in classification? Discuss how ensemble methods like Random Forests and Boosting manipulate bias and variance differently, and when each is the better choice.',
    answer:'Bias = error from wrong model assumptions (underfitting — model too simple). Variance = error from sensitivity to training data fluctuations (overfitting — model too complex). High bias → underfitting; high variance → overfitting. The goal is to find the sweet spot with low bias and low variance, typically via regularisation and cross-validation.',
  },
  {
    id:'q6', level:'Understand', marks:2, topic:'Unsupervised Learning',
    question:'Explain how the K-Means clustering algorithm works step by step.',
    scaffolded_question:'(a) What is clustering and why is it classified as unsupervised learning?\n(b) What does the "K" in K-Means represent?\n(c) Describe Step 1: How are initial centroids chosen?\n(d) Describe Step 2: How are data points assigned to clusters?\n(e) Describe Step 3: How are centroids updated?\n(f) When does the algorithm stop?',
    advanced_question:'K-Means is sensitive to initialisation and assumes spherical, equally-sized clusters. Propose and justify an alternative clustering approach (e.g. K-Means++, DBSCAN, or GMM) for a dataset containing clusters of highly irregular shapes and varying densities. Analyse time complexity tradeoffs.',
    answer:'(1) Choose K cluster centroids randomly. (2) Assign each data point to the nearest centroid (Euclidean distance). (3) Recompute centroids as the mean of assigned points. (4) Repeat steps 2–3 until centroids no longer move (convergence). K-Means minimises within-cluster sum of squares (WCSS).',
  },
  {
    id:'q7', level:'Understand', marks:2, topic:'Decision Trees',
    question:'Describe how a Decision Tree selects the best feature to split on. What is Information Gain?',
    scaffolded_question:'(a) What is entropy in the context of decision trees? Write its formula.\n(b) What does it mean for a split to be "informative"?\n(c) Define Information Gain and write its formula.\n(d) In the algorithm, which feature is selected at each node and why?',
    advanced_question:'Compare Information Gain with the Gini Impurity criterion for Decision Tree splits. Demonstrate with a worked example where they produce different split choices. Explain why ID3 is prone to favouring high-cardinality features and how C4.5 resolves this with Gain Ratio.',
    answer:'A Decision Tree selects the feature that maximises Information Gain (IG). IG = Entropy(parent) − Σ(weighted Entropy of children). Entropy H(S) = −Σ pᵢ log₂(pᵢ). The feature with highest IG is chosen at each node, as it reduces uncertainty the most after the split.',
  },
  {
    id:'q8', level:'Understand', marks:2, topic:'Gradient Descent',
    question:'Explain the difference between Batch, Stochastic, and Mini-Batch Gradient Descent.',
    scaffolded_question:'(a) What is Gradient Descent trying to achieve?\n(b) In Batch Gradient Descent, how many samples are used per weight update? What is the drawback?\n(c) In Stochastic Gradient Descent (SGD), how many samples are used? What is the tradeoff?\n(d) What is Mini-Batch Gradient Descent and why is it the most commonly used variant?',
    advanced_question:'Analyse the convergence properties of Batch GD, SGD, and Mini-Batch GD from an optimisation theory perspective. How does the noise introduced by SGD act as an implicit regulariser? Compare with second-order methods (e.g. L-BFGS) and explain why first-order methods dominate deep learning despite their limitations.',
    answer:'Batch GD: Uses entire dataset per update — stable but slow for large data. Stochastic GD (SGD): Uses one sample per update — fast but noisy convergence. Mini-Batch GD: Uses a small batch (e.g. 32–256 samples) — balances speed and stability, most widely used in deep learning.',
  },
  {
    id:'q9', level:'Apply', marks:3, topic:'Regression',
    question:'Given training data: x = [1,2,3,4,5], y = [2,4,5,4,5], compute the best-fit line using Ordinary Least Squares. Show your working.',
    scaffolded_question:'(a) Calculate the mean of x (x̄) and the mean of y (ȳ).\n(b) Compute Σ(xᵢ−x̄)(yᵢ−ȳ) for each data point and sum them.\n(c) Compute Σ(xᵢ−x̄)² for each data point and sum them.\n(d) Use the results from (b) and (c) to find the slope β₁.\n(e) Calculate the intercept β₀ and write the final equation of the line.',
    advanced_question:'Using the given data, fit a linear regression model using OLS. Then: (i) compute the residuals and assess the model\'s goodness of fit using R²; (ii) add a regularisation term (Ridge, λ=0.5) and derive the modified normal equations; (iii) discuss how the Ridge solution differs from OLS in terms of the estimated coefficients.',
    answer:'x̄ = 3, ȳ = 4. Σ(xᵢ−x̄)(yᵢ−ȳ) = (−2)(−2)+(−1)(0)+(0)(1)+(1)(0)+(2)(1) = 6. Σ(xᵢ−x̄)² = 4+1+0+1+4 = 10. Slope β₁ = 6/10 = 0.6. Intercept β₀ = 4 − 0.6×3 = 2.2. Best-fit line: y = 0.6x + 2.2.',
  },
  {
    id:'q10', level:'Apply', marks:3, topic:'Classification',
    question:'Apply the Naïve Bayes classifier to predict the class (Yes/No) for the instance (Outlook=Sunny, Wind=Strong) given the training distribution. Show all probability calculations.',
    scaffolded_question:'(a) State Bayes\' theorem in the form used by Naïve Bayes.\n(b) From the training data, calculate P(Yes) and P(No).\n(c) Calculate the conditional probabilities P(Sunny|Yes), P(Strong|Yes), P(Sunny|No), P(Strong|No).\n(d) Compute the unnormalised posterior for each class.\n(e) Which class is predicted and why?',
    advanced_question:'The Naïve Bayes classifier assumes feature independence. Construct a counterexample where this assumption fails dramatically and leads to incorrect classification. Then propose and justify a more expressive probabilistic model (e.g. Bayesian Network) that captures feature dependencies, and outline how its inference would proceed.',
    answer:'P(Yes)=9/14, P(No)=5/14. P(Sunny|Yes)=2/9, P(Strong|Yes)=3/9. P(Sunny|No)=3/5, P(Strong|No)=3/5. P(Yes|x) ∝ (9/14)×(2/9)×(3/9) = 0.0476. P(No|x) ∝ (5/14)×(3/5)×(3/5) = 0.1286. Prediction: No (higher posterior).',
  },
  {
    id:'q11', level:'Apply', marks:3, topic:'Model Evaluation',
    question:'A classifier produces: TP=50, FP=10, FN=5, TN=35. Calculate Accuracy, Precision, Recall, and F1-Score.',
    scaffolded_question:'(a) Write the formula for Accuracy and compute it.\n(b) Write the formula for Precision and compute it.\n(c) Write the formula for Recall and compute it.\n(d) Write the formula for F1-Score and compute it using your results from (b) and (c).',
    advanced_question:'Using the confusion matrix values (TP=50, FP=10, FN=5, TN=35): (i) compute all four standard metrics; (ii) plot the ROC curve points for this single threshold; (iii) discuss what happens to each metric as you lower the classification threshold, and which metric should be optimised for a cancer screening tool vs. a spam filter.',
    answer:'Accuracy = (50+35)/(50+10+5+35) = 85/100 = 85%. Precision = 50/(50+10) = 83.3%. Recall = 50/(50+5) = 90.9%. F1 = 2×(0.833×0.909)/(0.833+0.909) = 86.9%.',
  },
  {
    id:'q12', level:'Apply', marks:3, topic:'Neural Networks',
    question:'Perform one forward pass through a neural network with: input x=0.5, weight w=0.8, bias b=0.1, activation=sigmoid. Then compute the loss using MSE against target y=1.',
    scaffolded_question:'(a) Compute the linear combination: z = w×x + b.\n(b) Apply the sigmoid activation function to z. (Recall: σ(z) = 1/(1+e⁻ᶻ)).\n(c) Write the MSE loss formula for a single sample.\n(d) Substitute the predicted and target values to calculate the final loss.',
    advanced_question:'Extend the single forward pass to a full backpropagation step: (i) compute the forward pass as described; (ii) derive ∂L/∂w and ∂L/∂b using the chain rule through MSE → sigmoid → linear; (iii) update w and b using gradient descent with learning rate η=0.1; (iv) explain why the sigmoid\'s saturating gradient is problematic for deep networks.',
    answer:'Linear output: z = w×x + b = 0.8×0.5 + 0.1 = 0.5. Sigmoid: a = 1/(1+e⁻⁰·⁵) ≈ 0.6225. MSE Loss = (1/2)(y−a)² = (1/2)(1−0.6225)² = (1/2)(0.1425) ≈ 0.0713.',
  },
  {
    id:'q13', level:'Apply', marks:3, topic:'SVM',
    question:'Given support vectors at (1,1) and (−1,−1) with labels +1 and −1, determine the decision boundary and margin of a linear SVM.',
    scaffolded_question:'(a) What is a support vector and why is it important in SVM?\n(b) Write the equation of the decision boundary in terms of w and b.\n(c) Using the support vectors, determine the orientation of the separating hyperplane.\n(d) Compute the margin width using the formula 2/||w||.',
    advanced_question:'For the given support vectors, derive the SVM primal optimisation problem from first principles. Formulate its Lagrangian dual and identify the Karush–Kuhn–Tucker conditions. Extend the analysis to the soft-margin SVM with slack variables: how does the regularisation constant C affect the decision boundary and margin in the presence of overlapping classes?',
    answer:'The decision boundary passes midway: w·x + b = 0. With w = [1,1] (direction of separation), boundary is x₁ + x₂ = 0. Margin = 2/||w|| = 2/√2 = √2 ≈ 1.414. The SVM maximises this margin.',
  },
  {
    id:'q14', level:'Analyse', marks:3, topic:'Feature Engineering',
    question:'Analyse the impact of highly correlated features on a Linear Regression model. What is multicollinearity and how is it detected and resolved?',
    scaffolded_question:'(a) Define multicollinearity in your own words.\n(b) Explain how multicollinearity affects the coefficient estimates in Linear Regression.\n(c) Describe two methods to detect multicollinearity (e.g. VIF, correlation matrix).\n(d) Propose two solutions to resolve multicollinearity.',
    advanced_question:'Multicollinearity affects OLS estimators. Prove mathematically why the (XᵀX) matrix becomes ill-conditioned under perfect multicollinearity. Compare Ridge Regression and PCA-based dimensionality reduction as remedies — analyse their effect on bias, variance, and interpretability of the resulting model coefficients.',
    answer:'Multicollinearity: two or more features highly correlated, making it hard to isolate individual effects. Impact: inflated standard errors, unstable coefficient estimates. Detection: Variance Inflation Factor (VIF > 10 = problem), correlation heatmap. Resolution: remove one of the correlated features, use PCA for dimensionality reduction, or apply Ridge Regression (L2 regularisation).',
  },
  {
    id:'q15', level:'Analyse', marks:3, topic:'Ensemble Methods',
    question:'Analyse the difference between Bagging and Boosting. Why does Boosting often outperform Bagging but risk overfitting?',
    scaffolded_question:'(a) What is the core idea behind Bagging? Give an example algorithm.\n(b) What is the core idea behind Boosting? Give an example algorithm.\n(c) In what way does Boosting "correct" errors from previous models?\n(d) Why can Boosting lead to overfitting, especially on noisy data?',
    advanced_question:'Derive the AdaBoost weight update rule from the exponential loss minimisation framework. Show how the final classifier is a weighted majority vote and prove that training error converges to zero exponentially fast. Then compare AdaBoost\'s sensitivity to noise with Gradient Boosting\'s regularised loss formulation.',
    answer:'Bagging (e.g. Random Forest): trains multiple models on random subsets in parallel, aggregates by voting/averaging — reduces variance. Boosting (e.g. XGBoost): trains models sequentially, each correcting previous errors by weighting misclassified samples — reduces bias. Boosting outperforms by focusing on hard examples, but sequential error weighting can amplify noise, causing overfitting on noisy datasets.',
  },
  {
    id:'q16', level:'Analyse', marks:3, topic:'Deep Learning',
    question:'Analyse why the vanishing gradient problem occurs in deep networks and how ReLU and Batch Normalisation address it.',
    scaffolded_question:'(a) Describe the backpropagation process and how gradients flow through layers.\n(b) Why do Sigmoid and Tanh activations cause gradients to vanish in deep networks?\n(c) How does ReLU prevent vanishing gradients? Are there any drawbacks?\n(d) What does Batch Normalisation do to the layer inputs, and how does this help gradient flow?',
    advanced_question:'Provide a mathematical analysis of gradient magnitude decay in a depth-L network using sigmoid activations. Show that the gradient magnitude is bounded by (σ_max)^L where σ_max < 1. Then analyse how Residual connections (ResNets) create gradient highways that fundamentally change the gradient flow dynamics, and derive the effective gradient path in a residual block.',
    answer:'Vanishing gradient: sigmoid/tanh derivatives are < 1; multiplied across many layers during backpropagation, gradients approach zero — early layers learn nothing. ReLU fix: derivative is 1 for positive inputs, preventing gradient shrinkage. Batch Normalisation fix: normalises layer inputs to zero mean/unit variance, stabilising gradient magnitudes and allowing higher learning rates.',
  },
  {
    id:'q17', level:'Analyse', marks:3, topic:'Clustering',
    question:'Analyse the limitations of K-Means clustering when applied to non-spherical or unequal-density clusters.',
    scaffolded_question:'(a) What geometric assumption does K-Means make about cluster shapes?\n(b) Give an example of a dataset where K-Means would fail due to cluster shape.\n(c) How does K-Means behave when clusters have very different sizes or densities?\n(d) Name two alternative clustering algorithms that handle these cases better and briefly explain each.',
    advanced_question:'Formalise K-Means as the Expectation-Maximisation algorithm applied to a mixture of isotropic Gaussians. Show why this derivation exposes the spherical-cluster limitation. Compare with the full Gaussian Mixture Model (GMM) formulation that allows arbitrary covariance matrices. Under what conditions does GMM reduce to K-Means?',
    answer:'K-Means assumes clusters are spherical (uses Euclidean distance) and equal in size/density. Limitations: fails on elongated or crescent-shaped clusters; sensitive to outliers (centroid pulled by noise); requires K to be specified; produces hard assignments. Alternatives: DBSCAN (density-based, finds arbitrary shapes), Gaussian Mixture Models (soft assignments, handles ellipsoidal clusters).',
  },
  {
    id:'q18', level:'Evaluate', marks:3, topic:'Model Selection',
    question:'Evaluate the use of accuracy as a metric for a fraud detection system where 99% of transactions are legitimate. Justify your recommendation for a better metric.',
    scaffolded_question:'(a) If a model always predicts "not fraud," what accuracy does it achieve? Is this useful?\n(b) Define the class imbalance problem in this context.\n(c) Why is Recall particularly important in fraud detection?\n(d) What metric would you recommend and why — justify with reference to the business cost of False Negatives vs. False Positives.',
    advanced_question:'Design an evaluation framework for a fraud detection model deployed in production. Justify your choice of primary metric (Precision, Recall, F1, AUC-ROC, or AUC-PR) using a formal cost-benefit analysis incorporating: (i) the financial cost ratio of FP to FN; (ii) the class imbalance ratio; (iii) threshold selection strategy using operating characteristic curves; (iv) monitoring metric drift over time.',
    answer:'Accuracy is misleading: a model predicting "not fraud" always achieves 99% accuracy but detects zero fraud. For imbalanced classes, use: Precision (avoid false alarms), Recall (catch all fraud — typically prioritised), F1-Score (balance), or AUC-ROC (overall discriminative power). Recommendation: Recall is most critical in fraud detection, as missing a fraudulent transaction (False Negative) is far more costly than a false alarm.',
  },
  {
    id:'q19', level:'Evaluate', marks:3, topic:'Regularisation',
    question:'Evaluate L1 (Lasso) vs L2 (Ridge) regularisation. In what scenarios would you prefer each?',
    scaffolded_question:'(a) What is the general purpose of regularisation in machine learning?\n(b) Describe the L1 penalty term and its effect on model coefficients.\n(c) Describe the L2 penalty term and its effect on model coefficients.\n(d) In which scenario would you choose L1 over L2, and vice versa? Give a concrete example for each.',
    advanced_question:'Derive the weight update rules for both Lasso and Ridge from the penalised loss function. Prove geometrically why Lasso produces sparse solutions (using the constrained form with L1 and L2 balls). Analyse the case of multicollinear features: which regulariser provides stable coefficient estimates and which arbitrarily selects one feature from a correlated group? Propose Elastic Net as a resolution and derive its optimisation objective.',
    answer:'L1 (Lasso): adds |w| penalty — drives some weights to exactly zero, performing automatic feature selection. Prefer when you suspect only a few features are relevant (sparse model). L2 (Ridge): adds w² penalty — shrinks weights towards zero but never exactly. Prefer when all features contribute and you want to control magnitude without eliminating features. Elastic Net combines both for complex datasets.',
  },
  {
    id:'q20', level:'Create', marks:4, topic:'ML Pipeline',
    question:'Design a complete end-to-end ML pipeline for a student dropout prediction system. Describe each stage, the algorithms you would choose, and how you would evaluate and deploy the model.',
    scaffolded_question:'(a) List the main stages of an ML pipeline from data collection to deployment.\n(b) What data sources and features would you collect for student dropout prediction?\n(c) Describe the preprocessing steps you would apply (handling missing values, encoding, scaling).\n(d) Which classification algorithm would you choose and why?\n(e) How would you evaluate the model and handle class imbalance?\n(f) Describe how you would deploy this model in a real university system.',
    advanced_question:'Design a production-grade ML system for real-time student dropout prediction. Your design must address: (i) streaming vs. batch data ingestion architecture; (ii) feature store design for temporal features (e.g. rolling attendance rates); (iii) model selection via multi-objective optimisation balancing interpretability (SHAP) and performance; (iv) fairness constraints to prevent demographic bias; (v) a retraining trigger mechanism based on detected concept drift; (vi) canary deployment strategy for rolling out model updates.',
    answer:'(1) Data Collection: gather student records (attendance, grades, demographics). (2) Preprocessing: handle missing values (median imputation), encode categoricals (one-hot), scale numerics (StandardScaler). (3) EDA: correlation analysis, class imbalance check (use SMOTE if needed). (4) Model: XGBoost (handles tabular data well, interpretable via SHAP). (5) Evaluation: Stratified K-Fold CV, prioritise Recall (catching at-risk students). (6) Deployment: FastAPI endpoint, retrain monthly with new data, monitor data drift via distribution shift alerts.',
  },
];

const DSA_QUESTIONS = [
  {
    id:'q1', level:'Remember', marks:2, topic:'Data Structures',
    question:'Define a stack and list its fundamental operations.',
    scaffolded_question:'(a) What does LIFO stand for and what does it mean?\n(b) List the four fundamental operations of a stack.\n(c) Give one real-world analogy for a stack data structure.',
    advanced_question:'Compare the stack abstract data type with the call stack used during program execution. How does stack overflow occur at the hardware level, and how do tail-call optimisation and trampolining techniques mitigate it in functional programming languages?',
    answer:'A stack follows LIFO (Last In, First Out). Operations: Push (add to top), Pop (remove from top), Peek (view top without removing), isEmpty, isFull.',
  },
  {
    id:'q2', level:'Remember', marks:2, topic:'Sorting',
    question:'State the time complexity of Bubble Sort in the worst case.',
    scaffolded_question:'(a) Describe what one "pass" of Bubble Sort does to an array.\n(b) How many passes are required in the worst case for n elements?\n(c) State the worst-case time complexity using Big-O notation and identify when it occurs.',
    advanced_question:'Derive the exact number of comparisons and swaps Bubble Sort performs in the worst case. Prove this is Θ(n²) and not merely O(n²). Contrast this with the best-case complexity of the optimised variant. What does this reveal about Bubble Sort\'s practical utility compared to Insertion Sort on nearly-sorted data?',
    answer:'O(n²) — occurs when the array is sorted in reverse order, requiring the maximum number of comparisons and swaps across all passes.',
  },
  {
    id:'q3', level:'Remember', marks:2, topic:'Trees',
    question:'What is a binary search tree? State the BST property.',
    scaffolded_question:'(a) What is a binary tree?\n(b) What additional ordering constraint makes a binary tree a Binary Search Tree?\n(c) For a node with value 50, where must values smaller than 50 go? Where must larger values go?',
    advanced_question:'Prove that the in-order traversal of a valid BST produces a sorted sequence. Then demonstrate that BST operations (insert, search, delete) are O(h) where h is the height, and show that for a randomly built BST over n distinct keys, the expected height is O(log n). Explain why balanced BSTs like AVL trees guarantee O(log n) worst-case rather than just expected.',
    answer:'A BST is a rooted binary tree where for every node: all values in the left subtree are less than the node\'s value, and all values in the right subtree are greater. This enables O(log n) search in balanced trees.',
  },
  {
    id:'q4', level:'Remember', marks:2, topic:'Arrays',
    question:'Define an array and explain how elements are accessed in memory.',
    scaffolded_question:'(a) What is an array and what type of elements can it store?\n(b) Are array elements stored contiguously or scattered in memory?\n(c) If the base address of an array is 1000 and each element takes 4 bytes, what is the address of index 3?',
    advanced_question:'Analyse the cache performance implications of arrays vs. linked lists for sequential access patterns. Using the memory hierarchy model (L1/L2/L3 cache, RAM), explain why spatial locality makes arrays significantly faster in practice despite both offering O(1) access theoretically. Extend this to 2D arrays and compare row-major vs. column-major access patterns.',
    answer:'An array is a contiguous block of same-type elements in memory. Address of index i = Base + i × element_size. Direct index computation enables O(1) random access. Fixed size is allocated at declaration time.',
  },
  {
    id:'q5', level:'Understand', marks:2, topic:'Linked Lists',
    question:'Explain the difference between singly and doubly linked lists.',
    scaffolded_question:'(a) Draw the structure of a single node in a singly linked list (show the data and pointer fields).\n(b) What direction(s) can you traverse a singly linked list?\n(c) What additional pointer does a doubly linked list node have?\n(d) Give one operation that is more efficient in a doubly linked list than a singly linked list.',
    advanced_question:'Compare singly linked lists, doubly linked lists, and XOR linked lists in terms of: (i) memory usage per node; (ii) traversal complexity; (iii) insertion/deletion at a given node given only a pointer to that node. Prove that deletion in a singly linked list given only a pointer to the node to be deleted is O(n) unless the node is not the last one — then show the O(1) trick.',
    answer:'Singly linked list: each node has one "next" pointer — forward traversal only, O(n) backward traversal. Doubly linked list: each node has "next" + "prev" pointers — bidirectional traversal in O(1), easier deletion but doubles pointer memory overhead.',
  },
  {
    id:'q6', level:'Understand', marks:2, topic:'Hashing',
    question:'Describe what a hash collision is and two strategies to resolve it.',
    scaffolded_question:'(a) Define a hash function and its purpose in a hash table.\n(b) What is a collision and why does it occur even with a good hash function?\n(c) Describe Chaining: how does it store colliding elements?\n(d) Describe Open Addressing (linear probing): what does it do when a collision occurs?',
    advanced_question:'Analyse the average-case performance of Separate Chaining and Open Addressing as a function of load factor α. Derive the expected number of probes for a successful and unsuccessful search under linear probing. Explain why load factor must be kept below 0.7 for open addressing, and propose a rehashing strategy with amortised O(1) insertion.',
    answer:'A collision occurs when two keys produce the same hash index. Resolution strategies: (1) Chaining — each bucket holds a linked list of colliding elements; worst-case O(n) but handles high load well. (2) Open Addressing (linear probing) — on collision, probe sequentially until an empty slot is found; faster cache performance but suffers from clustering.',
  },
  {
    id:'q7', level:'Understand', marks:2, topic:'Queues',
    question:'Explain the concept of a circular queue and why it is preferred over a simple queue.',
    scaffolded_question:'(a) What does FIFO stand for? How does a simple queue implement it?\n(b) What is the "false overflow" problem in a simple array-based queue?\n(c) How does a circular queue use the modulo operation to solve this problem?\n(d) Give the formula for advancing the rear pointer in a circular queue of size n.',
    advanced_question:'Implement a lock-free circular queue for a multi-producer, multi-consumer system using atomic compare-and-swap operations. Analyse the ABA problem that can arise and explain how hazard pointers or epoch-based reclamation resolve it. Compare this with a mutex-based implementation in terms of throughput under high contention.',
    answer:'A circular queue treats the underlying array as circular: (rear+1) % size gives the next position. This eliminates false overflow — when the front pointer advances after dequeues, the freed slots at the beginning can be reused. It is memory-efficient and supports O(1) enqueue/dequeue without shifting elements.',
  },
  {
    id:'q8', level:'Understand', marks:2, topic:'Recursion',
    question:'Explain base case and recursive case using factorial as an example.',
    scaffolded_question:'(a) What is recursion? Why does a recursive function need a base case?\n(b) Write the recursive definition of factorial(n).\n(c) Trace the recursive calls for factorial(4), showing the call stack.\n(d) What happens if the base case is omitted?',
    advanced_question:'Contrast iterative and recursive implementations of factorial in terms of time complexity, space complexity, and call stack depth. Derive the maximum recursion depth for factorial(n) that avoids a stack overflow given a typical 8MB stack with 64-byte frames. Then transform the recursive implementation into a tail-recursive form and explain how a compiler with tail-call optimisation would handle it.',
    answer:'Base case: factorial(0) = 1 (termination condition — no further recursive call). Recursive case: factorial(n) = n × factorial(n−1). Each call adds a stack frame. Omitting the base case leads to infinite recursion and a stack overflow error.',
  },
  {
    id:'q9', level:'Apply', marks:3, topic:'Stacks',
    question:'Convert "A + B * C - D" from infix to postfix using a stack. Show each step.',
    scaffolded_question:'(a) List the operator precedence rules used in infix-to-postfix conversion.\n(b) Complete the table below for each token: Token → Action → Stack state → Output so far.\n    Tokens: A, +, B, *, C, -, D\n(c) What is the final postfix expression?',
    advanced_question:'Extend the infix-to-postfix algorithm to handle: (i) unary minus; (ii) right-associative operators such as exponentiation (^); (iii) function calls with multiple arguments (e.g. max(A,B)). Prove the correctness of the Shunting Yard algorithm by showing it preserves operator precedence and associativity through an invariant argument.',
    answer:'Token processing: A→output, +→push, B→output, *→push(*>+), C→output, -→pop* and +, push-, D→output, pop-. Output: ABC*+D-. Final postfix: ABC*+D-',
  },
  {
    id:'q10', level:'Apply', marks:3, topic:'Sorting',
    question:'Apply merge sort on [38, 27, 43, 3, 9, 82, 10]. Show all recursive splits and merge steps.',
    scaffolded_question:'(a) Split [38,27,43,3,9,82,10] into two halves. What are they?\n(b) Continue splitting until you have single-element arrays. List all sub-arrays.\n(c) Merge the first two single-element sub-arrays, showing the comparison steps.\n(d) Continue merging level by level until you obtain the final sorted array.',
    advanced_question:'Prove that Merge Sort is Θ(n log n) in all cases by solving the recurrence T(n) = 2T(n/2) + Θ(n) using the Master Theorem. Then compare it with Timsort (used in Python\'s sort): describe how Timsort detects natural runs and adapts its merge strategy to exploit existing order, achieving O(n) on nearly-sorted data while maintaining O(n log n) worst-case.',
    answer:'Split: [38,27,43] | [3,9,82,10] → [38,27] [43] | [3,9] [82,10] → [38][27][43][3][9][82][10]. Merge: [27,38] [43] → [27,38,43] | [3,9] [10,82] → [3,9,10,82]. Final merge: [3,9,10,27,38,43,82].',
  },
  {
    id:'q11', level:'Apply', marks:3, topic:'Trees',
    question:'Insert 50, 30, 70, 20, 40, 60, 80 into a BST. Draw the resulting tree and show the path for searching 40.',
    scaffolded_question:'(a) Insert 50 as the root.\n(b) Insert 30: is it less than or greater than 50? Which subtree does it go to?\n(c) Insert 70, 20, 40, 60, 80 following the BST property. Draw the tree after all insertions.\n(d) Trace the search path to find 40 starting from the root.',
    advanced_question:'After building the BST with the given values, prove it is balanced (left and right subtree heights differ by at most 1 at every node). Now insert 35 and show how an AVL tree would rebalance using rotations. Derive the rotation type needed (LL, LR, RL, or RR) and demonstrate the resulting tree satisfies the AVL balance factor invariant.',
    answer:'Root=50; left subtree: 30 (children: 20 left, 40 right); right subtree: 70 (children: 60 left, 80 right). Search path for 40: 50→30→40 (found in 3 comparisons).',
  },
  {
    id:'q12', level:'Apply', marks:3, topic:'Hashing',
    question:'Insert keys {14, 17, 6, 3, 10, 22} into a hash table of size 7 using h(k) = k mod 7 with linear probing. Show the final table.',
    scaffolded_question:'(a) Compute h(k) = k mod 7 for each key: 14, 17, 6, 3, 10, 22.\n(b) Insert each key in order. For any collision, probe to the next available slot.\n(c) Show the state of the hash table after all insertions.\n(d) What is the load factor of the final table?',
    advanced_question:'Using the same hash function and table size, compare the performance of: (i) linear probing; (ii) quadratic probing; (iii) double hashing with h₂(k) = 1 + (k mod 5). For each method, count the number of probes required to insert all 6 keys and analyse which suffers most from primary clustering. Derive the expected number of probes for a successful lookup under each strategy.',
    answer:'Hash values: 14→0, 17→3, 6→6, 3→3(collision→4), 10→3(collision→4,5), 22→1. Final table: [0→14, 1→22, 2→empty, 3→17, 4→3, 5→10, 6→6]. Load factor = 6/7 ≈ 0.857.',
  },
  {
    id:'q13', level:'Apply', marks:3, topic:'Linked Lists',
    question:'Write an algorithm to reverse a singly linked list in-place. Trace the algorithm on [1→2→3→4→5].',
    scaffolded_question:'(a) Name the three pointer variables needed for in-place reversal.\n(b) Write the loop body: what does each pointer do at each step?\n(c) Trace the algorithm step by step on [1→2→3→4→5], showing pointer positions after each iteration.\n(d) What is the final state of the list?',
    advanced_question:'Compare three approaches to reversing a linked list: (i) iterative in-place with O(1) space; (ii) recursive with O(n) call stack space; (iii) using an auxiliary stack. Prove that the iterative approach is strictly superior in space complexity. Then generalise: write an algorithm to reverse a linked list in groups of k nodes, and prove its time complexity is O(n).',
    answer:'prev=NULL, curr=head. Loop: next=curr.next, curr.next=prev, prev=curr, curr=next. Trace: [1←2←3←4←5] with prev ending at 5. New head = prev = 5. Result: [5→4→3→2→1]. Time: O(n), Space: O(1).',
  },
  {
    id:'q14', level:'Analyse', marks:3, topic:'Sorting',
    question:'Compare Quick Sort vs Merge Sort on time complexity, space complexity, stability, and suitability for large linked lists.',
    scaffolded_question:'(a) State the average and worst-case time complexity of Quick Sort.\n(b) State the time and space complexity of Merge Sort.\n(c) What does "stability" mean in sorting? Which algorithm is stable?\n(d) For sorting a large linked list, which algorithm is better and why? Consider the cost of random access.',
    advanced_question:'Perform a rigorous analysis of Quick Sort\'s expected time complexity under a random pivot model using a backwards analysis argument. Derive why the expected number of comparisons is 2n ln n. Contrast this with Merge Sort\'s cache behaviour: model the number of cache misses for both algorithms on an array of n elements with cache size M and block size B, and determine when each algorithm is more cache-efficient.',
    answer:'Quick Sort: avg O(n log n), worst O(n²) on sorted input, O(log n) space (recursion), in-place, unstable. Merge Sort: always O(n log n), O(n) extra space, stable. For large linked lists: Merge Sort is preferred because it accesses elements sequentially (no random access), while Quick Sort requires random element access which is O(n) in linked lists.',
  },
  {
    id:'q15', level:'Analyse', marks:3, topic:'Trees',
    question:'Analyse why inserting already-sorted data into a BST degrades performance. How does an AVL tree fix this?',
    scaffolded_question:'(a) Insert [1,2,3,4,5] into a BST in order. Draw the resulting tree.\n(b) What is the height of this tree? How does this affect search, insert, and delete operations?\n(c) What is the AVL balance factor and what values are allowed?\n(d) Describe what happens when the balance factor is violated after an insertion.',
    advanced_question:'Prove that inserting n keys in sorted order into a BST produces a degenerate tree of height n−1, making all operations O(n). Then prove that an AVL tree maintains height ≤ 1.44 log₂(n+2) − 0.328 by showing that the minimum number of nodes N(h) in an AVL tree of height h satisfies the Fibonacci recurrence N(h) = N(h−1) + N(h−2) + 1.',
    answer:'Sorted insertions produce a right-skewed tree of height n−1, degrading all operations to O(n). AVL trees maintain the balance factor invariant (|left height − right height| ≤ 1) through rotations (LL, LR, RL, RR) after each insertion or deletion, guaranteeing O(log n) height and thus O(log n) operations.',
  },
  {
    id:'q16', level:'Analyse', marks:3, topic:'Arrays',
    question:'Analyse the trade-offs of using arrays vs. linked lists for implementing a stack.',
    scaffolded_question:'(a) List two advantages of implementing a stack with an array.\n(b) List two disadvantages of array-based stacks.\n(c) List two advantages of implementing a stack with a linked list.\n(d) When would you choose each implementation in a real application?',
    advanced_question:'Model the amortised cost of array-based stack with dynamic resizing using the potential method. Define a potential function Φ that captures the relationship between size and capacity, and prove that each push operation has O(1) amortised cost despite occasional O(n) resizing. Compare this with linked list stacks where every operation is strictly O(1) worst-case but with higher constant factors due to heap allocation.',
    answer:'Array: O(1) amortised push/pop (O(n) resizing amortises to O(1)), excellent cache locality, memory efficient for known sizes, but fixed max capacity. Linked list: O(1) strictly for all operations, truly dynamic size, but poor cache performance due to non-contiguous allocation and extra pointer memory per node. Choose array when size is predictable and cache performance matters; linked list when size is highly unpredictable.',
  },
  {
    id:'q17', level:'Analyse', marks:3, topic:'Hashing',
    question:'A hash table has a load factor α = 0.9. Analyse the performance impact and recommend a corrective action.',
    scaffolded_question:'(a) Define load factor α and explain what α = 0.9 means for this table.\n(b) Using the formula for expected probes in open addressing: (1/(1−α)), compute the expected number of probes.\n(c) Is this acceptable performance? Explain the clustering problem.\n(d) What action do you recommend and what target load factor should you aim for?',
    advanced_question:'Derive the expected number of probes for both successful and unsuccessful searches under linear probing as a function of load factor α, arriving at the formulas ½(1 + 1/(1−α)) and ½(1 + 1/(1−α)²). Plot these functions and identify the knee of the curve. Propose a dynamic resizing policy with a proof that it maintains O(1) amortised operations while keeping the load factor below 0.7.',
    answer:'At α = 0.9, expected probes per lookup ≈ 1/(1−0.9) = 10. This is severe — 10× slowdown. Cause: primary clustering creates long probe chains. Recommendation: rehash to a table of double the size (prime number preferred), targeting α < 0.7. At α = 0.7, expected probes ≈ 3.3, which is acceptable.',
  },
  {
    id:'q18', level:'Evaluate', marks:3, topic:'Sorting',
    question:'Evaluate Heap Sort vs. Introsort for production use in a standard library sort function. Justify your recommendation.',
    scaffolded_question:'(a) Describe Heap Sort: time complexity, space complexity, and stability.\n(b) Describe Introsort: what three algorithms does it combine and when does it switch between them?\n(c) Compare their cache performance.\n(d) Which would you choose for a standard library sort() and why?',
    advanced_question:'Standard library sort implementations (e.g. C++ std::sort, Python sorted) make specific algorithmic choices. Critically evaluate the design decisions in pdqsort (pattern-defeating quicksort) — a modern variant of Introsort. Analyse how it detects adversarial inputs (already-sorted, reverse-sorted, organ-pipe patterns) and adapts its pivot strategy and fallback mechanism. Compare its worst-case performance guarantees and cache behaviour with Merge Sort.',
    answer:'Heap Sort: O(n log n) worst case, O(1) space, not cache-friendly (parent-child jumps in heap), unstable. Introsort: hybrid of QuickSort + HeapSort + InsertionSort — O(n log n) worst case via HeapSort fallback when recursion depth exceeds 2log n, excellent cache performance like QuickSort for typical inputs, faster in practice. Recommendation: Introsort for production — combines best-case performance of QuickSort with worst-case guarantee of HeapSort.',
  },
  {
    id:'q19', level:'Evaluate', marks:3, topic:'Trees',
    question:'Evaluate B-Trees vs. BSTs for use as a database index. Which is more appropriate and why?',
    scaffolded_question:'(a) What is the primary bottleneck in disk-based databases (hint: disk I/O)?\n(b) How many keys can a BST node hold? How does this affect tree height?\n(c) How does a B-Tree of order m differ in terms of keys per node and children per node?\n(d) Why does a B-Tree\'s reduced height lead to fewer disk reads during a search?',
    advanced_question:'Database systems use B+ Trees rather than B-Trees for indexing. Analyse the structural difference between B-Tree and B+ Tree and prove why B+ Trees are superior for range queries and sequential scans. Derive the maximum number of disk reads required to search a B+ Tree of order m containing n keys, and compare this with a binary search on a sorted file. Explain how modern SSDs change this analysis compared to spinning disks.',
    answer:'BSTs are inappropriate for databases: each node holds one key, leading to O(log₂ n) height — thousands of disk reads for large datasets. B-Trees of order m store up to m−1 keys per node with m children, dramatically reducing height to O(log_m n). With m=100 and n=1 billion, height ≈ 5 — just 5 disk reads. B-Trees also keep data sorted for efficient range queries. Verdict: B-Trees are clearly superior for disk-based indexing.',
  },
  {
    id:'q20', level:'Create', marks:4, topic:'Data Structures',
    question:'Design a MinMaxStack data structure supporting push(), pop(), getMin(), and getMax() all in O(1) time and O(n) space.',
    scaffolded_question:'(a) What is the challenge in retrieving min and max after a pop() operation?\n(b) Propose a helper data structure (auxiliary stack or pair-based stack) to track min/max.\n(c) Describe the push() algorithm: what do you store in the auxiliary structure and when?\n(d) Describe the pop() algorithm: when do you update the auxiliary structure?\n(e) Prove that getMin() and getMax() are O(1) with your design.',
    advanced_question:'Extend the MinMaxStack to a MinMaxQueue — a queue supporting enqueue(), dequeue(), getMin(), and getMax() all in O(1) amortised time. Use the two-stack queue technique as a foundation. Prove the amortised O(1) cost of dequeue using the potential method. Then generalise to a sliding-window minimum problem on a stream of n integers with window size k, achieving O(n) total time using a monotonic deque — prove this complexity bound.',
    answer:'Design: maintain a main stack and two auxiliary stacks (min-stack, max-stack). Push: push value to main; push to min-stack only if value ≤ current min; push to max-stack only if value ≥ current max. Pop: pop from main; if popped value == min-stack top, pop min-stack; similarly for max-stack. getMin: peek min-stack top. getMax: peek max-stack top. All operations O(1), total space O(n).',
  },
];

const QUESTION_SETS = { ml: ML_QUESTIONS, dsa: DSA_QUESTIONS };
// Reuse DSA set for other subjects for now
QUESTION_SETS.dbms = DSA_QUESTIONS;
QUESTION_SETS.os   = DSA_QUESTIONS;

export function getMockQuestions(subject) {
  return (QUESTION_SETS[subject] || DSA_QUESTIONS).map(q => ({ ...q, rejected: false, rejectionReason: null }));
}
