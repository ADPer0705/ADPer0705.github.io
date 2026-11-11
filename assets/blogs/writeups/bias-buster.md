**ML and EDA based CTF question**

**Category:** Machine Learning and Exploratory Data Analysis

**CTF Event:** AIML Club, NFSU (Jan 29, 2025)

**Challenge Name:** Bias Buster

**Attachments:** `Bias_Buster.zip`, containing:

- `biased_loan_approval_dataset.csv`
- `biased_loan_approval_model.pkl`
- `README.md`
- `requirements.txt`
- `test_cases.json`
- `test_model.py`

### What this challenge is really about

Bias Buster is less about training a model and more about **auditing** one.

Most introductory ML challenges ask you to improve a metric: raise accuracy, lower error, beat a baseline. This one asks a different question — the model may be accurate and still be unfair. Your job is to figure out where that unfairness comes from, prove it with data, and explain why it matters.

By the end of the challenge, you should be able to:

- inspect a tabular dataset and identify its inputs, target, and identifier columns;
- measure outcome disparities between groups instead of relying on aggregate accuracy;
- test whether a model's decision changes when a single feature changes;
- explain how bias in historical data becomes bias in model behavior;
- reason about fairness using more than one definition.

Those skills transfer directly to real-world ML work. A model that decides who gets a loan, a job interview, or a medical referral is a system with consequences, and "the model said so" is not an explanation.

### The setup

The bundled `README.md` framed the challenge like this:

#### Loan Approval Bias Detection Challenge

##### Overview

Imagine you work at FinTrust Bank, a leading financial institution known for its innovative loan services. Recently, the bank adopted a cutting-edge machine-learning model to automate loan approvals. However, customers have started complaining that the system is unfairly rejecting certain applications.

The management suspects that the model might be biased against certain groups, and they've hired you as a data science detective to uncover the truth!

##### Files Provided

- `biased_loan_approval_dataset.csv`: The dataset used to train the loan approval model.
- `biased_loan_approval_model.pkl`: The trained loan approval model that the bank is currently using.
- `test_model.py`: A Python script to test the model's behavior with custom inputs.
- `test_cases.json`: A JSON file containing test cases to simulate the model input and output.

The necessary Python libraries are listed in `requirements.txt`.

##### Challenge Tasks

1. Analyze the dataset for patterns or disparities in loan approvals across different groups.
2. Test the model with the provided script to simulate how it processes different applications.
3. Determine which feature in the dataset is causing biased decisions.
4. Submit the biased feature as the flag in the format: `flag{feature_name}`.

For example, if you find that the `no_of_dependents` feature has a bias toward preferring fewer dependents, the flag is `flag{no_of_dependents}`.

##### Success Criteria

You successfully complete the challenge when:

- You identify the biased feature accurately.
- You submit the flag in the correct format (`flag{feature_name}`).

##### Hints

- Compare approval rates between different demographics in the dataset.
- Modify single features in identical applications to observe and verify how the model's decision changes.

Good luck, and may the most unbiased detective win! 🚀

So we're given a dataset, a model trained on that dataset, and a Python script that generates output from the model using the test cases in the JSON file. After installing the required libraries, here is what we get when we run the testing script:

![[pasted-image.png]]

*Running `test_model.py`.*

As we can see, the output is a binary verdict — whether the loan is `Approved` or `Rejected` — along with a confidence percentage.

That confidence number is worth pausing on. It tells you how sure the model is about its own prediction, not whether the prediction is fair or correct. A biased model can be very confident. Keep that distinction in mind for the rest of the challenge.

We're told that a certain feature has biased data, causing the model to make biased approvals, and we're supposed to find it. You can play around by tinkering with the test cases in the JSON file, trying different values for the various parameters.

### Step 1: Examine the dataset

When we open the CSV file, we can see that there are 13 columns: 12 input features

- loan_id
- no_of_dependents
- education
- self_employed
- income_annum
- loan_amount
- loan_term
- cibil_score
- residential_assets_value
- commercial_assets_value
- luxury_assets_value
- bank_asset_value

and one output column:

- loan_status

![[pasted-image-2.png]]

*The `biased_loan_approval_dataset.csv` file.*

One column deserves special mention: `loan_id` is an identifier, not a real feature. It uniquely labels each row and carries no information about creditworthiness. Feeding an identifier into a model is usually a mistake — at best it adds noise, and at worst it leaks row identity and lets the model memorize rather than generalize. The useful inputs are the remaining columns; the thing we're trying to predict is `loan_status`.

### Step 2: Look for disparities, not just patterns

A model learns from examples. If a group was approved more often in the historical data, the model has an incentive to reproduce that pattern — even if nobody explicitly told it to use group membership.

So the first question is simple: **does the approval outcome depend on a feature in a way that looks skewed?**

For a feature to be biased, the distribution of outcomes across its values must be unbalanced. To check for this, you can either make a visual representation or simply use `.groupby()`.

A useful way to quantify it is to compare approval rates rather than raw counts. Raw counts can mislead you if one group has far more rows than another; rates normalize for group size.

```python
import pandas as pd

df = pd.read_csv("biased_loan_approval_dataset.csv")

approval_rate = (
    df.assign(approved=df["loan_status"].eq("Approved"))
      .groupby("education")["approved"]
      .mean()
)

print(approval_rate)
```

An equivalent view is a row-normalized crosstab, which shows the share of each outcome within every category:

```python
pd.crosstab(
    df["education"],
    df["loan_status"],
    normalize="index",
).round(2)
```

