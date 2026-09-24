---
title: "Why I keep a bilingual personal site"
date: 2025-10-12
tags: [writing, i18n, design]
excerpt: "Bilingual is not just translating everything twice — it shapes your URL structure, your SEO and how you write."
---

People ask me whether a personal site really needs two languages. My answer: if you have readers in both, yes.

## It is not just translation

Machine-translating Chinese posts into English usually produces something nobody wants to read. Three things actually matter:

1. **Structure**: each language needs its own URLs, like `/zh/blog/` and `/en/blog/`, rather than a client-side toggle
2. **Pairing**: the two versions of one article should point at each other with `hreflang`, so search engines understand they are the same page
3. **Strategy**: let the languages differ in length — long-form in one, short notes in the other, instead of forcing them to match

## The switch button

The switch in the corner should take you to *the other language of the current page*, not dump you back home.

One detail worth handling: if an article has no counterpart in the other language, fall back to that language's blog index instead of showing a 404.

## On writing

> Writing is how you find out what you actually think. If you are stuck, it is usually not a wording problem — it is a thinking problem.

My current rule: **write in Chinese first, then decide which pieces deserve an English rewrite.**

## Summary

- Split URLs by language: `/zh/`, `/en/`
- Pair pages with `hreflang`
- Language switching should stay on the current page
- The two languages can move at different rhythms

Get those right and a bilingual site stops being overhead — it becomes a second front door.
