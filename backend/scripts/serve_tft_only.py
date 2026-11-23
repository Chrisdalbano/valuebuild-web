"""Serve only the TFT routes, for looking at them locally without MongoDB.

    cd backend && python -m scripts.serve_tft_only        # http://127.0.0.1:8011

The full app (app.py) needs MONGO_URI at startup; the TFT routes do not use
the database, so this mounts them alone. To try the match review with your
own key, set RIOT_API_KEY and TFT_REVIEW_RIOT_ID in the shell first. Do not
put a key in a file that is tracked by git.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from tft.routes import router  # noqa: E402

app = FastAPI(title="BuildValue TFT routes (local)")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8011)
