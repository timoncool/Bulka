import os
import json

def generate_json():
    data = {
        "_base": "https://raw.githubusercontent.com/Bubobubobubobubo/Dough-Amen/main/"
    }
    
    # Iterate through each directory in the current folder
    for dir_name, _, file_list in os.walk('.'):
        if dir_name == '.' or dir_name.startswith('./.'):
            continue
        dir_name = dir_name[2:]  # Remove the './' from the directory name
        data[dir_name] = []
        for file_name in file_list:
            if file_name.lower().endswith('.wav'):
                data[dir_name].append(f"{dir_name}/{file_name}")
    with open('strudel.json', 'w') as json_file:
        # Minify if possible
        json.dump(data, json_file, separators=(',', ':'))

if __name__ == "__main__":
    generate_json()

