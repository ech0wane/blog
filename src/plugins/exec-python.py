"""
Python execution wrapper for the blog's notebook-style code blocks.

Executes Python code from stdin, captures stdout and matplotlib figures,
and writes a JSON result to stdout with a special prefix marker.

Output format:
  __PYEXEC_RESULT__{"stdout": "...", "images": ["base64png...", ...], "error": "..."}
"""

import sys
import io
import json
import base64
import contextlib
import traceback


def main():
    code = sys.stdin.read()

    stdout_capture = io.StringIO()
    images = []
    error = None

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        has_matplotlib = True
    except ImportError:
        has_matplotlib = False

    try:
        with contextlib.redirect_stdout(stdout_capture):
            exec_globals = {"__name__": "__main__", "__builtins__": __builtins__}
            exec(compile(code, "<notebook>", "exec"), exec_globals)

        if has_matplotlib:
            import matplotlib.pyplot as plt
            fig_nums = plt.get_fignums()
            for fig_num in fig_nums:
                fig = plt.figure(fig_num)
                buf = io.BytesIO()
                fig.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                            facecolor="white", edgecolor="none")
                buf.seek(0)
                images.append(base64.b64encode(buf.read()).decode("ascii"))
                buf.close()
            plt.close("all")

    except Exception:
        error = traceback.format_exc()

    result = {
        "stdout": stdout_capture.getvalue(),
        "images": images,
        "error": error,
    }

    sys.stdout.write("__PYEXEC_RESULT__" + json.dumps(result))


if __name__ == "__main__":
    main()
