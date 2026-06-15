# How does an LLM "know" the sky is blue?

For most people, LLMs are a magic box that spews out language. Somehow, that language is very similar to "**what a human would say**". "LLMs work on neural networks", "LLMs predict the next words in a sentence", "They're trained on a large set of data", are some of the common things people say about these mysterious models. 

But **HOW**?? How can a machine, which was mostly working on logic, 1s and 0s, following instructions, how can that lead to such varied, random, and complex outputs in the form of language that is also mostly correct, not just structurally but also factually. What kind of logical steps can lead to "**human-like intelligence**"? 

> Hint: The answer says more about us than the machine.

But to understand that, for those who are unfamiliar with the working of a model, here's a brief introduction of how a LLM works at a bird's-eye view. For those familiar with it, can skip to [[#The Big Question.]]

# How LLMs work.

The most common conception of working of an LLM is that it predicts the next word. It is true, LLMs predicts what is called a Token, it is either a word or a part of a word. Some even go so far as to call LLMs a state-of-the-art auto complete.

> But we ask a question and it answers the question, how is that predicting the next word?? That is more like a conversation.

Yes, but behind the interface, there are two parts to programs like ChatGPT. There is the program, the plain old computer logic, and then there's the model. Model is what makes the predictions that we talked about above. The computer program interacts with the model. How it handles our prompts is that it makes a long string, like a dialogue between us and the model, and feed that to the model, so all the model sees is a dialogue a user has with a system, and apart from that a lot of other information, think of it as a PS. Thus, the model is just trying to "auto-complete" the dialogue writing.

The models are a result of fairly complex mathematics, but in use, a language model's role is to predict the next word. 

Raw next-token prediction is only the first stage of training. After that, models go through a process called fine-tuning — what it is is, humans rate thousands of model outputs for helpfulness and accuracy, and the model is adjusted to produce more of what gets rated highly. This is why the same underlying math that could generate Reddit comments can also answer your coding questions coherently. The base architecture learns language; the fine-tuning teaches it a job.

# The Big Question.

What almost no-one questions is how these models are so intelligent. Intelligent in the sense that "The sky is red" is just as grammatically correct as "The sky is blue". So if we feed the model "The sky is ", what is preventing it from predicting the word "red".

The mathematics we mentioned above that makes these models, what it does at a very bird's-eye view is it takes in a bunch of sentences, and the algorithm is trained to predict, given a fragment like "The sky is ", the word that should come next, "based on the examples I trained on". So, it takes in the sentences and "**according to those sentences**", it predicts the word. Thus the predictions depend on what sentences the maths was applied to to train the model.

In order to train the text models that we all know, we needed many such sentences. So, these sentences were scraped from books, blogs, websites, etc. The internet and the written literature was indeed a good source of human written sentences. So the models were trained on these. 

Now, the models know what a human would say given a set of words. And, a human is an intelligent being. Given the words "The sky is ", most humans in most situations would truthfully say "blue". Thus, the model doesn't actually know that the sky is blue. What the model knows is that a human would say the word "blue" after "The sky is " in most cases.

This is of-course a very high level view of how these models become smart. Whether this counts as 'knowing' is itself debated. But to me this idea that our language acts as a proxy to our intelligence is intriguing. How we communicate our thoughts inherently carries some essence of our intelligence, and through mimicking how we communicate, a machine can in-turn mimic the intelligence, the thoughts behind the language. 