import json
import glob
import os
from jsonmerge import Merger

os.chdir('./1_collect/situp') # directory of dataset

data_ls = []
for f in glob.glob("*.json"):
    print(f)
    with open(f, "rb") as infile:
        data_ls.append(json.load(infile))

schema = {
            "properties": {
                "data": {
                    "mergeStrategy": "append"
                }
            }
        }
merger = Merger(schema)
head = data_ls[0]
next = data_ls[1]
data_merge = merger.merge(head, next)

remain_data_len = len(data_ls) - 2
for i in range(remain_data_len):
    data_merge = merger.merge(data_merge, data_ls[i+2])

with open('situp_data.json', "w") as outfile:
    json.dump(data_merge, outfile)
