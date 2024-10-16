
<div align="center" style="font-weight: bold; font-size: 24px; font-family: Arial, sans-serif; padding: 20px;">
<svg viewBox="0 -2 24 24" width=24 fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.5" d="M3 22H21" stroke="#876464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 11C3 10.0572 3 9.58579 3.29289 9.29289C3.58579 9 4.05719 9 5 9C5.94281 9 6.41421 9 6.70711 9.29289C7 9.58579 7 10.0572 7 11V17C7 17.9428 7 18.4142 6.70711 18.7071C6.41421 19 5.94281 19 5 19C4.05719 19 3.58579 19 3.29289 18.7071C3 18.4142 3 17.9428 3 17V11Z" stroke="#876464" stroke-width="1.5"></path> <path d="M10 7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5C12.9428 5 13.4142 5 13.7071 5.29289C14 5.58579 14 6.05719 14 7V17C14 17.9428 14 18.4142 13.7071 18.7071C13.4142 19 12.9428 19 12 19C11.0572 19 10.5858 19 10.2929 18.7071C10 18.4142 10 17.9428 10 17V7Z" stroke="#876464" stroke-width="1.5"></path> <path d="M17 4C17 3.05719 17 2.58579 17.2929 2.29289C17.5858 2 18.0572 2 19 2C19.9428 2 20.4142 2 20.7071 2.29289C21 2.58579 21 3.05719 21 4V17C21 17.9428 21 18.4142 20.7071 18.7071C20.4142 19 19.9428 19 19 19C18.0572 19 17.5858 19 17.2929 18.7071C17 18.4142 17 17.9428 17 17V4Z" stroke="#876464" stroke-width="1.5"></path> </g></svg> GuidedStats
</div>

![UI](examples/overview.png)

GuidedStats assists users with statistical analyses through guided workflows. It automatically verifies assumptions and provides actionable suggestions. It is integrated into notebook coding environment, and exchanges dataset, model and results with the coding environment.

**Paper link**: [Guided Statistical Workflows with Interactive Explanations and Assumption Checking](arxiv.org/abs/2410.00365)


## Install (For Developers)

Tips: you can create a new conda environment to avoid any package conflicts.(Currently fixing errors in jupyter notebooks and jupyter lab>=4.0).

```
conda create -n test_env jupyter-packaging python=3.11 "jupyterlab<4.0"
```

First, install the package in editable mode

```
python -m pip install -e .
```

And enable widet frontend

```
# link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
```

To build the project

```
npm install
npm run build
```

To automatically rebuild the project after editing frontend code

```
npm run watch
```

To rebuild after editing python package, you need to restart the kernel.

## Install (For Users)

Testing...

## Usage

#### To start with
To initialize the UI, first we need to import `GuidedStats` and load the dataset into a Pandas DataFrame. Then we pass the DataFrame to `GuidedStats`.

```
from guidedstats import GuidedStats
import pandas as pd

df = pd.read_csv("california_housing.csv")
gs = GuidedStats(df)
gs
```

## Notice
1. Many thanks to **Will Epperson** and **Adam Perer** for their kind assistance in my first HCI paper and my early exploration of research interests.
2. I am currently focused on incorporating more statistical workflows to empirically demonstrate the scalability of our approach, and simplify the code structure as well.
3. As software development is not my primary field of study, I recognize that the code implementation has room for improvement 🙏. I greatly welcome and appreciate any advice or suggestions.

