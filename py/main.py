import os
import pandas as pd
import json

def main():
    PROJECT_DIR = os.getcwd()
    svg_list = os.listdir(f'{PROJECT_DIR}\\img\\svg')
    for i, elem in enumerate(svg_list):
        svg_list[i] = elem.split('.')[0]

    with open("mydata.json", "w") as final:
        json.dump(svg_list, final)
    return

if __name__ == "__main__":
    main()