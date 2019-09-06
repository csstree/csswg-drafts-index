# CSSWG spec drafts index

> Status: proof of concept

## Intro

Since [CSS Working Group specs](https://github.com/w3c/csswg-drafts) are on GitHub for a while, it's much easy to get latest state of the specs and to contribute to them. At the same time an information from the specs may be useful to various projects (such as [mdn/data](https://github.com/mdn/data)) as a source of truth. However, all the specs are crafting by humans to humans, so it's hard to fetch something from a spec for machines (programs). This project aims to extract as much as possible facts from CSSWG specs and provide them as a dictionary in JSON format. Beside that there is [a web interface](https://csstree.github.io/csswg-drafts-index/) to reveal data itself and its structure.

## How to start

```
npm install
npm start
```

To sync (clone/fetch) source repos manualy run:

```
npm run sync
```

To make a build (output to `/docs`):

```
npm run build
```
