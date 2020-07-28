#!/usr/bin/env bash

git push --follow-tags origin master
npm build
npm publish --access public
