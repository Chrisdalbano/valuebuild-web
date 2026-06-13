"""AI enrichment package — Gemini-Flash-powered effect valuation + research digest.

All Gemini access lives here, server-side only. The frontend never holds the key;
results are cached in MongoDB (`ai_analysis` collection) and served from cache.
"""
