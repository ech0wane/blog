---
author: "amir"
pubDatetime: 2025-06-28T12:00:00.00
title: "Python Notebook Blocks in Blog Posts"
featured: false
draft: false
archived: false
tags:
  - python
  - demo
  - notebook
description: "Demonstrating Jupyter-like executable Python blocks with rendered output and matplotlib plots."
---

## Table of Contents

## Introduction

This blog now supports **executable Python code blocks** — similar to Jupyter notebooks. Any fenced code block tagged with `` `python exec` `` will be executed at build time. The captured stdout and any matplotlib figures are rendered directly below the code.

## Basic Output

A simple `print()` call is all you need:

```python exec
for i in range(5):
    print(f"Hello from Python! Iteration {i}")
```

## Data Processing

You can do real computation — list comprehensions, math, formatting:

```python exec
import math

primes = []
for n in range(2, 50):
    if all(n % d != 0 for d in range(2, int(math.sqrt(n)) + 1)):
        primes.append(n)

print(f"Primes under 50: {primes}")
print(f"Count: {len(primes)}")
print(f"Sum:   {sum(primes)}")
```

## Matplotlib — Line Plot

Full matplotlib support, rendered as inline images:

```python exec
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 4 * np.pi, 300)

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, np.sin(x), label="sin(x)", linewidth=2)
ax.plot(x, np.cos(x), label="cos(x)", linewidth=2, linestyle="--")
ax.set_title("Sine & Cosine Waves")
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend()
ax.grid(True, alpha=0.3)
fig.tight_layout()
```

## Matplotlib — Bar Chart

```python exec
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

languages = ["Python", "Rust", "Go", "TypeScript", "C++"]
popularity = [85, 45, 55, 75, 60]
colors = ["#306998", "#CE412B", "#00ADD8", "#3178C6", "#00599C"]

fig, ax = plt.subplots(figsize=(7, 4))
bars = ax.bar(languages, popularity, color=colors, edgecolor="white", linewidth=1.2)
ax.set_ylabel("Popularity Score")
ax.set_title("Language Popularity (totally scientific)")
ax.set_ylim(0, 100)

for bar, val in zip(bars, popularity):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2,
            str(val), ha="center", va="bottom", fontweight="bold")

fig.tight_layout()
```

## Matplotlib — Scatter + Histogram

Multiple figures from a single block are all captured:

```python exec
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(42)

x = rng.normal(0, 1, 200)
y = 0.6 * x + rng.normal(0, 0.5, 200)

fig1, ax1 = plt.subplots(figsize=(6, 5))
ax1.scatter(x, y, alpha=0.6, c=y, cmap="viridis", edgecolors="white", linewidth=0.5)
ax1.set_title("Correlated Scatter Plot")
ax1.set_xlabel("X")
ax1.set_ylabel("Y")
fig1.tight_layout()

fig2, ax2 = plt.subplots(figsize=(6, 4))
ax2.hist(x, bins=25, color="#0b9257", edgecolor="white", alpha=0.85, label="X")
ax2.hist(y, bins=25, color="#306998", edgecolor="white", alpha=0.65, label="Y")
ax2.set_title("Distribution of X and Y")
ax2.legend()
fig2.tight_layout()
```

## Combining Print + Plots

Text output and figures coexist naturally:

```python exec
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

data = np.random.default_rng(0).exponential(2, 1000)
print(f"Mean:   {data.mean():.4f}")
print(f"Median: {np.median(data):.4f}")
print(f"Std:    {data.std():.4f}")
print(f"Max:    {data.max():.4f}")

fig, ax = plt.subplots(figsize=(7, 4))
ax.hist(data, bins=40, color="#00ff41", edgecolor="#2b2b2b", alpha=0.9)
ax.axvline(data.mean(), color="red", linestyle="--", linewidth=2, label=f"Mean = {data.mean():.2f}")
ax.axvline(np.median(data), color="blue", linestyle="--", linewidth=2, label=f"Median = {np.median(data):.2f}")
ax.set_title("Exponential Distribution (λ=2)")
ax.legend()
fig.tight_layout()
```

## Error Handling

Errors are caught and displayed gracefully — they won't break the build:

```python exec
result = 1 / 0
```

## Conclusion

With the `` `python exec` `` tag on any fenced code block, this blog can now render:

- **Text output** from `print()` statements
- **Matplotlib figures** (line plots, bar charts, scatter plots, histograms, etc.)
- **Error tracebacks** when something goes wrong

All execution happens at **build time** — no client-side Python runtime needed.
