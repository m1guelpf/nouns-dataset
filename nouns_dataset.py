from datasets import load_dataset

dataset = load_dataset("imagefolder", data_dir="./data", split="train")

dataset.push_to_hub('m1guelpf/nouns')