You can repeat this for the other categorical columns and for binned versions of the numeric ones. The exact numbers are less important than the shape of the result: does one value of the feature lead overwhelmingly to one outcome?

![[pasted-image-3.png]]

*Running `.groupby()` on various features.*

After running `.groupby()` on the various features, we can see that while the others appear balanced, there is a noticeable bias in the `education` feature. The `loan_status` is `Approved` for the majority of graduates, while it is `Rejected` for the majority of non-graduates.

This is the core EDA insight: the dataset is not neutral. The outcome is distributed very differently across the values of `education`.

### Step 3: Verify the bias against the model

Finding a skew in the dataset is strong evidence, but it is not the same as proving the deployed model uses it. The dataset could contain a pattern that the model ignores, or the model could pick up a different correlated feature.

This is where `test_model.py` and `test_cases.json` come in. The technique is a **counterfactual test**:

1. Take one test case as a baseline and run it through the model.
2. Copy it, change **only** `education`, and leave every other field identical.
3. Run both cases and compare the verdicts.
4. Repeat for other features to rule them out.

If two applicants are identical in income, loan amount, credit score, assets, and every other attribute, and the only difference is `education`, then a change in the decision points directly at that feature. This is a controlled experiment on the model's behavior.

It is worth being precise about what this proves. A counterfactual flip shows that the model is **sensitive** to the feature. It does not, by itself, prove that the feature was the sole cause during training, because the model may have learned interactions with other columns. But combined with the disparity in the dataset, it is enough to identify the intended source of bias in this challenge.

### Why the model learned this

A supervised model is a pattern-copying machine with a very narrow objective: minimize error on the training examples. It does not know what "fair" means, and it does not know that education might be a sensitive attribute. It only knows that certain input values co-occur with certain labels.

In this dataset, `education` co-occurs strongly with `loan_status`. During training, using that relationship reduces the loss, so the model uses it. The bias is not a bug in the code — it is the model faithfully learning a biased world.

There are several common ways bias enters a system like this:

- **Historical bias:** the data reflects past decisions that already favored one group.
- **Sampling bias:** some groups are underrepresented in the data.
- **Label bias:** the recorded outcome is a proxy for the real thing, or was produced by biased human reviewers.
- **Feature bias / proxy discrimination:** a feature like education correlates with protected characteristics such as socioeconomic background, so using it indirectly encodes group membership.
- **Feedback loops:** biased approvals reduce a group's future opportunities, which produces even more biased data for the next model.

This is why "the data doesn't contain race/gender, so the model can't discriminate" is a dangerous argument. A model can reconstruct a protected attribute from correlated features. Removing the explicit column is not enough; you have to audit the outcomes.

### What "bias" means in fairness terms

"Bias" is not a single number, and different fairness definitions can disagree. Three common ones are:

- **Demographic parity:** approval rates should be equal across groups. Formally, `P(approved | group A) ≈ P(approved | group B)`.
- **Equal opportunity:** among people who actually qualify (or would repay), the model should approve them at equal rates across groups — equal true positive rates.
- **Equalized odds:** both true positive rates and false positive rates should be equal across groups.

In this challenge, the signal is closest to a demographic-parity problem: the approval rate for graduates is very different from the approval rate for non-graduates. That is a red flag, but notice that the right response depends on context. If one group genuinely has different repayment risk, equal approval rates might not be the correct target. The point of the exercise is not to memorize one formula — it is to learn to ask *which* fairness property matters for the decision being made, and to measure it explicitly.

This is also why **accuracy alone is not enough**. A model can have high overall accuracy while systematically harming a smaller group, especially when the classes are imbalanced. If most applicants are approved, a model that approves almost everyone looks great on average and still fails the people it rejects. Aggregate metrics hide group-level harm.

### Why `education` is the biased feature

Combining the two views gives the answer:

- **Dataset-level evidence:** approval outcomes are heavily skewed by `education`. Graduates are mostly approved; non-graduates are mostly rejected.
- **Model-level evidence:** changing only `education` in an otherwise identical application can change the model's decision.

Education is also a plausible proxy feature in a lending context. Income, existing assets, and credit score are directly related to repayment capacity; education is not. It can instead reflect socioeconomic background and access to opportunity. Using it as a gatekeeper can therefore reproduce historical inequity without anyone explicitly intending to discriminate.

That is the lesson hiding inside the toy bank: a feature can be predictive and still be unjustified.

### What the challenge teaches

If you take nothing else from Bias Buster, take these:

- **Audit the data before you trust the model.** EDA is not just a preprocessing step; it is a bias-detection tool.
- **Compare rates, not counts.** Group size can hide or exaggerate a disparity.
- **Test behavior, not just documentation.** A model's actual decisions matter more than what its feature list claims.
- **Accuracy is not fairness.** Always break metrics down by group.
- **Confidence is not correctness.** A model can be confidently biased.
- **Bias is sociotechnical.** It comes from data, features, objectives, deployment, and the world the system operates in — not just from a line of code.
- **Fairness requires a choice.** Demographic parity, equal opportunity, and equalized odds can conflict. Someone has to decide what the system is optimizing for, and that decision should be documented and justified.

If you were the bank, the response would not be to delete one column and call it fixed. You would investigate how the data was collected, whether the labels reflect real repayment or past human decisions, whether proxy features remain, and whether outcomes stay fair after deployment. You would also add monitoring, appeals, and human review for consequential decisions.

### Final Flag

`flag{education}`

Education is the feature that is biased, causing the model to prefer graduates over non-graduates.
