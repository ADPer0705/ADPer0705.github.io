**ML and EDA based CTF question**

**Category**: Machine Learning and Exploratory Data Analysis

**CTF Event:** AIML Club, NFSU (Jan 29, 2025)

**Challenge Name**: Bias Buster

**Attachements**: Bias_Buster.zip containing

- `biased_loan_approval_dataset.csv`
- `biased_loan_approval_model.pkl`
- `README.md`
- `requirements.txt`
- `test_cases.json`
- `test_model.py`

### Analysis

Here’s what the README.md file had to say :

# Loan Approval Bias Detection Challenge  
  
## Overview  
Imagine you work at FinTrust Bank, a leading financial institution known for its innovative loan services. Recently, the bank adopted a cutting-edge machine-learning model to automate loan approvals. However, customers have started complaining that the system is unfairly rejecting certain applications.  
  
The management suspects that the model might be biased against certain groups, and they've hired you as a data science detective to uncover the truth!  
  
## Files Provided  
- `biased_loan_approval_dataset.csv`: The dataset used to train the loan approval model.  
- `biased_loan_approval_model.pkl`: The trained loan approval model that the bank is currently using.  
- `test_model.py`: A Python script to test the model's behavior with custom inputs.  
- `test_cases.json`: A JSON file containing test cases to simulate the model input and output  
  
The necessary python libraries are listed in `requirements.txt`  
  
## Challenge Tasks  
1. Analyze the dataset for patterns or disparities in loan approvals across different groups.  
2. Test the model with the provided script to simulate how it processes different applications.  
3. Determine which feature in the dataset is causing biased decisions.  
4. Submit the biased feature as the flag in the format: flag{feature_name}.  
  
For example, if you find that the `no_of_dependents` feature has a bias to prefer less no of dependents, the the flag is `flag{no_of_dependents}`.  
  
## Success Criteria  
You successfully complete the challenge when:  
- You identify the biased feature accurately.  
- You submit the flag in the correct format (`flag{feature_name}`).  
  
## Hints  
- Compare approval rates between different demographics in the dataset.  
- Modify single features in identical applications to observe and verify the model's decision changes.  
  
Good luck, and may the most unbiased detective win! 🚀

So we’re given a dataset, a model trained on that dataset, and a python script for generating output from the model, using the test cases provided in the `json` file. Here is what we get upon running the testing python script after installing all the required libraries :

![[Pasted image.png]]

running the `test_model.py script`

As we can see we’re getting a binary answer, whether the loan is `Approved` or `Rejected` , along with a percentage of `Confidence`

Now, we’re told that a certain feature has biased data, causing the model to make biased approvals, and we’re supposed to find that data. You can play around, tinkering with the test cases in json, trying to find out different values for various parameters.

#### 1. Examine the dataset

When we open the `CSV` file we can see that there are 13 features, 12 inputs

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

and the final output is in

- loan_status

![[Pasted image (2).png]]

biased_loan_approval_dataset.csv

#### 2. Detect Bias

Now, we know that for a feature to be biased, there must be an imbalance in how the various values of features corrosponds to the outcome (`loan_status`). To see this, you can either make a visual representation, or we can simply do `.groupby()` .

![[Pasted image (3).png]]

doing groupby on various features

Upon doing `.groupby()` on various features, we can see that while the others seem to be balanced, there is a noticable bias in the `education` feature. The `loan_status` is `Approved` for majority of the Graduates, and at the same time it is `Rejected` for majority of `Not Graduate`s.

And that is our flag, `flag{education}` . Education is the feature that is biased, favoring Graduates over Non Graduates.

### Final Flag

`flag{education}`

Education is the feature that is biased, causing the model to prefer graduates over non-graduates.
