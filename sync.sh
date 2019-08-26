#!/bin/bash

if [ ! -d "csswg-drafts" ]; then
    echo "Pulling csswg-drafts..."
    git clone https://github.com/w3c/csswg-drafts.git
else
    cd csswg-drafts
    git pull
    cd ..
fi

if [ ! -d "real-web-css" ]; then
    echo "Pulling real-web-css..."
    git clone https://github.com/csstree/real-web-css
else
    cd real-web-css
    git pull
    cd ..
fi
