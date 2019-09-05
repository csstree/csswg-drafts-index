# CSSWG spec drafts index

> Status: proof of concept

## Intro

Since CSS specs are currently on GitHub, it’s much easy to get latest state of specs and to contribute to them. At the same time all the specs are crafting by humans to humans. However, an information from the specs may be useful to various projects (such as [mdn/data](https://github.com/mdn/data)) as a source of truth. This project aims to extract as much as possible facts from CSSWG specs and provide it as a dictionary in JSON format. Beside that there is [a web interface](https://csstree.github.io/csswg-drafts-index/) to reveal a data structure and to get some sort of reports.

## How to start

```bash
npm install
npm start
```

To sync (clone/fetch) source repos manualy run:

```bash
npm run sync
```

To make a build:

```
npm build
```
