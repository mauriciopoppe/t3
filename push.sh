#!/usr/bin/env bash
gulp build
git commit -am "dist files updated"
git push origin master --tags
git push -f origin origin/master:gh-pages